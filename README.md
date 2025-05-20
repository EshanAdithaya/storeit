# StoreIt - Secure File Storage Application

StoreIt is a secure, self-hosted file storage solution built with Next.js, allowing users to upload, manage, and share files with comprehensive access control and permissions.

![StoreIt](image.png)

## Features

### File Management
- **Upload & Store**: Securely upload and store files on your own server
- **File Organization**: Manage files with search, sort, and filter capabilities
- **File Details**: View detailed file information and metadata

### Sharing & Collaboration
- **User Sharing**: Share files with other users with granular permission controls
- **Access Levels**: Set read, write, or admin permissions for shared files
- **Public Links**: Generate public links for files that don't require authentication

### Security
- **Authentication**: Secure JWT-based authentication system
- **Permission Control**: Comprehensive access control system
- **Password Hashing**: Secure password storage with bcrypt

### User Interface
- **Responsive Design**: Clean, modern interface that works on mobile and desktop
- **Real-time Feedback**: Upload progress tracking and operation status
- **Dashboard**: Get insights into storage usage and file activities

### API
- **RESTful API**: Complete API for integration with other applications
- **Token Authentication**: Secure API access with Bearer token authentication
- **Comprehensive Logging**: Detailed console logging for debugging and monitoring

## Tech Stack

### Frontend
- **React**: Frontend UI library
- **Next.js**: React framework for server-side rendering
- **TailwindCSS**: Utility-first CSS framework

### Backend
- **Node.js**: JavaScript runtime
- **Next.js API Routes**: API implementation
- **MySQL**: Relational database

### Libraries & Tools
- **bcryptjs**: Password hashing
- **jose**: JWT token handling
- **formidable**: File upload handling
- **uuid**: Unique ID generation
- **mysql2**: MySQL client for Node.js

## Installation

### Prerequisites
- Node.js (v16+)
- MySQL Server
- XAMPP/WAMP/LAMP or any web server (optional, for development)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/storeit.git
cd storeit
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root with the following variables:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=fileserver
JWT_SECRET=your_secure_jwt_secret
```

4. Set up the MySQL database:
```sql
CREATE DATABASE IF NOT EXISTS fileserver;
USE fileserver;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  path VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS file_shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  user_id INT NOT NULL,
  access_level ENUM('read', 'write', 'admin') DEFAULT 'read',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_file_user (file_id, user_id)
);
```

5. Create upload directory:
```bash
mkdir -p public/uploads
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t storeit \
  --build-arg DB_HOST=your_db_host \
  --build-arg DB_USER=your_db_user \
  --build-arg DB_PASSWORD=your_db_password \
  --build-arg DB_NAME=your_db_name \
  --build-arg JWT_SECRET=your_jwt_secret .
```

2. Run the container:
```bash
docker run -p 3000:3000 -v $(pwd)/public/uploads:/app/public/uploads storeit
```

## API Documentation

StoreIt provides a comprehensive RESTful API for integration with other applications.

### Authentication

```
POST /api/auth/register - Register a new user
POST /api/auth/login - Authenticate a user
POST /api/auth/logout - Logout the current user
```

### File Management

```
GET /api/files - List files accessible to the user
POST /api/files/upload - Upload a new file
GET /api/files/{id} - Get file details
PATCH /api/files/{id} - Update file metadata
DELETE /api/files/{id} - Delete a file
GET /api/files/download?id={id} - Download a file
```

### File Sharing

```
POST /api/files/share - Share a file with another user
DELETE /api/files/share - Remove file sharing
```

### User Management

```
GET /api/users?search={query} - Search for users
```

### Dashboard

```
GET /api/dashboard - Get dashboard statistics
```

## Project Structure

```
/storeit
├── components
│   ├── Auth
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── Layout
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── FileManagement
│       ├── FileUpload.jsx
│       ├── FileList.jsx
│       └── FileActions.jsx
├── lib
│   ├── db.js
│   ├── auth.js
│   └── fileStorage.js
├── pages
│   ├── api
│   │   ├── auth
│   │   │   ├── login.js
│   │   │   ├── logout.js
│   │   │   └── register.js
│   │   ├── files
│   │   │   ├── index.js
│   │   │   ├── [id].js
│   │   │   ├── upload.js
│   │   │   └── download.js
│   │   └── users
│   │       ├── index.js
│   │       └── [id].js
│   ├── _app.js
│   ├── index.js
│   ├── login.js
│   ├── register.js
│   ├── dashboard.js
│   └── files
│       ├── index.js
│       └── [id].js
├── public
│   └── uploads (for storing files)
├── styles
│   ├── globals.css
│   └── Home.module.css
├── middleware.js (for route protection)
├── contexts
│   └── AuthContext.js
├── utils
│   ├── api.js
│   └── auth.js
├── .env.local
├── package.json
└── next.config.js
```

## Security Considerations

- **File Access**: Files are secured by user permissions and authentication
- **Token Expiration**: JWTs expire after 24 hours requiring re-authentication
- **Password Security**: Passwords are hashed with bcrypt before storage
- **Public Files**: Only explicitly marked files can be accessed without authentication
- **Error Handling**: Error messages are logged but don't expose sensitive information

## Logging

The application includes comprehensive logging for debugging and monitoring:

- Authentication flows
- File operations (upload, download, share)
- API requests and responses
- Error handling and exceptions
- User actions and permission checks

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the React framework
- TailwindCSS for the utility-first CSS framework
- MySQL team for the database engine
