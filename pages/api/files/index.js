// /pages/api/files/index.js

import db from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  console.log('Files API index request received');
  console.log(`Request method: ${req.method}`);
  
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  console.log(`Auth token from header: ${token ? 'Present' : 'Not present'}`);
  
  try {
    // Verify the token
    const user = await verifyToken(token);
    
    if (!user || !user.id) {
      console.error('Authentication failed: Invalid token');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log(`User authenticated: ID=${user.id}, username=${user.username}`);
    
    // GET - List files
    if (req.method === 'GET') {
      console.log('Processing GET request to list files');
      try {
        // Get query parameters for pagination and filtering
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        
        console.log(`Query parameters: page=${page}, limit=${limit}, offset=${offset}, search="${search}"`);
        
        // Build query
        console.log('Building database query');
        const baseQuery = `
          SELECT f.*, u.username as owner_name 
          FROM files f
          JOIN users u ON f.user_id = u.id
          LEFT JOIN file_shares fs ON f.id = fs.file_id
          WHERE (f.user_id = ? OR fs.user_id = ? OR f.public = 1)
        `;
        
        let countQuery = `
          SELECT COUNT(DISTINCT f.id) as total
          FROM files f
          LEFT JOIN file_shares fs ON f.id = fs.file_id
          WHERE (f.user_id = ? OR fs.user_id = ? OR f.public = 1)
        `;
        
        let finalQuery = baseQuery;
        let countParams = [user.id, user.id];
        let queryParams = [user.id, user.id];
        
        console.log(`Base query params: userID=${user.id}`);
        
        // Add search filtering if provided
        if (search) {
          console.log(`Adding search filter for term: "${search}"`);
          finalQuery += ` AND (f.original_filename LIKE ? OR f.filename LIKE ?)`;
          countQuery += ` AND (f.original_filename LIKE ? OR f.filename LIKE ?)`;
          const searchParam = `%${search}%`;
          queryParams.push(searchParam, searchParam);
          countParams.push(searchParam, searchParam);
          console.log(`Search parameter added: "${searchParam}"`);
        }
        
        // Add pagination
        finalQuery += ` GROUP BY f.id ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        console.log(`Added pagination: limit=${limit}, offset=${offset}`);
        
        // Execute queries
        console.log('Executing file list query...');
        console.log(`Final query: ${finalQuery}`);
        console.log('Query parameters:', queryParams);
        
        const [files] = await db.query(finalQuery, queryParams);
        console.log(`File query returned ${files.length} results`);
        
        console.log('Executing count query for pagination...');
        console.log(`Count query: ${countQuery}`);
        console.log('Count parameters:', countParams);
        
        const [countResult] = await db.query(countQuery, countParams);
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        console.log(`Pagination results: total=${total}, totalPages=${totalPages}`);
        
        // Log file IDs that were found
        if (files.length > 0) {
          console.log('Files found:');
          files.forEach((file, index) => {
            console.log(`  ${index + 1}. ID=${file.id}, name=${file.original_filename}, owner=${file.owner_name}`);
          });
        } else {
          console.log('No files found matching the criteria');
        }
        
        console.log('File list request successful, returning data');
        return res.status(200).json({
          files,
          pagination: {
            total,
            page,
            limit,
            totalPages
          }
        });
      } catch (error) {
        console.error('Error fetching files:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
    
    // Other methods not allowed on this endpoint
    console.log(`Method ${req.method} not allowed for files index API`);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}