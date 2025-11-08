/// <reference types="vite/client" />

/**
 * Frontend environment config.
 * - VITE_API_URL should point to your backend API (https://localhost:7125 for the attached API).
 * - VITE_GOOGLE_CLIENT_ID should be the Google ClientId (do NOT put ClientSecret here).
 *
 * Example .env:
 * VITE_API_URL=https://localhost:7125
 * VITE_GOOGLE_CLIENT_ID=699206291871-pdv6amuetllvv28eplekjabbf1rsug8m.apps.googleusercontent.com
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:7125',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '699206291871-pdv6amuetllvv28eplekjabbf1rsug8m.apps.googleusercontent.com',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA4BeSk5E0udi5GioWK9kU4lu38lfoC-O0',
} as const;

export const endpoints = {
  auth: {
    google: '/api/auth/google',
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
  },
  health: {
    data: '/api/googlehealth/data',
    sync: '/api/googlehealth/sync',
  },
  symptoms: {
    analyze: '/api/symptoms/analyze',
    submit: '/api/symptoms/submit',
  },
  appointments: {
    book: '/api/appointments/book',
    list: '/api/appointments',
  },
  outbreaks: {
    list: '/api/outbreaks',
    alerts: '/api/outbreaks/alerts',
  },
  doctors: {
    search: '/api/Doctors/search',
    list: '/api/Doctors/search',
    details: (id: number) => `/api/Doctors/${id}`,
  },
} as const;