// /lib/db.js

import mysql from 'mysql2/promise';

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fileserver',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to test database connection
const testConnection = async () => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Log success with connection details
    console.log(`✅ Successfully connected to MySQL database at ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   → Database: ${process.env.DB_NAME || 'fileserver'}`);
    console.log(`   → User: ${process.env.DB_USER || 'root'}`);
    
    // Check if we can query the database
    const [result] = await connection.query('SELECT 1 as connection_test');
    if (result[0].connection_test === 1) {
      console.log('✅ Database query test successful');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to the database:');
    console.error(`   → Error: ${err.message}`);
    console.error(`   → Code: ${err.code}`);
    console.error(`   → Connection details: ${process.env.DB_USER || 'root'}@${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'fileserver'}`);
    
    // If this is a server-side only environment, we might want to exit
    // process.exit(1);
    
    return false;
  } finally {
    // Always release the connection back to the pool if it was acquired
    if (connection) {
      connection.release();
    }
  }
};

// Test the connection when this module is first imported
testConnection()
  .then((connected) => {
    if (connected) {
      console.log('🚀 Database connection pool initialized and ready');
    } else {
      console.warn('⚠️ Application started with database connection issues');
    }
  });

// Export the pool for use in other modules
export default pool;