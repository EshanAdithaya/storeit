// /components/FileManagement/FileActions.jsx

import { useState, useEffect } from 'react';

const FileActions = ({ file, onUpdateFile, onShareFile, onRemoveShare }) => {
  const [isPublic, setIsPublic] = useState(file?.public || false);
  const [filename, setFilename] = useState(file?.original_filename || '');
  const [shareEmail, setShareEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('read');
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Log when component mounts and when file changes
  useEffect(() => {
    console.log('FileActions component mounted/updated with file:', file);
    return () => {
      console.log('FileActions component unmounting');
    };
  }, [file]);

  const handleTogglePublic = async () => {
    console.log(`Toggling file visibility from ${isPublic ? 'public' : 'private'} to ${!isPublic ? 'public' : 'private'}`);
    setSaving(true);
    console.log('Setting saving state to true');
    setError('');
    
    try {
      console.log('Calling onUpdateFile to update file visibility');
      await onUpdateFile({
        public: !isPublic
      });
      
      console.log(`File visibility successfully updated to ${!isPublic ? 'public' : 'private'}`);
      setIsPublic(!isPublic);
    } catch (error) {
      console.error('Error toggling file visibility:', error);
      setError(error.message || 'Failed to update file');
    } finally {
      console.log('Setting saving state to false');
      setSaving(false);
    }
  };

  const handleUpdateFilename = async (e) => {
    e.preventDefault();
    console.log(`Updating filename to: ${filename}`);
    setSaving(true);
    console.log('Setting saving state to true');
    setError('');
    
    try {
      console.log('Calling onUpdateFile to update filename');
      await onUpdateFile({
        original_filename: filename
      });
      console.log('Filename successfully updated');
    } catch (error) {
      console.error('Error updating filename:', error);
      setError(error.message || 'Failed to update filename');
    } finally {
      console.log('Setting saving state to false');
      setSaving(false);
    }
  };

  const handleSearchUsers = async (e) => {
    const searchTerm = e.target.value;
    console.log(`Searching users with term: ${searchTerm}`);
    setShareEmail(searchTerm);
    
    if (searchTerm.length < 2) {
      console.log('Search term too short, clearing results');
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    console.log('Setting search loading state to true');
    
    try {
      const apiUrl = `/api/users?search=${encodeURIComponent(searchTerm)}`;
      console.log(`Fetching users from API: ${apiUrl}`);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error(`API returned error status: ${response.status}`);
        throw new Error('Failed to search users');
      }
      
      const data = await response.json();
      console.log('User search results received:', data);
      setSearchResults(data.users || []);
      console.log(`Found ${data.users?.length || 0} users matching search term`);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      console.log('Setting search loading state to false');
      setSearchLoading(false);
    }
  };

  const handleShareFile = async (userId) => {
    console.log(`Sharing file with user ID ${userId} with ${accessLevel} access`);
    try {
      console.log('Calling onShareFile with share details');
      await onShareFile({
        userId,
        accessLevel
      });
      
      console.log('File shared successfully');
      // Clear form
      setShareEmail('');
      setSearchResults([]);
      console.log('Share form cleared');
    } catch (error) {
      console.error('Error sharing file:', error);
      setError(error.message || 'Failed to share file');
    }
  };
  
  const handleRemoveShare = (userId) => {
    console.log(`Removing share for user ID ${userId}`);
    try {
      onRemoveShare(userId);
      console.log('Share removed successfully');
    } catch (error) {
      console.error('Error removing share:', error);
      setError(error.message || 'Failed to remove share');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">File Actions</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Rename File */}
        <div>
          <h4 className="text-md font-medium mb-2">Rename File</h4>
          <form onSubmit={handleUpdateFilename} className="flex">
            <input
              type="text"
              value={filename}
              onChange={(e) => {
                console.log(`Filename input changed to: ${e.target.value}`);
                setFilename(e.target.value);
              }}
              className="flex-grow shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
              disabled={saving}
            >
              Rename
            </button>
          </form>
        </div>
        
        {/* Public/Private Toggle */}
        <div>
          <h4 className="text-md font-medium mb-2">Visibility</h4>
          <button
            onClick={handleTogglePublic}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isPublic ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
            }`}
            disabled={saving}
          >
            {isPublic ? 'Public' : 'Private'}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            {isPublic 
              ? 'Anyone with the link can access this file without authentication' 
              : 'Only you and users you share with can access this file'}
          </p>
        </div>
        
        {/* Share with Users */}
        <div>
          <h4 className="text-md font-medium mb-2">Share with Users</h4>
          <div className="flex space-x-2 mb-2">
            <div className="flex-grow relative">
              <input
                type="text"
                value={shareEmail}
                onChange={handleSearchUsers}
                placeholder="Search by username or email"
                className="w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map(user => (
                    <div 
                      key={user.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleShareFile(user.id)}
                    >
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div>
                        <button className="text-blue-600 text-sm">Share</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchLoading && (
                <div className="absolute right-3 top-2">
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <select
              value={accessLevel}
              onChange={(e) => {
                console.log(`Access level changed to: ${e.target.value}`);
                setAccessLevel(e.target.value);
              }}
              className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="read">Read</option>
              <option value="write">Write</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        
        {/* Shared With */}
        {file && file.shares && file.shares.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-2">Shared With</h4>
            <div className="bg-gray-50 rounded-md p-2 max-h-60 overflow-y-auto">
              {file.shares.map(share => (
                <div key={share.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{share.username}</div>
                    <div className="text-xs text-gray-500 capitalize">{share.access_level} access</div>
                  </div>
                  <button
                    onClick={() => handleRemoveShare(share.user_id)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileActions;