# 🚀 Khaliq Academy - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Admin Setup](#admin-setup)
7. [Production Deployment](#production-deployment)
8. [Security Checklist](#security-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ installed
- **MongoDB** (local or Atlas cloud database)
- **Git** for version control
- A code editor (VS Code recommended)

### Install Node.js
```bash
# Check if Node.js is installed
node --version

# If not installed, download from https://nodejs.org/
# Or use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Install MongoDB (Local)
```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**OR use MongoDB Atlas (Cloud - Recommended for Production)**
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string

---

## Local Development Setup

### 1. Extract the Project
```bash
# If you downloaded the ZIP
unzip khaliq-elearning.zip
cd khaliq-elearning

# Or clone from GitHub (if you push it there)
git clone <your-repo-url>
cd khaliq-elearning
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Setup Frontend
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install
```

---

## Environment Configuration

### Backend .env file
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/khaliq_elearning
JWT_SECRET=your_super_secret_random_string_min_32_chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$YourHashedPasswordHere
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Important:**
- Change `JWT_SECRET` to a long random string (use `openssl rand -base64 32`)
- For production, use MongoDB Atlas URI instead of localhost
- Generate admin password hash using bcrypt

### Generate Admin Password Hash
```bash
# In Node.js REPL
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 12).then(h => console.log(h))"
```

### Frontend .env file (create in frontend/)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Database Setup

### Option A: Local MongoDB
```bash
# Make sure MongoDB is running
mongod --version

# The app will auto-create collections on first run
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier available)
3. Add your IP to Network Access whitelist
4. Create a database user
5. Get connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/khaliq_elearning?retryWrites=true&w=majority
```
6. Paste this in your `.env` file as `MONGODB_URI`

### Seed the Database
```bash
cd backend
npm run seed
```

This creates:
- Default admin account (admin/admin123)
- 4 sample courses (Computer Networks, Architecture, DSP, Hardware Security)

---

## Running the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
# App opens at http://localhost:3000
```

### Verify Everything Works
1. Open http://localhost:3000 - You should see the homepage
2. Open http://localhost:5000/api/health - Should return `{"status":"OK"}`
3. Go to http://localhost:3000/admin - Admin login page

---

## Admin Setup

### First-Time Admin Creation
```bash
# Using curl
curl -X POST http://localhost:5000/api/admin/setup   -H "Content-Type: application/json"   -d '{
    "setupKey": "khaliq-setup-2024",
    "username": "admin",
    "password": "your_secure_password",
    "name": "Abdulkhaliq"
  }'
```

**OR** use the seeded default:
- Username: `admin`
- Password: `admin123`

**⚠️ Change this immediately in production!**

### Access Admin Dashboard
1. Go to http://localhost:3000/admin
2. Login with admin credentials
3. You'll see the dashboard with stats

---

## Production Deployment

### Method 1: Render.com (Easiest - Free Tier)

#### Backend Deployment
1. Push code to GitHub
2. Go to https://render.com
3. Create "New Web Service"
4. Connect your GitHub repo
5. Set build command: `cd backend && npm install`
6. Set start command: `cd backend && npm start`
7. Add environment variables from your `.env`
8. Deploy!

#### Frontend Deployment
1. On Render, create "New Static Site"
2. Connect same repo
3. Build command: `cd frontend && npm install && npm run build`
4. Publish directory: `frontend/dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
6. Deploy!

### Method 2: Railway.app (Alternative)
Similar process to Render. Railway auto-detects Node.js apps.

### Method 3: VPS (DigitalOcean, AWS, Linode)

#### Server Setup
```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Clone your repo
git clone https://github.com/yourusername/khaliq-elearning.git
cd khaliq-elearning
```

#### Build & Deploy
```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install
npm run build

# Copy build to backend for serving
cp -r dist ../backend/dist
```

#### Update Backend server.js for Production
Add this to `server.js` before the error handler:
```javascript
// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });
}
```

#### Start with PM2
```bash
cd backend
pm2 start server.js --name "khaliq-academy"
pm2 startup
pm2 save
```

#### Setup Nginx (Reverse Proxy)
```bash
sudo apt-get install nginx

# Edit config
sudo nano /etc/nginx/sites-available/khaliq-academy
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/khaliq-academy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Setup SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Security Checklist

Before going live, verify:

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ random chars)
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up rate limiting (already configured)
- [ ] CORS configured for your domain only
- [ ] .env file NOT committed to git
- [ ] Video uploads limited to authenticated admins
- [ ] Regular database backups enabled

---

## Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Check port availability
lsof -i :5000

# View logs
npm run dev
```

### Frontend can't connect to backend
1. Check `VITE_API_URL` in frontend `.env`
2. Ensure backend CORS allows frontend URL
3. Check browser console for errors

### Videos not playing
1. Check video file exists in `backend/uploads/videos/`
2. Verify video token is generated correctly
3. Check browser network tab for 403 errors

### Admin login not working
1. Ensure admin exists in database
2. Check `ADMIN_PASSWORD_HASH` in `.env`
3. Try running seed script again

---

## Contact & Support

For technical support or questions:
- **Telegram:** @khaliq29
- **University:** Northern Technical University
- **Field:** Cyber Security Engineering

---

**Built with ❤️ by Abdulkhaliq Abdulrahman Ramadan**
