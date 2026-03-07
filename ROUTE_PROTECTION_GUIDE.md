# Route Protection & Navigation Guide

## Overview

This application implements comprehensive role-based route protection with three
user roles:

- **Super Admin (Director)** - Read-only access to all data
- **Team Leader (Admin)** - Full system control
- **Staff Members** - Limited access to assigned tasks

## Route Protection Layers

### 1. Middleware (`src/middleware.js`)

Server-side middleware that runs before every request:

- Identifies public vs protected routes
- Allows API routes and static files
- Provides logging and monitoring foundation

### 2. Client-Side Guards

**AuthGuard** - Protects authenticated routes

```javascript
import AuthGuard from '@/components/auth/AuthGuard';

<AuthGuard>
  <ProtectedContent />
</AuthGuard>;
```

**GuestGuard** - Protects guest-only routes

```javascript
import GuestGuard from '@/components/auth/GuestGuard';

<GuestGuard>
  <LoginForm />
</GuestGuard>;
```

**RoleGuard** - Protects role-specific routes

```javascript
import RoleGuard from '@/components/auth/RoleGuard';

<RoleGuard allowedRoles={['team_leader']}>
  <AdminContent />
</RoleGuard>;
```

## Application Routes

### Public Routes (No Authentication Required)

- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset page

### Protected Routes (Authentication Required)

#### All Roles Can Access:

- `/dashboard` - Main dashboard (role-specific views)
- `/tasks` - Tasks page (filtered by role)

#### Team Leader Only:

- `/users` - User management

#### Super Admin & Team Leader:

- `/performance` - Performance evaluation
- `/reports` - Report generation

### Special Routes:

- `/unauthorized` - Access denied page
- `/` - Redirects to `/login`

## Navigation Menu (Sidebar)

The sidebar navigation is dynamically generated based on user role:

### Super Admin Navigation:

- Dashboard
- Tasks (view only)
- Performance
- Reports

### Team Leader Navigation:

- Dashboard
- Tasks (full control)
- Users
- Performance
- Reports

### Staff Navigation:

- Dashboard
- Tasks (assigned only)

## Role-Based Permissions

### Super Admin (Director)

**Can:**

- View all tasks
- View analytics dashboard
- View performance reports
- Export reports to PDF/Excel

**Cannot:**

- Create tasks
- Edit tasks
- Delete tasks
- Assign tasks
- Manage users

**Code Check:**

```javascript
const { isSuperAdmin, isReadOnly } = useAuth();

if (isSuperAdmin()) {
  // Super admin specific code
}

if (isReadOnly()) {
  // Hide edit/delete buttons
}
```

### Team Leader (Admin)

**Can:**

- Full system control
- Create tasks
- Assign tasks
- Edit/delete tasks
- Manage users
- View analytics
- Evaluate staff performance
- Export reports

**Cannot:**

- Nothing - full access

**Code Check:**

```javascript
const { isTeamLeader, canManageTasks } = useAuth();

if (isTeamLeader()) {
  // Team leader specific code
}

if (canManageTasks()) {
  // Show create/edit/delete buttons
}
```

### Staff Members

**Can:**

- View assigned tasks only
- Update task status
- Add comments
- Upload file links

**Cannot:**

- Create tasks
- Assign tasks
- View other staff tasks
- Manage users
- Access analytics
- Generate reports

**Code Check:**

```javascript
const { isStaff } = useAuth();

if (isStaff()) {
  // Staff specific code
  // Show only assigned tasks
}
```

## Page Protection Examples

### Basic Authentication Protection

```javascript
// src/app/dashboard/page.js
'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  return (
    <MainLayout title="Dashboard">
      <div>Dashboard content</div>
    </MainLayout>
  );
}
```

### Role-Based Protection

```javascript
// src/app/users/page.js
'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import RoleGuard from '@/components/auth/RoleGuard';
import MainLayout from '@/components/layout/MainLayout';

export default function UsersPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['team_leader']}>
        <UsersContent />
      </RoleGuard>
    </AuthGuard>
  );
}
```

### Multiple Roles

```javascript
// src/app/performance/page.js
export default function PerformancePage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin', 'team_leader']}>
        <PerformanceContent />
      </RoleGuard>
    </AuthGuard>
  );
}
```

## Conditional UI Rendering

### Show/Hide Based on Permissions

