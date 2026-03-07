# Context & Hooks Usage Guide

## Authentication Context

### Using the Auth Context

```javascript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const {
    user, // Firebase user object
    userProfile, // MongoDB user profile with role
    loading, // Loading state
    isAuthenticated, // Boolean: is user logged in?
    logout, // Function to logout
    hasRole, // Check specific role
    isSuperAdmin, // Check if super admin
    isTeamLeader, // Check if team leader
    isStaff, // Check if staff
    canManageTasks, // Check if can create/edit tasks
    isReadOnly, // Check if read-only access
  } = useAuth();

  // Use the auth state
  if (loading) return <Loading />;

  return (
    <div>
      <p>Welcome, {userProfile?.name}</p>
      <p>Role: {userProfile?.role}</p>
      {canManageTasks() && <button>Create Task</button>}
    </div>
  );
}
```

### Auth Context Methods

**hasRole(role)**

```javascript
const { hasRole } = useAuth();

if (hasRole('team_leader')) {
  // User is team leader
}
```

**hasAnyRole(roles)**

```javascript
const { hasAnyRole } = useAuth();

if (hasAnyRole(['team_leader', 'super_admin'])) {
  // User is either team leader or super admin
}
```

**Role Check Helpers**

```javascript
const { isSuperAdmin, isTeamLeader, isStaff } = useAuth();

if (isSuperAdmin()) {
  // Super admin specific code
}

if (isTeamLeader()) {
  // Team leader specific code
}

if (isStaff()) {
  // Staff specific code
}
```

**Permission Checks**

```javascript
const { canManageTasks, isReadOnly } = useAuth();

if (canManageTasks()) {
  // Can create, edit, delete tasks
}

if (isReadOnly()) {
  // Can only view, cannot modify
}
```

## Theme Context

### Using the Theme Context

```javascript
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const {
    theme, // Current theme: 'light' or 'dark'
    toggleTheme, // Toggle between themes
    setTheme, // Set specific theme
    isDark, // Check if dark mode
    mounted, // Check if theme is loaded
  } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      {isDark() && <p>Dark mode is active</p>}
    </div>
  );
}
```

### Theme Toggle Component

```javascript
import ThemeToggle from '@/components/common/ThemeToggle';

function Navbar() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

## Route Guards

### AuthGuard - Protect Authenticated Routes

```javascript
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div>Protected dashboard content</div>
    </AuthGuard>
  );
}
```

### GuestGuard - Protect Guest-Only Routes

```javascript
import GuestGuard from '@/components/auth/GuestGuard';

export default function LoginPage() {
  return (
    <GuestGuard>
      <div>Login form</div>
    </GuestGuard>
  );
}
```

### RoleGuard - Protect Role-Based Routes

```javascript
import RoleGuard from '@/components/auth/RoleGuard';

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['team_leader', 'super_admin']}>
      <div>Admin only content</div>
    </RoleGuard>
  );
}
```

**With Custom Redirect:**

```javascript
<RoleGuard allowedRoles={['team_leader']} redirectTo="/unauthorized">
  <div>Team leader only content</div>
</RoleGuard>
```

## Custom Hooks

### useTasks Hook

```javascript
import { useTasks } from '@/hooks/useTasks';

function TaskList() {
  const {
    tasks, // Array of tasks
    loading, // Loading state
    error, // Error message
    createTask, // Create new task
    updateTask, // Update task
    deleteTask, // Delete task
    refresh, // Refresh task list
  } = useTasks({ status: 'pending' });

  const handleCreate = async () => {
    await createTask({
      title: 'New Task',
      description: 'Task description',
      assignee: 'user_uid',
      priority: 'high',
      dueDate: new Date(),
    });
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task._id}>{task.title}</div>
      ))}
    </div>
  );
}
```

**With Filters:**

```javascript
const { tasks } = useTasks({
  status: 'in_progress',
  priority: 'high',
  assignee: 'user_uid',
});
```

## Conditional Rendering Based on Role

### Show/Hide UI Elements

```javascript
import { useAuth } from '@/hooks/useAuth';

function TaskActions({ task }) {
  const { canManageTasks, isReadOnly } = useAuth();

  return (
    <div>
      {/* Everyone can view */}
      <button>View Details</button>

      {/* Only team leaders can edit */}
      {canManageTasks() && <button>Edit Task</button>}

      {/* Hide for read-only users */}
      {!isReadOnly() && <button>Update Status</button>}
    </div>
  );
}
```

### Role-Based Components

```javascript
import { useAuth } from '@/hooks/useAuth';

function Dashboard() {
  const { isSuperAdmin, isTeamLeader, isStaff } = useAuth();

  return (
    <div>
      {isSuperAdmin() && <SuperAdminDashboard />}
      {isTeamLeader() && <TeamLeaderDashboard />}
      {isStaff() && <StaffDashboard />}
    </div>
  );
}
```

## Complete Page Example

```javascript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import AuthGuard from '@/components/auth/AuthGuard'
import Loading from '@/components/common/Loading'

export default function TasksPage() {
  return (
    <AuthGuard>
      <TasksContent />
    </AuthGuard>
  )
}

function TasksContent() {
  const { userProfile, canManageTasks } = useAuth()
  const { tasks, loading, createTask } = useTasks()

  if (loading) return <Loading />

  return (
    <div>
      <h1>Tasks for {userProfile.name}</h1>

      {canManageTasks() && (
        <button onClick={() => createTask({...})}>
          Create New Task
        </button>
      )}

      <div>
        {tasks.map(task => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  )
}
```

## Provider Setup

The app is wrapped with all providers in `src/app/layout.js`:

```javascript
import AppProviders from '@/components/providers/AppProviders';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

## Best Practices

1. **Always use guards for protected routes**

   ```javascript
   <AuthGuard>
     <ProtectedContent />
   </AuthGuard>
   ```

2. **Check permissions before showing UI**

   ```javascript
   {
     canManageTasks() && <EditButton />;
   }
   ```

3. **Handle loading states**

   ```javascript
   if (loading) return <Loading />;
   ```

4. **Use role-specific components**

   ```javascript
   {
     isTeamLeader() && <AdminPanel />;
   }
   ```

5. **Refresh data after mutations**
   ```javascript
   await createTask(data);
   refresh(); // Refresh task list
   ```
