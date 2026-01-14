# 🎯 USEAUTH HOOK - QUICK REFERENCE

## Import & Usage

```tsx
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    login, 
    logout, 
    hasRole 
  } = useAuth();

  // Your component logic
}
```

---

## API Reference

### State Properties

#### `user: User | null`
Current authenticated user object:
```typescript
{
  id: number;
  username: string;
  email: string;
  role: string;
  full_name?: string;
  employee_code?: string;
}
```

#### `token: string | null`
Current JWT token string

#### `isAuthenticated: boolean`
Whether user is currently authenticated

#### `isLoading: boolean`
Whether auth state is being loaded from localStorage

---

### Functions

#### `login(username, password, endpoint?)`
Login user with credentials

**Parameters**:
- `username: string` - User's username
- `password: string` - User's password
- `endpoint?: '/api/erp/auth/login' | '/api/crm/auth/login'` - Login endpoint (default: ERP)

**Returns**: `Promise<{ success: boolean, data?: any, error?: string }>`

**Example**:
```tsx
const handleLogin = async () => {
  const result = await login('admin', 'password123');
  
  if (result.success) {
    console.log('Login successful:', result.data);
  } else {
    console.error('Login failed:', result.error);
  }
};
```

#### `logout()`
Logout user and clear all auth data

**Example**:
```tsx
<button onClick={logout}>Logout</button>
```

#### `hasRole(role: string | string[])`
Check if user has specific role(s)

**Example**:
```tsx
if (hasRole('admin')) {
  // Show admin features
}

if (hasRole(['admin', 'manager'])) {
  // Show for multiple roles
}
```

#### `isTokenExpiringSoon()`
Check if token will expire within 1 hour

**Example**:
```tsx
useEffect(() => {
  if (isTokenExpiringSoon()) {
    // Prompt user to refresh session
  }
}, [isTokenExpiringSoon]);
```

---

## Usage Examples

### Example 1: Protected Page
```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/erp/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirecting
  }

  return (
    <div>
      <h1>Welcome, {user?.full_name || user?.username}!</h1>
    </div>
  );
}
```

### Example 2: Login Form
```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/erp');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      router.push('/erp');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example 3: Role-Based UI
```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function Dashboard() {
  const { user, hasRole, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.username} ({user?.role})</p>

      {/* Show for all authenticated users */}
      <section>
        <h2>My Tasks</h2>
        {/* Task list */}
      </section>

      {/* Show only for managers and admins */}
      {hasRole(['admin', 'manager']) && (
        <section>
          <h2>Team Management</h2>
          {/* Team management UI */}
        </section>
      )}

      {/* Show only for admins */}
      {hasRole('admin') && (
        <section>
          <h2>System Settings</h2>
          {/* Admin settings */}
        </section>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Example 4: Session Expiry Warning
```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function SessionWarning() {
  const { isTokenExpiringSoon, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpiringSoon()) {
        setShowWarning(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isTokenExpiringSoon]);

  if (!showWarning) return null;

  return (
    <div className="session-warning">
      <p>Your session will expire soon. Please save your work.</p>
      <button onClick={() => window.location.reload()}>
        Refresh Session
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Features

✅ **Automatic State Management**: Loads auth state from localStorage on mount
✅ **Token Expiry Check**: Automatically logs out if token expired
✅ **Type Safety**: Full TypeScript support
✅ **Multi-System Support**: Works with both ERP and CRM
✅ **Role-Based Access**: Built-in role checking
✅ **Auto-Redirect**: Redirects to appropriate login page on logout

---

## Best Practices

1. **Use in Client Components Only**: Hook uses `'use client'` directive
2. **Check isLoading**: Always check `isLoading` before rendering auth-dependent UI
3. **Protect Routes**: Use `useEffect` to redirect unauthenticated users
4. **Error Handling**: Always check login result for errors
5. **Session Management**: Monitor `isTokenExpiringSoon()` for session refresh

