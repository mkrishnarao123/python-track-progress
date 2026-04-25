import axios from 'axios';
import { requestFinished, requestStarted } from '../store/loadingSlice';

const API_BASE_URL = (process.env.REACT_APP_BASE_API_URL || '').trim().replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let interceptorsConfigured = false;

export function setupApiLoadingInterceptors(store) {
  if (interceptorsConfigured) {
    return;
  }

  apiClient.interceptors.request.use(
    (config) => {
      if (!config?.skipGlobalLoading) {
        store.dispatch(requestStarted());
      }
      return config;
    },
    (error) => {
      store.dispatch(requestFinished());
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      if (!response?.config?.skipGlobalLoading) {
        store.dispatch(requestFinished());
      }
      return response;
    },
    (error) => {
      if (!error?.config?.skipGlobalLoading) {
        store.dispatch(requestFinished());
      }
      return Promise.reject(error);
    }
  );

  interceptorsConfigured = true;
}

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_BASE_API_URL is not set. Auth requests may fail until .env is loaded.');
}
