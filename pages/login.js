// /pages/login.js

import Head from 'next/head';
import LoginForm from '../components/Auth/LoginForm';

export default function Login() {
  return (
    <div>
      <Head>
        <title>Login - FileServer</title>
        <meta name="description" content="Login to your FileServer account" />
      </Head>
      
      <LoginForm />
    </div>
  );
}