import { ApiService } from '../utils/api';
import { endpoints } from '../config/env';

export interface GoogleHealthSyncRequest {
  accessToken: string;
  startDate: string;
  endDate: string;
  dataTypes: string[];
}

export interface HeartRateReading {
  timestamp: string;
  beatsPerMinute: number;
  source: string;
}

export interface HeartRateData {
  currentHeartRate: number;
  restingHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  readings: HeartRateReading[];
  lastUpdated: string;
}

export interface ActivityData {
  todaySteps: number;
  todayDistance: number;
  todayCaloriesBurned: number;
  todayActiveMinutes: number;
  recentActivities: any[];
  goals: {
    dailyStepsGoal: number;
    dailyActiveMinutesGoal: number;
    dailyCaloriesGoal: number;
  };
}

export interface StressReading {
  timestamp: string;
  stressLevel: number;
  hrv: number;
  source: string;
}

export interface StressLevelData {
  currentStressLevel: number;
  stressCategory: string;
  heartRateVariability: number;
  readings: StressReading[];
  lastUpdated: string;
}

export interface GoogleHealthSyncResponse {
  userId: string;
  syncedAt: string;
  heartRate: HeartRateData | null;
  bloodPressure: any | null;
  oxygenSaturation: any | null;
  bodyTemperature: any | null;
  sleep: any | null;
  activity: ActivityData | null;
  respiratory: any | null;
  stressLevel: StressLevelData | null;
}

export class GoogleHealthService {
  /**
   * Sync Google Health data for a user
   */
  static async syncHealthData(request: GoogleHealthSyncRequest): Promise<GoogleHealthSyncResponse> {
    try {
      const response = await ApiService.post(endpoints.health.sync, request) as GoogleHealthSyncResponse;
      console.log('Google Health sync response:', response);
      return response;
    } catch (error) {
      console.error('Error syncing Google Health data:', error);
      throw error;
    }
  }

  /**
   * Get health data for the last 24 hours
   */
  static async getRecentHealthData(accessToken: string): Promise<GoogleHealthSyncResponse> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const request: GoogleHealthSyncRequest = {
      accessToken,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dataTypes: ['heart_rate', 'activity', 'stress', 'sleep', 'body_temperature']
    };

    return this.syncHealthData(request);
  }

  /**
   * Get health data for a custom date range
   */
  static async getHealthDataRange(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    dataTypes: string[] = ['heart_rate', 'activity', 'stress']
  ): Promise<GoogleHealthSyncResponse> {
    const request: GoogleHealthSyncRequest = {
      accessToken,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dataTypes
    };

    return this.syncHealthData(request);
  }

  /**
   * Parse heart rate status based on current reading
   */
  static getHeartRateStatus(currentRate: number, restingRate: number): 'normal' | 'elevated' | 'high' | 'low' {
    if (currentRate < 60) return 'low';
    if (currentRate > restingRate + 30) return 'elevated';
    if (currentRate > 100) return 'high';
    return 'normal';
  }

  /**
   * Parse stress level category to status
   */
  static getStressStatus(stressLevel: number): 'low' | 'moderate' | 'high' | 'very_high' {
    if (stressLevel < 25) return 'low';
    if (stressLevel < 50) return 'moderate';
    if (stressLevel < 75) return 'high';
    return 'very_high';
  }

  /**
   * Convert Google Health response to HealthMetrics format
   */
  static convertToHealthMetrics(googleData: GoogleHealthSyncResponse): any {
    const currentTime = new Date();
    
    return {
      heartRate: googleData.heartRate ? {
        current: googleData.heartRate.currentHeartRate,
        resting: googleData.heartRate.restingHeartRate,
        max: googleData.heartRate.maxHeartRate,
        status: this.getHeartRateStatus(
          googleData.heartRate.currentHeartRate,
          googleData.heartRate.restingHeartRate
        ),
        lastReading: new Date(googleData.heartRate.lastUpdated)
      } : {
        current: 72,
        resting: 65,
        max: 180,
        status: 'normal' as const,
        lastReading: currentTime
      },
      
      bloodPressure: {
        systolic: 120,
        diastolic: 80,
        status: 'normal' as const,
        lastReading: currentTime
      },
      
      oxygenSaturation: {
        percentage: 98,
        status: 'normal' as const,
        lastReading: currentTime
      },
      
      bodyTemperature: {
        celsius: 36.5,
        fahrenheit: 97.7,
        status: 'normal' as const,
        lastReading: currentTime
      },
      
      sleepData: {
        hoursLastNight: 7.5,
        quality: 'good' as const,
        deepSleepMinutes: 90,
        remSleepMinutes: 112,
        lastUpdated: new Date(currentTime.getTime() - 8 * 3600000)
      },
      
      activityLevel: googleData.activity ? {
        steps: googleData.activity.todaySteps,
        activeMinutes: googleData.activity.todayActiveMinutes,
        caloriesBurned: googleData.activity.todayCaloriesBurned,
        lastSync: new Date(googleData.syncedAt)
      } : {
        steps: 0,
        activeMinutes: 0,
        caloriesBurned: 0,
        lastSync: currentTime
      },
      
      respiratoryRate: {
        breathsPerMinute: 16,
        status: 'normal' as const,
        lastReading: currentTime
      },
      
      stressLevel: googleData.stressLevel ? {
        score: googleData.stressLevel.currentStressLevel,
        status: this.getStressStatus(googleData.stressLevel.currentStressLevel),
        lastUpdated: new Date(googleData.stressLevel.lastUpdated)
      } : {
        score: 30,
        status: 'low' as const,
        lastUpdated: currentTime
      }
    };
  }
}