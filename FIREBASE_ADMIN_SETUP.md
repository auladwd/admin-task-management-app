# Firebase Admin SDK Setup Guide

এই guide টি Firebase Admin SDK setup করার জন্য যা Team Leader দের নতুন user তৈরি
করতে দেয় তাদের নিজের session logout না করে।

## সমস্যা

আগে যখন Team Leader নতুন user তৈরি করত, তখন Firebase client SDK এর
`createUserWithEmailAndPassword` function ব্যবহার করা হত যা automatically
current logged-in user কে logout করে দিত।

## সমাধান

Firebase Admin SDK ব্যবহার করে server-side থেকে user তৈরি করা হয়, যা current
session কে প্রভাবিত করে না।

## Setup Steps

### 1. Firebase Admin SDK Credentials পান

1. Firebase Console এ যান: https://console.firebase.google.com/
2. আপনার project select করুন
3. Settings (⚙️) > Project Settings এ যান
4. "Service Accounts" tab এ click করুন
5. "Generate New Private Key" button এ click করুন
6. একটি JSON file download হবে

### 2. Environment Variables Configure করুন

`.env.local` file এ নিচের variables add করুন:

#### Option 1: পুরো Service Account JSON ব্যবহার করুন (Recommended)

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

#### Option 2: Individual Fields ব্যবহার করুন

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**

- Private key এ `\n` characters থাকতে হবে line breaks এর জন্য
- যদি আপনি Option 2 ব্যবহার করেন, তাহলে `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  already configured থাকতে হবে

### 3. Package Install করুন

```bash
npm install firebase-admin
```

অথবা যদি already `package.json` এ add করা থাকে:

```bash
npm install
```

### 4. Development Server Restart করুন

```bash
npm run dev
```

## কিভাবে কাজ করে

1. Team Leader "Add New User" button এ click করে
2. User information fill করে (name, email, password, role)
3. Frontend `/api/users/create` endpoint এ request পাঠায়
4. Backend Firebase Admin SDK ব্যবহার করে নতুন user তৈরি করে
5. MongoDB তে user profile save করে
6. Team Leader এর session unchanged থাকে

## Security Notes

- Service Account credentials খুবই sensitive - এগুলো কখনো public repository তে
  commit করবেন না
- `.env.local` file `.gitignore` এ থাকা নিশ্চিত করুন
- Production এ environment variables secure ভাবে manage করুন (Vercel, AWS, etc.)

## Troubleshooting

### Error: "Firebase Admin initialization error"

- Check করুন যে environment variables সঠিকভাবে set করা আছে
- Private key তে proper line breaks (`\n`) আছে কিনা verify করুন
- Service Account JSON valid কিনা check করুন

### Error: "Failed to create user in Firebase"

- Firebase Console এ check করুন Authentication enabled আছে কিনা
- Email/Password sign-in method enabled আছে কিনা verify করুন
- Service Account এর proper permissions আছে কিনা check করুন

### User তৈরি হয় কিন্তু MongoDB এ save হয় না

- MongoDB connection string check করুন
- Database permissions verify করুন
- Console logs check করুন error details এর জন্য

## Testing

1. Team Leader account দিয়ে login করুন
2. "User Management" page এ যান
3. "Add New User" button এ click করুন
4. নতুন user এর information fill করুন
5. "Create User" button এ click করুন
6. Verify করুন যে:
   - User successfully তৈরি হয়েছে
   - আপনি logged in আছেন (logout হননি)
   - নতুন user Firebase Authentication এ দেখা যাচ্ছে
   - নতুন user MongoDB তে save হয়েছে

## Files Changed

- `src/lib/firebaseAdmin.js` - Firebase Admin SDK initialization
- `src/app/api/users/create/route.js` - New API endpoint for user creation
- `src/app/users/page.js` - Updated to use new API endpoint
- `package.json` - Added firebase-admin dependency
- `.env.local.example` - Added Firebase Admin credentials template
