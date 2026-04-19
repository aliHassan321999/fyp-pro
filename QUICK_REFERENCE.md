# ⚡ Quick Reference Card

Your essential guide to the Complaint Management System project.

---

## 🚀 Quick Start (Copy & Paste)

```bash
# Navigate to project
cd "c:\Users\Ali Hassan\Desktop\fyp"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open browser
http://localhost:5173
```

---

## 📋 Most Used Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routes configuration |
| `src/constants/index.ts` | Routes, roles, messages |
| `src/types/index.ts` | TypeScript interfaces |
| `src/context/AuthContext.tsx` | Auth state management |
| `tailwind.config.js` | Theme colors & styles |

---

## 🎯 Common Commands

```bash
# Start dev server (includes auto-reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code (if configured)
npm run lint
```

---

## 📂 Creating New Features

### 1️⃣ Add a New Route

**Step 1:** Create page in `src/pages/[Role]/PageName.tsx`
```typescript
import React from 'react';

const PageName: React.FC = () => {
  return <div>Content here</div>;
};

export default PageName;
```

**Step 2:** Add to `src/App.tsx`
```typescript
<Route path="/route-path" element={<ProtectedRoute requiredRole="resident"><PageName /></ProtectedRoute>} />
```

**Step 3:** Add constant to `src/constants/index.ts`
```typescript
ROUTE_NAME: '/route-path',
```

### 2️⃣ Add a New Component

**Step 1:** Create in `src/components/Category/ComponentName.tsx`
```typescript
import React from 'react';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

export default ComponentName;
```

**Step 2:** Export in `src/components/Category/index.ts`
```typescript
export { default as ComponentName } from './ComponentName';
```

**Step 3:** Use in pages
```typescript
import { ComponentName } from '@components/Category';
```

### 3️⃣ Add API Service

**Step 1:** Create `src/services/featureService.ts`
```typescript
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '@constants/index';

export const featureService = {
  getAll: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.FEATURE);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await axiosInstance.post(API_ENDPOINTS.FEATURE, data);
    return response.data;
  },
};
```

**Step 2:** Use in components
```typescript
import { featureService } from '@services/featureService';

const data = await featureService.getAll();
```

---

## 🎨 Styling Quick Reference

### Classes to Use

```html
<!-- Buttons -->
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-outline">Outline</button>

<!-- Cards -->
<div class="card">Default</div>
<div class="card-md">Medium</div>
<div class="card-lg">Large</div>

<!-- Inputs -->
<input class="input-field" />
<label class="label-field">Label</label>

<!-- Text -->
<h1 class="text-3xl font-bold">Heading 1</h1>
<p class="text-secondary-600">Body text</p>
<span class="text-sm text-secondary-500">Small text</span>
```

### Colors Available

```
Primary Colors:
primary-50, primary-100, primary-200, ... primary-900

Secondary Colors:
secondary-50, secondary-100, secondary-200, ... secondary-900

Status Colors:
bg-green-100, bg-yellow-100, bg-red-100, bg-blue-100
```

### Common Spacing

```
p-4, p-6, p-8         // Padding
m-4, m-6, m-8         // Margin
gap-4, gap-6          // Gap in flex/grid
mb-2, mb-4, mb-8      // Bottom margin
```

---

## 🪝 React Hooks Most Used

### useAuth Hook
```typescript
import { useAuth } from '@hooks/useAuth';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Welcome {user?.firstName}</div>;
};
```

### useState Hook
```typescript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
```

### useEffect Hook
```typescript
useEffect(() => {
  // Run on mount and dependency change
  console.log('Component mounted');
  
  return () => {
    // Cleanup
  };
}, [dependency]);
```

### useNavigate Hook
```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/dashboard');
  };
};
```

---

## 📝 Form Pattern

```typescript
const [formData, setFormData] = useState({
  email: '',
  password: '',
});
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  const newErrors: Record<string, string> = {};
  if (!formData.email) newErrors.email = 'Required';
  setErrors(newErrors);
  
  if (Object.keys(newErrors).length > 0) return;
  
  // Submit
  try {
    await apiCall(formData);
  } catch (error) {
    setErrors({ submit: 'Error submitting form' });
  }
};
```

---

## 🔐 Protected Route Pattern

