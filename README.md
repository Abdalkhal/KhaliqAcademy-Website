# Khaliq Academy - E-Learning Platform

A secure, activation-code-based e-learning platform built for **Abdulkhaliq Abdulrahman Ramadan**.

## Features

### Student Features
- Browse courses with modern UI
- Activation code-based access (no registration needed)
- Secure video streaming with token-based access
- Quiz system under each lecture
- Course progress tracking
- Device binding (max 2 devices per code)

### Admin Features
- Dashboard with statistics
- Course management (CRUD)
- Lecture management with video upload
- Quiz management
- **One-click code generation** per course
- Bulk code generation
- Enrollment tracking with device info
- Student management

### Security Features
- SHA-256 hashed activation codes
- JWT authentication
- Rate limiting on activation attempts
- Device fingerprinting
- IP tracking
- Token-based video streaming (2-hour expiry)
- Anti-download video protection

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, MongoDB
- **Security**: bcryptjs, JWT, express-rate-limit, helmet

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/khaliq_elearning
JWT_SECRET=your_super_secret_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...
NODE_ENV=development
```

Seed database:
```bash
npm run seed
```

Start server:
```bash
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Admin Setup
First time setup - create admin:
```bash
curl -X POST http://localhost:5000/api/admin/setup   -H "Content-Type: application/json"   -d '{"setupKey":"khaliq-setup-2024","username":"admin","password":"admin123","name":"Abdulkhaliq"}'
```

Or use the seeded default: **admin / admin123**

## Default Login
- **Admin**: admin / admin123 (change in production!)

## Project Structure
```
khaliq-elearning/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, rate limiting, upload
│   ├── utils/            # Code generator, JWT
│   ├── uploads/          # Video & image storage
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Auth context
│   │   └── utils/        # API client
│   └── package.json
```

## Deployment

### Backend (e.g., Railway/Render/Heroku)
1. Set environment variables
2. Connect MongoDB Atlas
3. Deploy with `npm start`

### Frontend (e.g., Vercel/Netlify)
1. Build: `npm run build`
2. Set `VITE_API_URL` to your backend URL
3. Deploy `dist/` folder

## Contact
For support: **@khaliq29** on Telegram

---
Built with ❤️ by Abdulkhaliq Abdulrahman Ramadan
Northern Technical University - Cyber Security Engineering
