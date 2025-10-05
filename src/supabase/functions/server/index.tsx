import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Health Data Routes
app.post('/make-server-a6004561/google-health/token', async (c) => {
  try {
    const { code, userId } = await c.req.json();
    
    if (!code || !userId) {
      return c.json({ error: 'Missing authorization code or user ID' }, 400);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.log('Google token exchange error:', tokenData);
      return c.json({ error: 'Failed to exchange authorization code' }, 400);
    }

    // Store tokens securely
    await kv.set(`google_tokens_${userId}`, tokenData);
    
    return c.json({ 
      success: true,
      message: 'Google Health access granted successfully' 
    });
  } catch (error) {
    console.log('Error processing Google token:', error);
    return c.json({ error: 'Internal server error during token processing' }, 500);
  }
});

app.get('/make-server-a6004561/google-health/data/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const tokens = await kv.get(`google_tokens_${userId}`);
    
    if (!tokens) {
      return c.json({ error: 'User not connected to Google Health' }, 401);
    }

    // Refresh token if needed
    let accessToken = tokens.access_token;
    if (tokens.expires_in && Date.now() > tokens.created_at + (tokens.expires_in * 1000)) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: tokens.refresh_token,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;
        await kv.set(`google_tokens_${userId}`, { ...tokens, ...refreshData, created_at: Date.now() });
      }
    }

    // Fetch health data from Google Fit API
    const healthData = await fetchGoogleHealthData(accessToken);
    
    return c.json({ success: true, data: healthData });
  } catch (error) {
    console.log('Error fetching Google Health data:', error);
    return c.json({ error: 'Failed to fetch health data' }, 500);
  }
});

app.post('/make-server-a6004561/health-data/manual', async (c) => {
  try {
    const { userId, data } = await c.req.json();
    
    if (!userId || !data) {
      return c.json({ error: 'Missing user ID or health data' }, 400);
    }

    // Store manual health data
    const timestamp = Date.now();
    await kv.set(`manual_health_${userId}_${timestamp}`, {
      ...data,
      timestamp,
      source: 'manual'
    });
    
    return c.json({ success: true, message: 'Health data saved successfully' });
  } catch (error) {
    console.log('Error saving manual health data:', error);
    return c.json({ error: 'Failed to save health data' }, 500);
  }
});

app.get('/make-server-a6004561/health-data/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get manual health data
    const manualData = await kv.getByPrefix(`manual_health_${userId}_`);
    
    // Get Google health data if available
    const tokens = await kv.get(`google_tokens_${userId}`);
    let googleData = null;
    
    if (tokens) {
      const healthResponse = await fetch(`/make-server-a6004561/google-health/data/${userId}`, {
        headers: { 'Authorization': c.req.header('Authorization')! }
      });
      if (healthResponse.ok) {
        const result = await healthResponse.json();
        googleData = result.data;
      }
    }
    
    return c.json({
      success: true,
      data: {
        manual: manualData || [],
        google: googleData
      }
    });
  } catch (error) {
    console.log('Error fetching health data history:', error);
    return c.json({ error: 'Failed to fetch health data history' }, 500);
  }
});

