# Firebase Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `task-management-app`
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" switch
   - Click "Save"

## Step 3: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Register app with nickname: `task-management-web`
6. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. Open `.env.local` file in your project root
2. Add your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 5: Test Authentication

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/register`
3. Create a test account
4. Check Firebase Console > Authentication > Users to verify

## Firebase Security Rules (Optional)

For production, configure Firebase Security Rules in the Firebase Console.

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"

- Make sure all environment variables are set correctly
- Restart your development server after adding env variables

### Error: "Firebase: Error (auth/operation-not-allowed)"

- Enable Email/Password authentication in Firebase Console
- Go to Authentication > Sign-in method > Email/Password > Enable

### Error: "Firebase: Error (auth/unauthorized-domain)"

- Add your domain to authorized domains
- Go to Authentication > Settings > Authorized domains
- Add `localhost` for development

## Next Steps

After Firebase is configured:

1. Test user registration
2. Test user login
3. Test password reset
4. Proceed to MongoDB setup (Step 5)
