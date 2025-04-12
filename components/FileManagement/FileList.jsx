// /components/FileManagement/FileList.jsx

import { useState, useEffect } from 'react';
import Link from 'next/link';

const FileList = ({ files, onDeleteFile }) => {
  const [expandedFile, setExpandedFile] = useState(null);

  // Log when component mounts or files change
  useEffect(() => {
    console.log('FileList component mounted/updated');
    console.log('Files received:', files);
    return () => {
      console.log('FileList component unmounting');
    };
  }, [files]);

  const formatDate = (dateString) => {
    console.log(`Formatting date: ${dateString}`);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatFileSize = (bytes) => {
    console.log(`Formatting file size: ${bytes} bytes`);
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  const toggleExpand = (id) => {
    console.log(`Toggling expanded state for file ID: ${id}`);
    const newExpandedState = expandedFile === id ? null : id;
    console.log(`New expanded state: ${newExpandedState}`);
    setExpandedFile(newExpandedState);
  };

  const handleDelete = async (id) => {
    console.log(`Delete requested for file ID: ${id}`);
    if (window.confirm('Are you sure you want to delete this file?')) {
      console.log(`Delete confirmed for file ID: ${id}`);
      try {
        console.log(`Calling onDeleteFile for file ID: ${id}`);
        await onDeleteFile(id);
        console.log(`File with ID: ${id} successfully deleted`);
      } catch (error) {
        console.error(`Error deleting file ID: ${id}`, error);
        alert(`Failed to delete file: ${error.message}`);
      }
    } else {
      console.log(`Delete cancelled for file ID: ${id}`);
    }
  };

  // Log when no files are available
  if (!files || files.length === 0) {
    console.log('No files found to display');
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-500">No files found</p>
      </div>
    );
  }

  console.log(`Rendering file list with ${files.length} files`);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filename
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      <Link href={`/files/${file.id}`} 
                        onClick={() => console.log(`Navigating to file details page for ID: ${file.id}`)}
                        className="hover:underline">
                        {file.original_filename}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      {file.public ? 'Public' : 'Private'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatFileSize(file.size)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(file.created_at)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2">
                  <a 
                    href={`/api/files/download?id=${file.id}`} 
                    className="text-blue-600 hover:text-blue-900"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => console.log(`Downloading file ID: ${file.id}`)}
                  >
                    Download
                  </a>
                  <button 
                    onClick={() => toggleExpand(file.id)} 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {expandedFile === file.id ? 'Hide' : 'Info'}
                  </button>
                  <button 
                    onClick={() => handleDelete(file.id)} 
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
                
                {expandedFile === file.id && (
                  <div className="mt-2 text-left bg-gray-50 p-2 rounded text-xs">
                    <p><b>Original name:</b> {file.original_filename}</p>
                    <p><b>Type:</b> {file.mime_type}</p>
                    <p><b>System path:</b> {file.path}</p>
                    <p><b>Owner:</b> {file.owner_name || 'Unknown'}</p>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;