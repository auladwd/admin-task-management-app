# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB installed (local) OR MongoDB Atlas account (cloud)
- Firebase project created

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example file
copy .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

**Firebase Configuration:**

- Get from Firebase Console > Project Settings > Your apps
- See `FIREBASE_SETUP.md` for detailed instructions

**MongoDB Configuration:**

- Local: `mongodb://localhost:27017/task_management`
- Atlas: See `MONGODB_SETUP.md` for connection string

### 3. Start Development Server

```bash
npm run dev
```

Server will start at: http://localhost:3000

### 4. Initialize Database

Open your browser and navigate to:

```
http://localhost:3000/api/init-db
```

You should see:

```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

### 5. Test Database Connection

Navigate to:

```
http://localhost:3000/api/test-db
```

You should see your collections and document counts.

### 6. Create First User

1. Navigate to: http://localhost:3000/register
2. Fill in the registration form:
   - Full Name: Your Name
   - Email: your.email@example.com
   - Role: Team Leader (for full access)
   - Password: minimum 6 characters
3. Click "Create Account"

### 7. Login

1. Navigate to: http://localhost:3000/login
2. Enter your credentials
3. You'll be redirected to the dashboard

## Verify Setup

### Check Firebase Authentication

- Go to Firebase Console > Authentication > Users
- You should see your registered user

### Check MongoDB

- Open MongoDB Compass (if using local MongoDB)
- Connect to your database
- You should see:
  - Database: `task_management`
  - Collections: `users`, `tasks`, `comments`, `activity_logs`
  - Your user document in `users` collection

## Default User Roles

### Super Admin (Director)

- Read-only access to all tasks
- View analytics and reports
- Cannot create or edit tasks

### Team Leader (Admin)

- Full system control
- Create and assign tasks
- Manage users
- View analytics

### Staff Members

- View assigned tasks only
- Update task status
- Add comments

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"

- Check `.env.local` has all Firebase variables
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Failed to connect to database"

- Verify MongoDB is running (local)
- Check connection string in `.env.local`
- For Atlas: Check IP whitelist and credentials

### "User already exists"

- User is already registered in Firebase
- Try logging in instead
- Or use a different email

### Port 3000 already in use

```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm run dev
```

## Next Steps

After successful setup:

1. ✅ Create test users with different roles
2. ✅ Explore the dashboard
3. ✅ Create sample tasks
4. ✅ Test task assignment
5. ✅ Try different user roles

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## API Endpoints for Testing

- `GET /api/test-db` - Test database connection
- `GET /api/init-db` - Initialize database
- `POST /api/auth/register` - Register user
- `GET /api/auth/user?uid={uid}` - Get user by UID

## Support

If you encounter issues:

1. Check `FIREBASE_SETUP.md` for Firebase configuration
2. Check `MONGODB_SETUP.md` for MongoDB setup
3. Verify all environment variables are set
4. Check console for error messages
5. Ensure all services are running

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── contexts/         # React contexts
├── lib/             # Database and Firebase config
├── services/        # Business logic
└── utils/           # Helper functions
```

## What's Next?

Continue with the remaining implementation steps:

- Step 6: Database Schemas ✅ (Completed)
- Step 7: Authentication Context
- Step 8: Role-Based Route Protection
- Step 9: Dashboard UI
- Step 10: Task Management Module
- And more...
