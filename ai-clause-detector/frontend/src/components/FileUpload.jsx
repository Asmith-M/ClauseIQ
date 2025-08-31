import React, { useState } from 'react';
import { uploadDocument } from '../lib/apiEnhanced';

export default function FileUpload({ onUploadSuccess, onUploadError }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.includes('pdf')) {
        setError('Please select a PDF file');
        return;
      }
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadDocument({
        file,
        filename: file.name,
        onProgress: (percent) => setProgress(percent)
      });

      onUploadSuccess?.(result.data);
      setFile(null);
      setProgress(0);
    } catch (err) {
      const errorMessage = err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      onUploadError?.(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {file && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}
