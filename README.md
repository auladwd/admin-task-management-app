# Task Management System

A modern, production-ready task management web application built for
Administration Departments.

## Features

- 🔐 Role-based authentication (Super Admin, Team Leader, Staff)
- 📊 Interactive analytics dashboard
- ✅ Complete task management system
- 📈 Performance evaluation & leaderboard
- 📄 Report generation (PDF/Excel export)
- 🌓 Dark/Light mode support
- 📱 Fully responsive design
- 🔔 Real-time notifications
- 📝 Activity logging system

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React
- **Styling**: Tailwind CSS, DaisyUI
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Native Driver)
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running
- Firebase project created

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your credentials:

   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── contexts/              # React Context providers
├── lib/                   # Utility libraries
├── services/              # Business logic & API services
└── hooks/                 # Custom React hooks
```

## User Roles

### Super Admin (Director)

- Read-only access to all tasks
- View analytics and reports
- Export reports

### Team Leader (Admin)

- Full system control
- Create and assign tasks
- Manage users
- Evaluate performance

### Staff Members

- View assigned tasks
- Update task status
- Add comments and attachments

## License

Private - All rights reserved
