// api.js
// Unified API client with hardcoded base URL, retry logic, and progress tracking

import axios from 'axios';

// HARDCODED BASE URL for production backend
const BASE_URL = 'https://clauseiq-kgel.onrender.com';

// Create Axios client with interceptors and retry logic
const createClient = ({ baseURL, timeout = 15000, withCredentials = true } = {}) => {
  const client = axios.create({
    baseURL,
    timeout,
    withCredentials,
    headers: {
      'Accept': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;

      if (!config || typeof config !== 'object') {
        return Promise.reject(error);
      }

      if (!config._retryCount) {
        config._retryCount = 0;
        config.retryDelay = 3000; // 3 seconds
        config.maxRetries = 3;
      }

      // Retry on network error or 503 (cold start)
      if (
        (!error.response || error.response.status === 503) &&
        config._retryCount < config.maxRetries
      ) {
        config._retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        return client(config);
      }

      // Normalize error response
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

// Initialize the client with the hardcoded base URL
export const apiClient = createClient({ baseURL: BASE_URL });

/**
 * Upload a document with progress tracking
 */
export const uploadDocument = async ({
  file,
  filename,
  clausesData = null,
  onProgress,
  timeout = 60000,
}) => {
  console.log('[uploadDocument] Uploading:', filename); // Debug log

  const form = new FormData();
  form.append('filename', filename);
  form.append('file', file);
  if (clausesData) {
    form.append('clauses_data', JSON.stringify(clausesData));
  }

  return apiClient.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
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

// Export all API functions as default
export default {
  uploadDocument,
  fullAnalyze,
  analyzeClause,
  listDocuments,
  getClausesForDocument,
};
