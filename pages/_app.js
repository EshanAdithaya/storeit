// /pages/_app.js
import '../styles/globals.css';
import Layout from '../components/Layout/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import RouteGuard from '../components/RouteGuard';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;