// app/page.js

export default function Home() {
  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to FileServer</h1>
          <p className="text-xl text-gray-600">
            A secure, self-hosted solution for storing and sharing files
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Store Files Securely</h2>
            <p className="text-gray-600 mb-6">
              Upload and manage your files with a clean, intuitive interface. Your data stays on your server, with no external API calls.
            </p>
            <a href="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
              Get Started
            </a>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Share With Others</h2>
            <p className="text-gray-600 mb-6">
              Easily share files with other users. Grant read, write, or admin access to manage permissions securely.
            </p>
            <a href="/login" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded">
              Login Now
            </a>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">API Integration</h2>
          <p className="text-gray-600 mb-6">
            Integrate with other applications using our RESTful API endpoints:
          </p>
          
          <div className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
            <pre className="text-sm text-gray-800">
              <code>
{`# Authentication
POST /api/auth/register - Register a new user
POST /api/auth/login - Authenticate a user
POST /api/auth/logout - Logout the current user

# File Management
GET /api/files - List files accessible to the user
POST /api/files/upload - Upload a new file
GET /api/files/{id} - Get file details
PATCH /api/files/{id} - Update file metadata
DELETE /api/files/{id} - Delete a file
GET /api/files/download?id={id} - Download a file

# File Sharing
POST /api/files/share - Share a file with another user
DELETE /api/files/share - Remove file sharing

# User Management
GET /api/users?search={query} - Search for users`}
              </code>
            </pre>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Authentication</h3>
            <p className="text-gray-600">
              Local authentication with password hashing and JWT tokens for secure sessions.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Local Storage</h3>
            <p className="text-gray-600">
              Store files on your own server with no external dependencies or cloud services.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="text-purple-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">RESTful API</h3>
            <p className="text-gray-600">
              Complete API for integration with your other applications and services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}