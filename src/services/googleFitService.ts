/**
 * Google Fit API Service
 * Provides methods to interact with Google Fit APIs using access tokens
 */

export class GoogleFitService {
  private static readonly BASE_URL = 'https://www.googleapis.com/fitness/v1/users/me';

  /**
   * Get user's Google Fit data sources
   */
  static async getDataSources(accessToken: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/dataSources`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Google Fit Data Sources:', data);
      return data;
    } catch (error) {
      console.error('Error fetching Google Fit data sources:', error);
      throw error;
    }
  }

  /**
   * Get step count data from Google Fit
   */
  static async getStepCount(accessToken: string, startTimeMillis: number, endTimeMillis: number) {
    try {
      const requestBody = {
        aggregateBy: [
          {
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
          }
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis: startTimeMillis.toString(),
        endTimeMillis: endTimeMillis.toString()
      };

      const response = await fetch(`${this.BASE_URL}/dataset:aggregate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Google Fit Step Count Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching Google Fit step count:', error);
      throw error;
    }
  }

  /**
   * Get heart rate data from Google Fit
   */
  static async getHeartRate(accessToken: string, startTimeMillis: number, endTimeMillis: number) {
    try {
      const requestBody = {
        aggregateBy: [
          {
            dataTypeName: 'com.google.heart_rate.bpm'
          }
        ],
        bucketByTime: { durationMillis: 3600000 }, // 1 hour buckets
        startTimeMillis: startTimeMillis.toString(),
        endTimeMillis: endTimeMillis.toString()
      };

      const response = await fetch(`${this.BASE_URL}/dataset:aggregate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Google Fit Heart Rate Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching Google Fit heart rate:', error);
      throw error;
    }
  }

  /**
   * Get sleep data from Google Fit
   */
  static async getSleepData(accessToken: string, startTimeMillis: number, endTimeMillis: number) {
    try {
      const requestBody = {
        aggregateBy: [
          {
            dataTypeName: 'com.google.sleep.segment'
          }
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis: startTimeMillis.toString(),
        endTimeMillis: endTimeMillis.toString()
      };

      const response = await fetch(`${this.BASE_URL}/dataset:aggregate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Google Fit Sleep Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching Google Fit sleep data:', error);
      throw error;
    }
  }

  /**
   * Get user's basic profile from Google Fit
   */
  static async getUserProfile(accessToken: string) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Google User Profile:', data);
      return data;
    } catch (error) {
      console.error('Error fetching Google user profile:', error);
      throw error;
    }
  }

  /**
   * Test Google Fit API access with basic data retrieval
   */
  static async testGoogleFitAccess(accessToken: string) {
    try {
      console.log('Testing Google Fit API access...');
      
      // Test 1: Get data sources
      await this.getDataSources(accessToken);
      
      // Test 2: Get step count for the last 7 days
      const endTime = Date.now();
      const startTime = endTime - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      await this.getStepCount(accessToken, startTime, endTime);
      
      console.log('Google Fit API access test completed successfully!');
      return true;
    } catch (error) {
      console.error('Google Fit API access test failed:', error);
      return false;
    }
  }
}