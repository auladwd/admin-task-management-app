# User Creation Logout সমস্যার সমাধান

## সমস্যা

Team Leader যখন নতুন user তৈরি করত, তখন তাদের account logout হয়ে যেত।

## কারণ

Firebase client SDK এর `createUserWithEmailAndPassword()` function automatically
current logged-in user কে logout করে দেয়।

## সমাধান

Firebase Admin SDK ব্যবহার করে server-side থেকে user তৈরি করা হয়েছে, যা current
session কে প্রভাবিত করে না।

## পরিবর্তিত Files

1. **src/lib/firebaseAdmin.js** (নতুন)
   - Firebase Admin SDK initialization

2. **src/app/api/users/create/route.js** (নতুন)
   - Server-side user creation API endpoint
   - Firebase Admin SDK ব্যবহার করে user তৈরি করে
   - MongoDB তে user profile save করে

3. **src/app/users/page.js** (আপডেট)
   - নতুন `/api/users/create` endpoint ব্যবহার করে
   - পুরানো client-side Firebase authentication code remove করা হয়েছে

4. **package.json** (আপডেট)
   - `firebase-admin` dependency add করা হয়েছে

5. **.env.local.example** (আপডেট)
   - Firebase Admin credentials এর template add করা হয়েছে

## Setup করতে হবে

### 1. Package Install করুন

```bash
npm install
```

### 2. Firebase Service Account Credentials পান

1. Firebase Console > Project Settings > Service Accounts
2. "Generate New Private Key" button এ click করুন
3. JSON file download করুন

### 3. Environment Variables Add করুন

`.env.local` file এ add করুন:

```env
# Option 1: পুরো JSON (Recommended)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# অথবা Option 2: Individual fields
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Server Restart করুন

```bash
npm run dev
```

## Test করুন

1. Team Leader account দিয়ে login করুন
2. User Management page এ যান
3. "Add New User" button এ click করুন
4. নতুন user তৈরি করুন
5. Verify করুন যে আপনি logged in আছেন

## বিস্তারিত Guide

সম্পূর্ণ setup guide এর জন্য `FIREBASE_ADMIN_SETUP.md` দেখুন।
