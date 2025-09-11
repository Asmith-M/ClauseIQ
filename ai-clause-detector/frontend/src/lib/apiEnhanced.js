// apiEnhanced.js
// Hardcoded API client for https://clauseiq-kgel.onrender.com

import axios from 'axios';

// HARDCODED BASE URL
const HARDCODED_BASE_URL = 'https://clauseiq-kgel.onrender.com';

const createClient = ({ timeout = 15000, withCredentials = true } = {}) => {
  const client = axios.create({
    baseURL: HARDCODED_BASE_URL, // <-- Set directly here
    timeout,
    withCredentials,
    headers: {
      'Accept': 'application/json',
    },
  });

  // Response interceptor to unwrap API response and retry logic
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const config = error.config;

      if (config._retryCount === undefined) {
        config._retryCount = 0;
        config.retryDelay = 3000;
        config.maxRetries = 3;
      }

      // Retry for network errors or 503s
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

// Create client with baseURL already set
export const apiClient = createClient();

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

// Export all functions
export default {
  uploadDocument,
  fullAnalyze,
  analyzeClause,
  listDocuments,
  getClausesForDocument,
};
