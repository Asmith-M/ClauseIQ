import React, { useState } from 'react';
import { apiClient } from '../lib/apiEnhanced';

export default function ApiTest() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const runHealthTest = async () => {
    setStatus('testing');
    setResult(null);
    try {
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

    // Create a dummy file for testing
    const dummyFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    try {
      const res = await apiClient.uploadDocument({
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
    <div style={{ padding: 24 }}>
      <h2>API Connectivity Test</h2>
      <p>Base URL: {apiClient.defaults.baseURL}</p>

      <div style={{ marginBottom: 20 }}>
        <button onClick={runHealthTest} style={{ marginRight: 10 }}>Health Check</button>
        <button onClick={runFullTest} style={{ marginRight: 10 }}>Full Test Suite</button>
        <button onClick={testFileUpload}>Test File Upload</button>
      </div>

      {progress > 0 && (
        <div style={{ marginBottom: 12 }}>
          <strong>Upload Progress:</strong> {progress}%
          <div style={{ width: '100%', height: 10, background: '#eee', borderRadius: 5 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#007bff', borderRadius: 5 }}></div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> {status}
      </div>
      <pre style={{ background: '#eee', padding: 12, marginTop: 12, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