```javascript
import { useAuth } from '@/hooks/useAuth';

function TaskActions() {
  const { canManageTasks, isReadOnly } = useAuth();

  return (
    <div>
      {/* Everyone can view */}
      <button>View Details</button>

      {/* Only team leaders can create */}
      {canManageTasks() && <button>Create Task</button>}

      {/* Hide for read-only users */}
      {!isReadOnly() && <button>Update Status</button>}
    </div>
  );
}
```

### Role-Specific Components

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

## Layout Components

### MainLayout

Wraps all authenticated pages with sidebar and navbar:

```javascript
import MainLayout from '@/components/layout/MainLayout';

<MainLayout title="Page Title">
  <div>Page content</div>
</MainLayout>;
```

**Features:**

- Responsive sidebar navigation
- Top navbar with user info
- Theme toggle
- Logout functionality
- Mobile menu support

### Sidebar

**Features:**

- Role-based navigation menu
- Active route highlighting
- User profile display
- Theme toggle
- Logout button
- Mobile responsive with overlay

### Navbar

**Features:**

- Page title display
- Search button
- Notifications dropdown
- User avatar with dropdown
- Theme toggle (desktop)

## Mobile Responsiveness

### Sidebar Behavior:

- **Desktop (lg+):** Always visible, sticky position
- **Mobile:** Hidden by default, slides in with overlay
- **Toggle:** Hamburger menu button in top-left

### Layout Adjustments:

- Sidebar: 256px width on desktop
- Main content: Flexible width
- Navbar: Full width, responsive padding
- Cards: Stack on mobile, grid on desktop

## Navigation Flow

### First Visit:

1. User lands on `/` (home)
2. Redirects to `/login`
3. User logs in
4. Redirects to `/dashboard`

### Authenticated User:

1. User navigates to protected route
2. AuthGuard checks authentication
3. If authenticated, renders content
4. If not, redirects to `/login`

### Role Check:

1. User navigates to role-protected route
2. AuthGuard checks authentication
3. RoleGuard checks user role
4. If authorized, renders content
5. If not, redirects to `/dashboard` or `/unauthorized`

### Logout:

1. User clicks logout
2. Firebase signs out
3. Context clears user data
4. Redirects to `/login`

## Best Practices

### 1. Always Use Guards

```javascript
// ✅ Good
<AuthGuard>
  <RoleGuard allowedRoles={['team_leader']}>
    <Content />
  </RoleGuard>
</AuthGuard>

// ❌ Bad - No protection
<Content />
```

### 2. Check Permissions in UI

```javascript
// ✅ Good
{
  canManageTasks() && <CreateButton />;
}

// ❌ Bad - Shows to everyone
<CreateButton />;
```

### 3. Use MainLayout for Consistency

```javascript
// ✅ Good
<MainLayout title="Tasks">
  <TasksList />
</MainLayout>

// ❌ Bad - Inconsistent layout
<div>
  <TasksList />
</div>
```

### 4. Handle Loading States

```javascript
// ✅ Good
if (loading) return <Loading />;
return <Content />;

// ❌ Bad - No loading state
return <Content />;
```

### 5. Provide Feedback

```javascript
// ✅ Good
await logout();
toast.success('Logged out successfully');
router.push('/login');

// ❌ Bad - No feedback
await logout();
router.push('/login');
```

## Testing Route Protection

### Test Cases:

1. **Unauthenticated Access**
   - Try accessing `/dashboard` without login
   - Should redirect to `/login`

2. **Role-Based Access**
   - Login as Staff
   - Try accessing `/users`
   - Should redirect to `/dashboard` or `/unauthorized`

3. **Guest Routes**
   - Login as any user
   - Try accessing `/login`
   - Should redirect to `/dashboard`

4. **Navigation Menu**
   - Login with different roles
   - Verify correct menu items show
   - Verify active route highlighting

5. **Logout**
   - Click logout button
   - Verify redirect to login
   - Verify cannot access protected routes

## Troubleshooting

### Issue: Infinite redirect loop

**Solution:** Check guard nesting and redirect paths

### Issue: Menu items not showing

**Solution:** Verify user role in database matches expected role

### Issue: Mobile menu not closing

**Solution:** Ensure onClick handlers call setIsMobileMenuOpen(false)

### Issue: Theme not persisting

**Solution:** Check localStorage is enabled and ThemeProvider is mounted

### Issue: Unauthorized access

**Solution:** Verify RoleGuard allowedRoles array includes user's role
