// /pages/files/[id].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import FileActions from '../../components/FileManagement/FileActions';

export default function FileDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id) {
      fetchFileDetails();
    }
  }, [id]);
  
  const fetchFileDetails = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/files/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file details');
      }
      
      const data = await response.json();
      setFile({
        ...data.file,
        owner: data.owner,
        shares: data.shares
      });
    } catch (error) {
      setError('Error loading file details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateFile = async (updateData) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update file');
      }
      
      // Refresh file details
      fetchFileDetails();
      
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Update file error:', error);
      throw error;
    }
  };
  
  const handleShareFile = async (shareData) => {
    try {
      const response = await fetch('/api/files/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId: id,
          userId: shareData.userId,
          accessLevel: shareData.accessLevel
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to share file');
      }
      
      // Refresh file details
      fetchFileDetails();
      
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Share file error:', error);
      throw error;
    }
  };
  
  const handleRemoveShare = async (userId) => {
    try {
      const response = await fetch('/api/files/share', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId: id,
          userId
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove share');
      }
      
      // Refresh file details
      fetchFileDetails();
      
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Remove share error:', error);
      throw error;
    }
  };
  
  const handleDeleteFile = async () => {
    if (window.confirm('Are you sure you want to delete this file? This cannot be undone.')) {
      try {
        const response = await fetch(`/api/files/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete file');
        }
        
        // Redirect to files page
        router.push('/files');
      } catch (error) {
        setError(error.message);
        console.error('Delete file error:', error);
      }
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div>
      <Head>
        <title>{file ? `${file.original_filename} - FileServer` : 'File Details - FileServer'}</title>
        <meta name="description" content="File details" />
      </Head>
      
      <div className="mb-6">
        <Link href="/files">
          <a className="text-blue-500 hover:text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Files
          </a>
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        file && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-2xl font-bold">{file.original_filename}</h1>
                  
                  <div className="flex space-x-2">
                    <a
                      href={`/api/files/download?id=${file.id}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                    <button
                      onClick={handleDeleteFile}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">FILE DETAILS</h3>
                    <p className="mb-1"><span className="font-medium">Size:</span> {formatFileSize(file.size)}</p>
                    <p className="mb-1"><span className="font-medium">Type:</span> {file.mime_type}</p>
                    <p className="mb-1"><span className="font-medium">Uploaded:</span> {formatDate(file.created_at)}</p>
                    <p className="mb-1">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${file.public ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {file.public ? 'Public' : 'Private'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">OWNERSHIP</h3>
                    <p className="mb-1"><span className="font-medium">Owner:</span> {file.owner?.username || 'Unknown'}</p>
                    <p className="mb-1"><span className="font-medium">Shared with:</span> {file.shares?.length || 0} users</p>
                    
                    {file.public && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-1">Public Link:</h4>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={`${window.location.origin}/api/files/download?id=${file.id}`}
                            readOnly
                            className="text-xs bg-white p-2 border border-gray-300 rounded flex-grow"
                          />
                          <button
                            className="ml-2 p-2 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/api/files/download?id=${file.id}`);
                              alert('Link copied to clipboard!');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">File Preview</h3>
                  
                  {file.mime_type.startsWith('image/') ? (
                    <div className="flex justify-center">
                      <img
                        src={`/api/files/download?id=${file.id}`}
                        alt={file.original_filename}
                        className="max-w-full max-h-96 object-contain border rounded"
                      />
                    </div>
                  ) : file.mime_type.startsWith('text/') || file.mime_type === 'application/json' ? (
                    <div className="bg-gray-50 p-4 rounded border overflow-auto max-h-96">
                      <p className="text-gray-500 text-sm mb-2">Text preview:</p>
                      <pre className="text-sm whitespace-pre-wrap">
                        {/* Text preview would be loaded here dynamically */}
                        Preview not available in this demo. In a full implementation, 
                        the content would be fetched and displayed here.
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded border">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">Preview not available for this file type.</p>
                      <a
                        href={`/api/files/download?id=${file.id}`}
                        className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download to view
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">API Access</h3>
                <p className="text-gray-600 mb-4">
                  Use these endpoints to access this file programmatically:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto mb-4">
                  <pre className="text-sm text-gray-800">
                    <code>
{`# Get file details
GET /api/files/${file.id}

# Download file
GET /api/files/download?id=${file.id}

# Update file (PATCH)
PATCH /api/files/${file.id}

# Delete file
DELETE /api/files/${file.id}`}
                    </code>
                  </pre>
                </div>
                
                <p className="text-sm text-gray-500">
                  Note: Authentication is required for these endpoints unless the file is public.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <FileActions 
                file={file}
                onUpdateFile={handleUpdateFile}
                onShareFile={handleShareFile}
                onRemoveShare={handleRemoveShare}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}