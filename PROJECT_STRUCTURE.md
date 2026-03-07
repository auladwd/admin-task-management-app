# Project Structure

```
task-management-app/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── register/
│   │   │   │       └── route.js      # User registration endpoint
│   │   │   ├── tasks/
│   │   │   │   └── route.js          # Tasks CRUD endpoints
│   │   │   ├── users/
│   │   │   ├── comments/
│   │   │   ├── activity/
│   │   │   ├── reports/
│   │   │   └── performance/
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.js               # Main dashboard page
│   │   ├── tasks/
│   │   │   ├── page.js               # Tasks list page
│   │   │   └── [id]/
│   │   │       └── page.js           # Task detail page
│   │   ├── reports/
│   │   │   └── page.js               # Reports page
│   │   ├── performance/
│   │   │   └── page.js               # Performance evaluation page
│   │   ├── users/
│   │   │   └── page.js               # User management page
│   │   ├── login/
│   │   │   └── page.js               # Login page
│   │   ├── register/
│   │   │   └── page.js               # Register page
│   │   ├── layout.js                 # Root layout
│   │   ├── page.js                   # Home page (redirects to login)
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # Reusable Components
│   │   ├── layout/
│   │   │   ├── MainLayout.js         # Main app layout wrapper
│   │   │   ├── Sidebar.js            # Sidebar navigation
│   │   │   └── Navbar.js             # Top navigation bar
│   │   ├── dashboard/
│   │   │   ├── StatCard.js           # Statistics card
│   │   │   ├── TaskChart.js          # Charts (Pie, Bar)
│   │   │   ├── Leaderboard.js        # Performance leaderboard
│   │   │   └── ActivityFeed.js       # Recent activity feed
│   │   ├── tasks/
│   │   │   ├── TaskTable.js          # Tasks data table
│   │   │   ├── TaskModal.js          # Create/Edit task modal
│   │   │   ├── TaskCard.js           # Task card component
│   │   │   ├── TaskFilters.js        # Filter controls
│   │   │   └── TaskDetails.js        # Task detail view
│   │   ├── auth/
│   │   │   ├── LoginForm.js          # Login form
│   │   │   ├── RegisterForm.js       # Registration form
│   │   │   └── ProtectedRoute.js     # Route protection HOC
│   │   ├── reports/
│   │   │   ├── ReportFilters.js      # Report filter controls
│   │   │   └── ReportTable.js        # Report data table
│   │   └── common/
│   │       ├── Loading.js            # Loading spinner
│   │       ├── Modal.js              # Reusable modal
│   │       ├── Pagination.js         # Pagination component
│   │       └── ThemeToggle.js        # Dark/Light mode toggle
│   │
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.js            # Authentication state
│   │   └── ThemeContext.js           # Theme state (dark/light)
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuth.js                # Authentication hook
│   │   ├── useTasks.js               # Tasks data hook
│   │   └── useTheme.js               # Theme hook
│   │
│   ├── lib/                          # Library configurations
│   │   ├── firebase.js               # Firebase config & initialization
│   │   └── mongodb.js                # MongoDB connection utility
│   │
│   ├── services/                     # Business Logic & API Services
│   │   ├── authService.js            # Authentication operations
│   │   ├── taskService.js            # Task operations
│   │   ├── userService.js            # User operations
│   │   ├── activityService.js        # Activity logging
│   │   ├── reportService.js          # Report generation
│   │   └── performanceService.js     # Performance calculations
│   │
│   └── utils/                        # Utility Functions
│       ├── constants.js              # App constants (roles, status, etc.)
│       ├── helpers.js                # Helper functions
│       └── validators.js             # Input validation functions
│
├── public/                           # Static Assets
│   ├── images/
│   └── icons/
│
├── .env.local.example                # Environment variables template
├── .gitignore                        # Git ignore rules
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── jsconfig.json                     # JavaScript configuration
├── package.json                      # Dependencies & scripts
├── README.md                         # Project documentation
└── PROJECT_STRUCTURE.md              # This file
```

## Key Directories Explained

### `/src/app`

Next.js 14 App Router pages and API routes. Each folder represents a route in
the application.

### `/src/components`

Reusable React components organized by feature/domain.

### `/src/contexts`

React Context API providers for global state management.

### `/src/hooks`

Custom React hooks for reusable logic.

### `/src/lib`

Third-party library configurations (Firebase, MongoDB).

### `/src/services`

Business logic layer - handles data operations and API calls.

### `/src/utils`

Utility functions, constants, and helpers used throughout the app.

## Database Collections (MongoDB)

1. **users** - User accounts and roles
2. **tasks** - Task records
3. **comments** - Task comments
4. **activity_logs** - System activity tracking

## API Routes Structure

- `POST /api/auth/register` - User registration
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `GET /api/users` - Get all users
- `GET /api/performance` - Get performance metrics
- `POST /api/reports/generate` - Generate reports
- `GET /api/activity` - Get activity logs
