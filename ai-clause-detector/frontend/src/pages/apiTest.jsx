// ApiTest.jsx
import React, { useState } from 'react';
// Make sure this path is correct for your project structure
import { apiClient } from '../lib/api';

export default function ApiTest() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const runHealthTest = async () => {
    setStatus('testing');
    setResult(null);
    try {
      // Assuming your backend has a /health endpoint for testing
      const res = await apiClient.get('/health');
      setResult(res.data || res.statusText);
      setStatus('ok');
    } catch (err) {
      setResult(err?.message || JSON.stringify(err));
      setStatus('error');
    }
  };

  const runFullTest = async () => {
    setStatus('testing');
    setResult(null);
    const tests = [
      { name: 'Health Check', fn: () => apiClient.get('/health') },
      { name: 'List Documents', fn: () => apiClient.get('/api/documents/') },
      { name: 'Root Endpoint', fn: () => apiClient.get('/') }
    ];

    const results = {};
    for (const test of tests) {
      try {
        const res = await test.fn();
        results[test.name] = { status: 'ok', data: res.data };
      } catch (err) {
        results[test.name] = { status: 'error', message: err.message };
      }
    }
    setResult(results);
    setStatus('ok');
  };

  const testFileUpload = async () => {
    setStatus('testing');
    setResult(null);
    setProgress(0);

    const dummyFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    try {
      // Assuming your apiEnhanced.js file exports an uploadDocument function
      const { uploadDocument } = await import('../lib/api');
      const res = await uploadDocument({
        file: dummyFile,
        filename: 'test.pdf',
        onProgress: (percent) => setProgress(percent)
      });
      setResult(res.data);
      setStatus('ok');
    } catch (err) {
      setResult(err?.message || JSON.stringify(err));
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>API Connectivity Test</h2>
      <p style={{ background: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
        <strong>API Target URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8000 (fallback)'}
      </p>

      <div style={{ marginBottom: 20 }}>
        <button onClick={runHealthTest} style={{ marginRight: 10, padding: '8px 12px' }}>Health Check</button>
        <button onClick={runFullTest} style={{ marginRight: 10, padding: '8px 12px' }}>Full Test Suite</button>
        <button onClick={testFileUpload} style={{ padding: '8px 12px' }}>Test File Upload</button>
      </div>

      {progress > 0 && progress < 100 && (
        <div style={{ marginBottom: 12 }}>
          <strong>Upload Progress:</strong> {progress}%
          <div style={{ width: '100%', height: 10, background: '#eee', borderRadius: 5, marginTop: 4 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#007bff', borderRadius: 5 }}></div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> <span style={{ fontWeight: 'bold' }}>{status}</span>
      </div>
      <pre style={{ background: '#eee', padding: 12, marginTop: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderRadius: '4px' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
