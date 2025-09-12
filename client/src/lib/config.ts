// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const config = {
  apiUrl: API_BASE_URL,
  wsUrl: import.meta.env.VITE_WS_URL || 
    (import.meta.env.DEV ? 'ws://localhost:5000' : `wss://${window.location.host}`)
};

export function getApiUrl(path: string): string {
  return `${config.apiUrl}${path}`;
} 