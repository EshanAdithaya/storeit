// /pages/api/auth/logout.js

export default async function handler(req, res) {
  console.log('Logout API request received');
  console.log(`Request method: ${req.method}`);
  
  if (req.method !== 'POST') {
    console.log(`Rejecting logout request with wrong method: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Processing logout request');
    
    // Get the current token to verify user was logged in
    const currentToken = req.cookies.token;
    if (currentToken) {
      console.log('Found existing authentication token, proceeding with logout');
    } else {
      console.log('No authentication token found, user might already be logged out');
    }
    
    // Clear the auth cookie
    console.log('Clearing authentication cookie');
    res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
    console.log('Authentication cookie cleared successfully');
    
    console.log('Logout completed successfully');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout process failed with error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error during logout' });
  }
}