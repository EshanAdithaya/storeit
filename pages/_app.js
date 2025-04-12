// pages/_app.js
import '../styles/globals.css';
import Layout from '../components/Layout/Layout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Log component mounting
  console.log('MyApp component rendered');
  console.log(`Current route: ${router.pathname}`);
  console.log('Page props:', pageProps);
  
  // Global error handling
  useEffect(() => {
    console.log('Setting up global error handlers');
    
    // Global API error handling
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      console.log(`API request initiated: ${args[0]}`);
      
      try {
        const response = await originalFetch(...args);
        
        console.log(`API response received for ${args[0]} with status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`API error: ${response.status} - ${response.statusText}`);
        }
        
        // Clone the response to avoid consuming it
        const clonedResponse = response.clone();
        
        // Try to parse and log JSON responses when possible
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await clonedResponse.json();
            console.log('API response data:', data);
          }
        } catch (error) {
          // Silently fail if we can't parse the JSON
          console.log('Response is not JSON or already consumed');
        }
        
        return response;
      } catch (error) {
        console.error(`API request to ${args[0]} failed:`, error);
        throw error;
      }
    };
    
    // Global JS error handling
    const originalError = console.error;
    console.error = (...args) => {
      // Call original console.error
      originalError(...args);
      
      // Extract error information if it's an Error object
      const errorObjects = args.filter(arg => arg instanceof Error);
      if (errorObjects.length > 0) {
        errorObjects.forEach(error => {
          console.log(`Global error: ${error.message}`);
          console.log(`Stack trace: ${error.stack}`);
        });
      }
    };
    
    // Clean up when component unmounts
    return () => {
      console.log('Cleaning up global handlers');
      window.fetch = originalFetch;
      console.error = originalError;
    };
  }, []);
  
  // Navigation logging
  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      console.log(`Navigation started to: ${url}`);
    };
    
    const handleRouteChangeComplete = (url) => {
      console.log(`Navigation completed to: ${url}`);
    };
    
    const handleRouteChangeError = (err, url) => {
      console.error(`Navigation error to ${url}:`, err);
    };
    
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);
  
  // Log app rendering
  console.log('Rendering application with Layout');
  
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;