// Disease Outbreak Routes
app.get('/make-server-a6004561/disease-outbreaks/global', async (c) => {
  try {
    // WHO Disease Outbreak News API
    const whoResponse = await fetch('https://extranet.who.int/publicemergency/api/pheics.json');
    let whoData = [];
    
    if (whoResponse.ok) {
      whoData = await whoResponse.json();
    }

    // ProMED-mail API alternative (mock for now - would need real API key)
    const promedicData = await fetchPromedicOutbreaks();
    
    return c.json({
      success: true,
      data: {
        who: whoData,
        promedic: promedicData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.log('Error fetching global disease outbreaks:', error);
    return c.json({ error: 'Failed to fetch outbreak data' }, 500);
  }
});

app.get('/make-server-a6004561/disease-outbreaks/local/:country', async (c) => {
  try {
    const country = c.req.param('country');
    
    // CDC API for US data
    if (country.toLowerCase() === 'us' || country.toLowerCase() === 'usa') {
      const cdcData = await fetchCDCOutbreaks();
      return c.json({
        success: true,
        data: cdcData,
        country: 'United States',
        lastUpdated: new Date().toISOString()
      });
    }
    
    // European CDC for European countries
    if (['uk', 'france', 'germany', 'italy', 'spain'].includes(country.toLowerCase())) {
      const ecdcData = await fetchECDCOutbreaks(country);
      return c.json({
        success: true,
        data: ecdcData,
        country: country,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Fallback to WHO regional data
    const whoRegionalData = await fetchWHORegionalData(country);
    return c.json({
      success: true,
      data: whoRegionalData,
      country: country,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.log('Error fetching local disease outbreaks:', error);
    return c.json({ error: 'Failed to fetch local outbreak data' }, 500);
  }
});

// Helper Functions
async function fetchGoogleHealthData(accessToken: string) {
  const healthData: {
    heartRate: { value: any; timestamp: Date; unit: string } | null;
    bloodPressure: { systolic: number; diastolic: number; timestamp: Date; unit: string } | null;
    bodyWeight: { value: number; timestamp: Date; unit: string } | null;
    steps: { value: number; period: string; unit: string } | null;
    sleep: { averageDuration: number; unit: string; sessions: { duration: number; date: Date }[] } | null;
  } = {
    heartRate: null,
    bloodPressure: null,
    bodyWeight: null,
    steps: null,
    sleep: null
  };

  try {
    // Fetch different types of health data
    const dataTypes = [
      'com.google.heart_rate.bpm',
      'com.google.blood_pressure',
      'com.google.weight',
      'com.google.step_count.delta',
      'com.google.sleep.segment'
    ];

    const endTime = Date.now();
    const startTime = endTime - (7 * 24 * 60 * 60 * 1000); // 7 days ago

    for (const dataType of dataTypes) {
      const response = await fetch(`https://www.googleapis.com/fitness/v1/users/me/dataset/${dataType}/${startTime * 1000000}-${endTime * 1000000}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        switch (dataType) {
          case 'com.google.heart_rate.bpm':
            healthData.heartRate = processHeartRateData(data);
            break;
          case 'com.google.blood_pressure':
            healthData.bloodPressure = processBloodPressureData(data);
            break;
          case 'com.google.weight':
            healthData.bodyWeight = processWeightData(data);
            break;
          case 'com.google.step_count.delta':
            healthData.steps = processStepsData(data);
            break;
          case 'com.google.sleep.segment':
            healthData.sleep = processSleepData(data);
            break;
        }
      }
    }
  } catch (error) {
    console.log('Error fetching specific Google Health data:', error);
  }

  return healthData;
}

function processHeartRateData(data: any) {
  if (!data.point || data.point.length === 0) return null;
  
  const latestPoint = data.point[data.point.length - 1];
  return {
    value: latestPoint.value[0].fpVal,
    timestamp: new Date(parseInt(latestPoint.endTimeNanos) / 1000000),
    unit: 'bpm'
  };
}

function processBloodPressureData(data: any) {
  if (!data.point || data.point.length === 0) return null;
  
  const latestPoint = data.point[data.point.length - 1];
  return {
    systolic: latestPoint.value[0].fpVal,
    diastolic: latestPoint.value[1].fpVal,
    timestamp: new Date(parseInt(latestPoint.endTimeNanos) / 1000000),
    unit: 'mmHg'
  };
}

function processWeightData(data: any) {
  if (!data.point || data.point.length === 0) return null;
  
  const latestPoint = data.point[data.point.length - 1];
  return {
    value: latestPoint.value[0].fpVal,
    timestamp: new Date(parseInt(latestPoint.endTimeNanos) / 1000000),
    unit: 'kg'
  };
}

function processStepsData(data: any) {
  if (!data.point || data.point.length === 0) return null;
  
  const totalSteps = data.point.reduce((sum: number, point: any) => sum + point.value[0].intVal, 0);
  return {
    value: totalSteps,
    period: '7 days',
    unit: 'steps'
  };
}

function processSleepData(data: any) {
  if (!data.point || data.point.length === 0) return null;
  
  const sleepSessions = data.point.map((point: any) => ({
    duration: (parseInt(point.endTimeNanos) - parseInt(point.startTimeNanos)) / 1000000 / 1000 / 60, // minutes
    date: new Date(parseInt(point.startTimeNanos) / 1000000)
  }));
  
  const avgSleep = sleepSessions.reduce((sum: number, session: any) => sum + session.duration, 0) / sleepSessions.length;
  
  return {
    averageDuration: avgSleep,
    unit: 'minutes',
    sessions: sleepSessions.slice(-7) // Last 7 sessions
  };
}

async function fetchPromedicOutbreaks() {
  // Mock ProMED data - would need real API integration
  return [
    {
      id: '1',
      title: 'H5N1 Avian Influenza - Multiple Countries',
      description: 'Ongoing surveillance of H5N1 cases in poultry and wild birds',
      countries: ['Vietnam', 'Cambodia', 'China'],
      severity: 'Medium',
      lastUpdated: '2024-12-19T10:00:00Z'
    },
    {
      id: '2',
      title: 'Mpox Cases - Democratic Republic of Congo',
      description: 'Increased cases reported in eastern provinces',
      countries: ['Democratic Republic of Congo'],
      severity: 'High',
      lastUpdated: '2024-12-18T15:30:00Z'
    }
  ];
}

async function fetchCDCOutbreaks() {
  try {
    // CDC API for current outbreaks (mock structure)
    return [
      {
        id: 'cdc-001',
        title: 'Seasonal Influenza Activity',
        description: 'Elevated flu activity reported across multiple states',
        states: ['California', 'Texas', 'New York', 'Florida'],
        severity: 'Medium',
        lastUpdated: '2024-12-19T12:00:00Z',
        source: 'CDC'
      },
      {
        id: 'cdc-002',
        title: 'Foodborne Illness Investigation',
        description: 'Multi-state outbreak linked to contaminated produce',
        states: ['Arizona', 'Nevada', 'Utah'],
        severity: 'High',
        lastUpdated: '2024-12-18T18:45:00Z',
        source: 'CDC'
      }
    ];
  } catch (error) {
    console.log('Error fetching CDC data:', error);
    return [];
  }
}

async function fetchECDCOutbreaks(country: string) {
  // Mock ECDC data
  return [
    {
      id: 'ecdc-001',
      title: 'Respiratory Infections Surveillance',
      description: 'Weekly surveillance report on respiratory infections',
      country: country,
      severity: 'Low',
      lastUpdated: '2024-12-19T09:00:00Z',
      source: 'ECDC'
    }
  ];
}

async function fetchWHORegionalData(country: string) {
  // Mock WHO regional data
  return [
    {
      id: 'who-regional-001',
      title: 'Regional Health Update',
      description: `Weekly epidemiological update for ${country}`,
      country: country,
      severity: 'Low',
      lastUpdated: '2024-12-19T08:00:00Z',
      source: 'WHO Regional Office'
    }
  ];
}

// Replace Deno.serve with Node.js-compatible HTTP server
import { createServer } from 'http';

import { Readable } from 'stream';

createServer(async (req, res) => {
  const body = req.method === 'GET' || req.method === 'HEAD' ? null : Readable.toWeb(req);
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers as HeadersInit,
    //body: body ? Readable.toWeb(req)?.getReader() : null,
  });

  const honoResponse = await app.fetch(request);
  res.writeHead(honoResponse.status, Object.fromEntries(honoResponse.headers));
  res.end(await honoResponse.text());
}).listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});