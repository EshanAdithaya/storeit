// /pages/register.js

import Head from 'next/head';
import RegisterForm from '../components/Auth/RegisterForm';

export default function Register() {
  return (
    <div>
      <Head>
        <title>Register - FileServer</title>
        <meta name="description" content="Create a new FileServer account" />
      </Head>
      
      <RegisterForm />
    </div>
  );
}