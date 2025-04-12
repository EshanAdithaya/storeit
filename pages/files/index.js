// /pages/files/index.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import FileUpload from '../../components/FileManagement/FileUpload';
import FileList from '../../components/FileManagement/FileList';
import Link from 'next/link';

export default function Files() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  console.log('Files component rendered');
  console.log(`Initial state: page=${page}, totalPages=${totalPages}, loading=${loading}`);
  console.log(`Search terms: current="${searchTerm}", debounced="${debouncedSearchTerm}"`);

  useEffect(() => {
    console.log(`Search term changed to "${searchTerm}", setting up debounce timer`);
    const timer = setTimeout(() => {
      console.log(`Debounce timer completed, setting debounced search term to "${searchTerm}"`);
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      console.log('Clearing debounce timer');
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    console.log(`Fetch files trigger: page=${page}, debouncedSearchTerm="${debouncedSearchTerm}"`);
    fetchFiles();
  }, [page, debouncedSearchTerm]);

  const fetchFiles = async () => {
    console.log('Starting fetchFiles, setting loading to true');
    setLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('No authentication token found');
        router.push('/login');
        return;
      }
      
      let url = `/api/files?page=${page}`;
      
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      }
      
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, {
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
        console.error(`API error: ${response.status} - ${response.statusText}`);
        throw new Error('Failed to fetch files');
      }
      
      console.log('Parsing API response JSON');
      const data = await response.json();
      console.log(`Files fetched: ${data.files?.length || 0} files`);
      console.log(`Pagination: page=${data.pagination.page}, totalPages=${data.pagination.totalPages}, total=${data.pagination.total}`);
      
      setFiles(data.files || []);
      setTotalPages(data.pagination.totalPages || 1);
      console.log('Files and pagination state updated');
    } catch (error) {
      console.error('Error in fetchFiles:', error);
      setError('Error loading files');
      console.log(`Setting error state: ${error.message}`);
    } finally {
      console.log('Setting loading state to false');
      setLoading(false);
    }
  };

  const handleUploadComplete = (newFile) => {
    console.log('Upload completed successfully for file:', newFile);
    console.log('Refreshing file list after upload');
    fetchFiles();
  };

  const handleDeleteFile = async (id) => {
    console.log(`Starting file deletion for ID: ${id}`);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('No authentication token found');
        router.push('/login');
        return;
      }
      
      console.log(`Making DELETE request to: /api/files/${id}`);
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
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
        console.error(`API error: ${response.status} - ${response.statusText}`);
        const data = await response.json();
        console.error('Error response:', data);
        throw new Error(data.message || 'Failed to delete file');
      }
      
      console.log(`File ${id} deleted successfully, updating state`);
      // Remove file from list
      setFiles(files.filter(file => file.id !== id));
      console.log('Files state updated after deletion');
    } catch (error) {
      console.error('Delete file error:', error);
      setError(error.message);
      console.log(`Setting error state: ${error.message}`);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log(`Search input changed to: "${value}"`);
    setSearchTerm(value);
    console.log('Resetting to page 1 due to search change');
    setPage(1); // Reset to first page when search changes
  };

  console.log(`Rendering Files component with ${files.length} files, loading=${loading}, error=${error ? 'present' : 'none'}`);

  return (
    <div>
      <Head>
        <title>My Files - FileServer</title>
        <meta name="description" content="Manage your files" />
      </Head>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Files</h1>
        <p className="text-gray-600">Upload, manage, and share your files</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>
        
        <div className="md:col-span-2">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Files</h2>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search files"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <>
                <FileList 
                  files={files} 
                  onDeleteFile={(id) => {
                    console.log(`Delete file requested for ID: ${id}`);
                    handleDeleteFile(id);
                  }} 
                />
                
                {files.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No files found. {debouncedSearchTerm ? 'Try a different search term.' : 'Upload your first file to get started.'}</p>
                  </div>
                )}
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() => {
                        const newPage = Math.max(page - 1, 1);
                        console.log(`Pagination: navigating to previous page (${page} -> ${newPage})`);
                        setPage(newPage);
                      }}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-md ${
                        page === 1 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center">
                      <span className="text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        const newPage = Math.min(page + 1, totalPages);
                        console.log(`Pagination: navigating to next page (${page} -> ${newPage})`);
                        setPage(newPage);
                      }}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-md ${
                        page === totalPages 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}