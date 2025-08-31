// api.js
// Enhanced API service layer with retry logic, progress tracking, and improved error handling

import axios from 'axios';

// Enhanced timeout helper with retry logic
const createClient = ({ baseURL, timeout = 15000, withCredentials = true } = {}) => {
  const client = axios.create({
    baseURL,
    timeout,
    withCredentials,
    headers: {
      'Accept': 'application/json'
    }
  });

  // Response interceptor with retry logic
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const config = error.config;
      if (!config || !config.retry) {
        config.retry = 0;
        config.retryDelay = 3000; // 3 seconds for Render cold starts
        config.maxRetries = 3;
      }

      // Retry logic for network errors or 503 (Render cold start)
      if (
        (!error.response || error.response.status === 503) &&
        config.retry < config.maxRetries
      ) {
        config.retry += 1;
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        return client(config);
      }

      // Normalize error
      if (error.response) {
        const { status, data } = error.response;
        return Promise.reject({
          status,
          data,
          message: data?.detail || data?.message || error.message
        });
      } else if (error.request) {
        return Promise.reject({
          status: null,
          data: null,
          message: 'No response from server. Possible network error or CORS issue.'
        });
      }
      return Promise.reject({ status: null, data: null, message: error.message });
    }
  );

  return client;
};

// Initialize client using Vite environment variables at import time
const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export const apiClient = createClient({ baseURL: getBaseUrl() });

// Enhanced API functions with progress tracking
export const uploadDocument = async ({ file, filename, clausesData = null, onProgress, timeout = 60000 }) => {
  const form = new FormData();
  form.append('filename', filename);
  form.append('file', file);
  if (clausesData) form.append('clauses_data', JSON.stringify(clausesData));

  return apiClient.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout,
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });
};

export const fullAnalyze = async ({ file, timeout = 60000 }) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post('/api/full-analyze/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout
  });
};

export const analyzeClause = async ({ clause, timeout = 15000 }) => {
  return apiClient.post('/api/analyze-clause/', { clause }, { timeout });
};

export const listDocuments = async ({ skip = 0, limit = 10, timeout = 10000 } = {}) => {
  return apiClient.get('/api/documents/', { params: { skip, limit }, timeout });
};

export const getClausesForDocument = async ({ docId, timeout = 10000 }) => {
  return apiClient.get(`/api/documents/${docId}/clauses/`, { timeout });
};

export default {
  uploadDocument,
  fullAnalyze,
  analyzeClause,
  listDocuments,
  getClausesForDocument,
};
