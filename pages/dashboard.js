// /pages/dashboard.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorage: 0,
    recentFiles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('Dashboard component rendered');

  useEffect(() => {
    console.log('Dashboard useEffect triggered, fetching dashboard data');
    fetchDashboardData();

    return () => {
      console.log('Dashboard component unmounting');
    };
  }, []);

  const fetchDashboardData = async () => {
    console.log('Starting fetchDashboardData, setting loading to true');
    setLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('No authentication token found');
        router.push('/login');
        return;
      }

      console.log('Making API request to: /api/dashboard with auth token');
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`API response received with status: ${response.status}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed, redirecting to login');
          localStorage.removeItem('auth_token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }
      
      console.log('Parsing API response JSON');
      const data = await response.json();
      console.log('Dashboard data received:', data);
      console.log(`Total files: ${data.totalFiles}`);
      console.log(`Total storage: ${formatFileSize(data.totalStorage)}`);
      console.log(`Recent files: ${data.recentFiles?.length || 0}`);
      console.log(`Shared files: ${data.sharedFiles || 0}`);
      
      setStats(data);
      console.log('Dashboard stats state updated');
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      setError('Failed to load dashboard data');
      console.log(`Setting error state: ${error.message}`);
    } finally {
      console.log('Setting loading state to false');
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    console.log(`Formatting file size: ${bytes} bytes`);
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  const formatDate = (dateString) => {
    console.log(`Formatting date: ${dateString}`);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  console.log(`Rendering Dashboard component with states - loading: ${loading}, error: ${error ? error : 'none'}`);
  console.log(`Dashboard stats: ${stats.totalFiles} files, ${formatFileSize(stats.totalStorage)} storage`);

  // Rest of your Dashboard component JSX remains the same...
  return (
    <div>
      <Head>
        <title>Dashboard - FileServer</title>
        <meta name="description" content="Your FileServer dashboard" />
      </Head>
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/files">
          <a 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => console.log('Navigate to /files clicked')}
          >
            Manage Files
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
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Stats cards - unchanged */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalFiles}</div>
              <div className="text-gray-500">Total Files</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-green-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">{formatFileSize(stats.totalStorage)}</div>
              <div className="text-gray-500">Total Storage Used</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-purple-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.sharedFiles || 0}</div>
              <div className="text-gray-500">Shared Files</div>
            </div>
          </div>
          
          {/* Recent files section - unchanged */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {/* Rest of your dashboard content - unchanged */}
            <h2 className="text-xl font-bold mb-4">Recent Files</h2>
            
            {stats.recentFiles.length === 0 ? (
              <p className="text-gray-500">No files uploaded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentFiles.map((file) => (
                      <tr key={file.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{file.original_filename}</div>
                          <div className="text-sm text-gray-500">{file.public ? 'Public' : 'Private'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(file.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/files/${file.id}`}>
                            <a 
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              onClick={() => console.log(`Navigate to file details clicked for ID: ${file.id}`)}
                            >
                              View
                            </a>
                          </Link>
                          <a 
                            href={`/api/files/download?id=${file.id}`} 
                            className="text-green-600 hover:text-green-900"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => console.log(`Download file clicked for ID: ${file.id}`)}
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Lower sections - unchanged */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick upload section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Quick Upload</h2>
              <p className="text-gray-600 mb-4">
                Drag and drop files here to upload them to your account
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Link href="/files">
                  <a 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => console.log('Quick upload link clicked, navigating to /files')}
                  >
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="font-medium">Click to Upload Files</span>
                    </div>
                  </a>
                </Link>
              </div>
            </div>
            
            {/* API Integration section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">API Integration</h2>
              <p className="text-gray-600 mb-4">
                Use these endpoints to integrate with your applications:
              </p>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm text-gray-800">
                  <code>
{`# Get files
GET /api/files

# Upload file
POST /api/files/upload

# Download file
GET /api/files/download?id={file_id}`}
                  </code>
                </pre>
              </div>
              <div className="mt-4">
                <a 
                  href="/api-docs" 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => console.log('API documentation link clicked')}
                >
                  View full API documentation →
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}