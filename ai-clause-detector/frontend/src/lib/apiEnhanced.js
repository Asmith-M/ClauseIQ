import axios from 'axios';

// Create the client instance without a base URL.
const createClient = ({ timeout = 15000, withCredentials = true } = {}) => {
  const client = axios.create({
    timeout,
    withCredentials,
    headers: {
      'Accept': 'application/json',
    },
  });

  // Response interceptor for retries and error handling
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const config = error.config;

      if (config._retryCount === undefined) {
        config._retryCount = 0;
        config.retryDelay = 3000;
        config.maxRetries = 3;
      }

      // Retry for network errors or 503s (e.g., Render.com cold starts)
      if (
        (!error.response || error.response.status === 503) &&
        config._retryCount < config.maxRetries
      ) {
        config._retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        return client(config);
      }

      // Normalize the error format for consistent handling
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

// Export a single, configured client instance
export const apiClient = createClient();

// --- API Functions ---

/**
 * Uploads a document.
 */
export const uploadDocument = async ({
  file,
  filename,
  clausesData = null,
  onProgress,
  timeout = 60000,
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const form = new FormData();
  form.append('filename', filename);
  form.append('file', file);
  if (clausesData) form.append('clauses_data', JSON.stringify(clausesData));

  return apiClient.post(`${API_URL}/api/documents/upload`, form, {
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
 * Performs a full analysis on a document.
 */
export const fullAnalyze = async ({ file, timeout = 60000 }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const form = new FormData();
  form.append('file', file);
  return apiClient.post(`${API_URL}/api/full-analyze/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout,
  });
};

/**
 * Analyzes a single clause.
 */
export const analyzeClause = async ({ clause, timeout = 15000 }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return apiClient.post(`${API_URL}/api/analyze-clause/`, { clause }, { timeout });
};

/**
 * Lists all documents.
 */
export const listDocuments = async ({ skip = 0, limit = 10, timeout = 10000 } = {}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return apiClient.get(`${API_URL}/api/documents/`, {
    params: { skip, limit },
    timeout,
  });
};

/**
 * Gets all clauses for a specific document.
 */
export const getClausesForDocument = async ({ docId, timeout = 10000 }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return apiClient.get(`${API_URL}/api/documents/${docId}/clauses/`, { timeout });
};

// Default export for convenience
export default {
  uploadDocument,
  fullAnalyze,
  analyzeClause,
  listDocuments,
  getClausesForDocument,
};