```typescript
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🧪 Testing Login

### Use These Credentials
- **Email**: Any email (e.g., `test@example.com`)
- **Password**: Any password (e.g., `password123`)
- **Role**: Select any role
- **Result**: Will be logged in with dummy user

### Test Each Role
1. Resident → Should see resident dashboard
2. Staff → Should see staff dashboard
3. Department → Should see department dashboard
4. Admin → Should see admin dashboard
5. SuperAdmin → Should see superadmin dashboard

---

## 🐛 Debugging Tips

### 1. Check Browser Console (F12)
- Errors appear in red
- Warnings appear in yellow
- Useful stack traces

### 2. Install React DevTools Extension
- Inspect component props
- Check component tree
- Monitor state changes

### 3. Add Console Logs
```typescript
console.log('Data:', data);
console.error('Error:', error);
console.table([{ name: 'John' }, { name: 'Jane' }]);
```

### 4. Check TypeScript Errors
- Look for squiggly lines in editor
- Hover to see error message
- Usually very descriptive

### 5. Verify Routes
```typescript
// Check your route constant is correct
console.log(ROUTES.RESIDENT_DASHBOARD);
```

---

## 📚 Import Patterns

### From Components
```typescript
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { RoleSelector } from '@components/Auth';
```

### From Hooks
```typescript
import { useAuth } from '@hooks/useAuth';
```

### From Context
```typescript
import { AuthContext } from '@context/AuthContext';
```

### From Constants
```typescript
import { ROUTES, USER_ROLES, COMPLAINT_STATUS } from '@constants/index';
```

### From Types
```typescript
import { User, LoginRequest, Complaint } from '@types/index';
```

### From Services
```typescript
import axiosInstance from '@services/axiosInstance';
import { complaintService } from '@services/complaintService';
```

---

## 🎯 Component Props Pattern

```typescript
interface MyComponentProps {
  title: string;           // Required
  description?: string;    // Optional
  count?: number;          // Optional with default
  onClick?: () => void;    // Optional callback
  children?: React.ReactNode; // Optional children
  className?: string;      // Optional CSS class
}

const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description = 'Default text',
  count = 0,
  onClick,
  children,
  className = '',
}) => {
  return <div className={className}>{title}</div>;
};
```

---

## 🔄 Update UI After API Call

```typescript
// With useState
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await apiCall();
    setData(result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

// With useEffect
useEffect(() => {
  fetchData();
}, []); // Empty dependency = run once on mount
```

---

## 🎨 Common Button Usage

```typescript
// Primary button
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// Loading state
<Button isLoading={isLoading} disabled={isLoading}>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>

// Full width
<Button fullWidth>Submit Form</Button>

// Outline variant
<Button variant="outline">Cancel</Button>
```

---

## 📱 Responsive Classes

```css
/* Small screens */
sm:text-lg     /* >= 640px */
md:text-xl     /* >= 768px */
lg:text-2xl    /* >= 1024px */
xl:text-3xl    /* >= 1280px */
2xl:text-4xl   /* >= 1536px */

/* Common patterns */
hidden md:block        /* Hidden on mobile, shown on tablet+ */
md:w-1/2 lg:w-1/3     /* Width changes by breakpoint */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 5173 in use | `npm run dev -- --port 3000` |
| Module not found | Check spelling and path aliases |
| Styles not applying | Restart dev server |
| useAuth error | Ensure AuthProvider wraps app |
| Route not found | Check ROUTES constant |
| Button not responding | Check onClick handler |
| Form not submitting | Check e.preventDefault() |
| Auth token missing | Check localStorage key |

---

## 📞 Project Navigation

### Key Directories
- **Components**: `src/components/`
- **Pages**: `src/pages/`
- **Types**: `src/types/index.ts`
- **Constants**: `src/constants/index.ts`
- **Services**: `src/services/`
- **Hooks**: `src/hooks/`
- **Context**: `src/context/`

### Documentation Files
- **Overview**: `README.md`
- **Setup**: `SETUP.md`
- **Quick Start**: `GETTING_STARTED.md`
- **Structure**: `PROJECT_STRUCTURE.md`
- **Checklist**: `DEVELOPMENT_CHECKLIST.md`
- **This File**: `QUICK_REFERENCE.md`

---

## 💡 Pro Tips

1. **Use Path Aliases** - Keeps imports clean: `@components/... ` not `../../../`
2. **Create Index Files** - Simplifies exports: `src/components/Common/index.ts`
3. **Type Everything** - Catch errors early with TypeScript
4. **Reuse Components** - Don't duplicate code
5. **Constants Over Magic Strings** - Use ROUTES.RESIDENT_DASHBOARD, not '/resident/dashboard'
6. **Hot Reload** - Dev server auto-updates on file save
7. **Git Often** - Commit after each feature
8. **Check TypeScript** - Fix squiggly lines immediately

---

## 🔗 Essential Links

| Link | Purpose |
|------|---------|
| `http://localhost:5173` | Dev server |
| `http://localhost:5173/login` | Login page |
| DevTools (F12) | Browser console |
| `.env.example` | Environment setup |
| `tailwind.config.js` | Theme config |
| `tsconfig.json` | TypeScript config |

---

**Bookmark this file for quick reference while coding!**

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Active Development
