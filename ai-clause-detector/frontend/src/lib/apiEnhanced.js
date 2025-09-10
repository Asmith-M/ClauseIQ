// apiEnhanced.js
// Enhanced API client with the interceptor fix

import axios from 'axios';

const createClient = ({ timeout = 15000, withCredentials = true } = {}) => {
  const client = axios.create({
    timeout,
    withCredentials,
    headers: {
      'Accept': 'application/json',
    },
  });

  // Response interceptor to unwrap common API structure and add retry logic
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const config = error.config;

      if (config._retryCount === undefined) {
        config._retryCount = 0;
        config.retryDelay = 3000; // 3 seconds
        config.maxRetries = 3;
      }

      // Retry for network errors or 503s (e.g. cold starts)
      if (
        (!error.response || error.response.status === 503) &&
        config._retryCount < config.maxRetries
      ) {
        config._retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        return client(config);
      }

      // Normalize error
      if (error.response) {
        const { status, data } = error.response;
        return Promise.reject({
          status,
          data,
          message: data?.detail || data?.message || error.message,
        });
      } else if (error.request) {
        return Promise.reject({
          status: null,
          data: null,
          message: 'No response from server. Possible network error or CORS issue.',
        });
      }

      return Promise.reject({ status: null, data: null, message: error.message });
    }
  );

  return client;
};

// Create the client WITHOUT the baseURL
export const apiClient = createClient();

// Use an interceptor to set the baseURL dynamically before each request
apiClient.interceptors.request.use((config) => {
  // Get the URL from Vite's environment variables
  config.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return config;
});

/**
 * Upload a document with progress callback
 */
export const uploadDocument = async ({
  file,
  filename,
  clausesData = null,
  onProgress,
  timeout = 60000,
}) => {
  const form = new FormData();
  form.append('filename', filename);
  form.append('file', file);
  if (clausesData) form.append('clauses_data', JSON.stringify(clausesData));

  return apiClient.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

/**
 * Full analysis of uploaded document
 */
export const fullAnalyze = async ({ file, timeout = 60000 }) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post('/api/full-analyze/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout,
  });
};

/**
 * Analyze a specific clause
 */
export const analyzeClause = async ({ clause, timeout = 15000 }) => {
  return apiClient.post('/api/analyze-clause/', { clause }, { timeout });
};

/**
 * List uploaded documents with pagination
 */
export const listDocuments = async ({ skip = 0, limit = 10, timeout = 10000 } = {}) => {
  return apiClient.get('/api/documents/', {
    params: { skip, limit },
    timeout,
  });
};

/**
 * Get clauses for a specific document
 */
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
