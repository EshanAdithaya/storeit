// /pages/files/index.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import FileUpload from '../../components/FileManagement/FileUpload';
import FileList from '../../components/FileManagement/FileList';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, [page, debouncedSearchTerm]);

  const fetchFiles = async () => {
    setLoading(true);
    
    try {
      let url = `/api/files?page=${page}`;
      
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (error) {
      setError('Error loading files');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (newFile) => {
    // Add the new file to the list and refresh
    fetchFiles();
  };

  const handleDeleteFile = async (id) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete file');
      }
      
      // Remove file from list
      setFiles(files.filter(file => file.id !== id));
    } catch (error) {
      setError(error.message);
      console.error('Delete file error:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

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
                  onDeleteFile={handleDeleteFile} 
                />
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-md ${
                        page === 1 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center">
                      <span className="text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-md ${
                        page === totalPages 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
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