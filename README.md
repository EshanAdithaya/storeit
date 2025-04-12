// Project Structure
/*
/file-server-app
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
├── .env.local
├── package.json
└── next.config.js
*/



// SQL setup script - create tables
/*
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
*/
