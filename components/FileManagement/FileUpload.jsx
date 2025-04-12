// /components/FileManagement/FileUpload.jsx

import { useState, useEffect } from 'react';

const FileUpload = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Log when component mounts
  useEffect(() => {
    console.log('FileUpload component mounted');
    return () => {
      console.log('FileUpload component unmounting');
    };
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log(`File selected: ${file.name}, size: ${(file.size / 1024).toFixed(2)} KB, type: ${file.type}`);
      setSelectedFile(file);
      setError('');
    } else {
      console.log('File selection cancelled or no file selected');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log('Upload form submitted');
    
    if (!selectedFile) {
      console.error('Upload attempted with no file selected');
      setError('Please select a file to upload');
      return;
    }
    
    console.log(`Starting upload of file: ${selectedFile.name}`);
    setUploading(true);
    console.log('Upload loading state set to true');
    setProgress(0);
    console.log('Progress reset to 0%');
    setError('');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log('FormData created with file appended');
    
    try {
      // Simulate progress (actual progress tracking would require custom implementation)
      console.log('Starting progress simulation');
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev >= 90 ? 90 : prev + 10;
          console.log(`Upload progress updated to ${newProgress}%`);
          if (newProgress >= 90) {
            console.log('Progress simulation reached 90%, clearing interval');
            clearInterval(progressInterval);
          }
          return newProgress;
        });
      }, 300);
      
      console.log('Sending file upload request to API...');
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      console.log('Progress interval cleared');
      setProgress(100);
      console.log('Upload progress set to 100%');
      
      if (!response.ok) {
        console.error(`Upload failed with status: ${response.status}`);
        const data = await response.json();
        throw new Error(data.message || 'Upload failed');
      }
      
      const data = await response.json();
      console.log('Upload successful, received response:', data);
      
      // Reset form
      console.log('Resetting form state after successful upload');
      setSelectedFile(null);
      setProgress(0);
      
      // Notify parent component
      if (onUploadComplete) {
        console.log('Calling onUploadComplete callback with uploaded file data');
        onUploadComplete(data.file);
      }
    } catch (error) {
      console.error('Upload error:', error.message);
      setError(error.message);
    } finally {
      console.log('Upload process completed, setting uploading state to false');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Upload File</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            Select File
          </label>
          <input 
            type="file" 
            id="file"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading}
          />
        </div>
        
        {selectedFile && (
          <div className="text-sm text-gray-600 mb-4">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
        
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">{progress}%</p>
          </div>
        )}
        
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          disabled={uploading || !selectedFile}
          onClick={() => {
            if (!selectedFile) {
              console.log('Upload button clicked but no file selected');
            } else if (uploading) {
              console.log('Upload button clicked but upload already in progress');
            } else {
              console.log('Upload button clicked with file selected');
            }
          }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;