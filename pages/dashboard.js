// /pages/dashboard.js - Stability-focused version

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only run this effect once on mount
  useEffect(() => {
    // Function to fetch data
    async function fetchData() {
      try {
        // Get token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Make API request
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Handle errors
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('auth_token');
            router.push('/login');
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }

        // Parse response
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Call the fetch function
    fetchData();
  }, [router]);

  // Simple formatter functions
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    return bytes < 1024 ? bytes + ' B' :
           bytes < 1048576 ? (bytes / 1024).toFixed(2) + ' KB' :
           bytes < 1073741824 ? (bytes / 1048576).toFixed(2) + ' MB' :
           (bytes / 1073741824).toFixed(2) + ' GB';
  };

  // Very simple render to start
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Dashboard - FileServer</title>
      </Head>
      
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading dashboard data...</div>
      ) : stats ? (
        <div>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold">{stats.totalFiles || 0}</div>
              <div>Total Files</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold">{formatFileSize(stats.totalStorage)}</div>
              <div>Storage Used</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-2xl font-bold">{stats.sharedFiles || 0}</div>
              <div>Shared Files</div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/files">
              <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Manage Files
              </a>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">No dashboard data available.</div>
      )}
    </div>
  );
}