import { ApiService } from '../utils/api';
import { endpoints } from '../config/env';
import { Symptom } from '../types/doctor';

export class HealthDataService {
  static async fetchGoogleHealthData(userId: string) {
    try {
      const res = await ApiService.get(`${endpoints.health.data}/${userId}`);
      return res?.data ?? null;
    } catch (e) {
      console.error('fetchGoogleHealthData', e);
      return null;
    }
  }

  static async syncGoogleHealthData(userId: string) {
    try {
      const res = await ApiService.post(`${endpoints.health.sync}/${userId}`, {});
      return !!res?.success;
    } catch (e) {
      console.error('syncGoogleHealthData', e);
      return false;
    }
  }
}
