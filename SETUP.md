# Project Setup & Quick Start Guide

## 📌 Prerequisites

Before you start, make sure you have:

- **Node.js 16.x or higher** — [Download](https://nodejs.org/)
- **npm 8.x or higher** — Comes with Node.js
- **Git** — [Download](https://git-scm.com/)
- A code editor (VS Code recommended)

**Verify Installation:**
```bash
node --version    # Should show v16.0.0 or higher
npm --version     # Should show 8.0.0 or higher
git --version     # Should show 2.x.x or higher
```

---

## 🚀 Quick Start (5 minutes)

### 1️⃣ **Install Dependencies**
```bash
npm install
```

This installs all required packages listed in `package.json`.

### 2️⃣ **Start Development Server**
```bash
npm run dev
```

The application will:
- Start on `http://localhost:5173`
- Automatically open in your browser
- Enable hot module replacement (HMR) for live updates

### 3️⃣ **Test Login**

**Credentials (Dummy Data):**
- Email: any email (e.g., `demo@example.com`)
- Password: any password (e.g., `password123`)
- Role: Select any role (Resident, Staff, etc.)

> Note: This uses dummy data. Real authentication comes after backend API is ready.

---

## 📦 Project Setup Details

### Folder Structure Overview

```
fyp/
├── public/                # Static files
├── src/
│   ├── assets/           # Images, icons
│   ├── components/       # Reusable React components
│   │   ├── Common/       # Buttons, Cards, Inputs
│   │   └── Auth/         # Login, Role Selector
│   ├── pages/            # Page components (one per route)
│   ├── context/          # React Context (Auth state)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API calls and services
│   ├── constants/        # Constants, enums, messages
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Utility functions
│   ├── styles/           # Global CSS/Tailwind
│   ├── App.tsx           # Main app routing
│   ├── Root.tsx          # Root with providers
│   └── main.tsx          # Entry point
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind CSS config
├── vite.config.ts        # Vite bundler config
└── README.md             # Project documentation
```

---

## 🔧 Available Commands

### Development
```bash
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint (if configured)
```

### Useful Development Patterns

**Import Paths** (using TypeScript path aliases)
```typescript
// Instead of: import Button from '../../../components/Common/Button'
// Use:
import { Button } from '@components/Common';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/index';
```

---

## 🎨 Customization Guide

### Tailwind Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: { /* Blue colors */ },
  secondary: { /* Gray colors */ }
}
```

### Adding a New Page

1. **Create page file:**
   ```typescript
   // src/pages/Resident/MyComplaints.tsx
   import React from 'react';
   
   const MyComplaints: React.FC = () => {
     return <div>My Complaints Page</div>;
   };
   
   export default MyComplaints;
   ```

2. **Add route in `App.tsx`:**
   ```typescript
   <Route
     path="/resident/my-complaints"
     element={
       <ProtectedRoute requiredRole="resident">
         <MyComplaints />
       </ProtectedRoute>
     }
   />
   ```

3. **Add route constant in `constants/index.ts`:**
   ```typescript
   RESIDENT_MY_COMPLAINTS: '/resident/my-complaints',
   ```

### Adding a New Component

1. **Create component file:**
   ```typescript
   // src/components/Common/Avatar.tsx
   import React from 'react';
   
   interface AvatarProps {
     src: string;
     alt: string;
     size?: 'sm' | 'md' | 'lg';
   }
   
   const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md' }) => {
     return <img src={src} alt={alt} />;
   };
   
   export default Avatar;
   ```

2. **Export from index file:**
   ```typescript
   // src/components/Common/index.ts
   export { default as Avatar } from './Avatar';
   ```

3. **Use in pages:**
   ```typescript
   import { Avatar } from '@components/Common';
   ```

---

## 🔌 Backend Integration Roadmap

### Current State
- ✅ Dummy authentication in `AuthContext`
- ✅ Dummy data in login

### Next Steps
1. Create API services in `src/services/`
2. Update `AuthContext` to use real API calls
3. Implement API error handling
4. Add loading states throughout app
5. Add toast notifications for user feedback

### Example API Service
```typescript
// src/services/authService.ts
import axiosInstance from './axiosInstance';
import { LoginRequest, User } from '@types/index';

export const authService = {
  login: async (request: LoginRequest) => {
    const response = await axiosInstance.post('/auth/login', request);
    return response.data as { user: User; token: string };
  },
  
  signup: async (data: SignupRequest) => {
    const response = await axiosInstance.post('/auth/signup', data);
    return response.data;
  },
};
```

---

## 🐛 Troubleshooting

### Issue: "Port 5173 already in use"
```bash
# Use different port
npm run dev -- --port 3000
```

### Issue: "Module not found" errors
1. Check the import path is correct
2. Verify file exists
3. Restart dev server
4. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Issue: Tailwind styles not applying
1. Verify `tailwind.config.js` content paths are correct
2. Check `index.css` has `@tailwind` directives
3. Restart dev server

### Issue: AuthContext error
- Ensure `AuthProvider` wraps your app in `Root.tsx`
- Use `useAuth()` hook only in components inside provider

---

## 📊 Project Status

### Phase 1: Foundation ✅ **COMPLETE**
- [x] Project structure
- [x] Vite + TypeScript setup
- [x] Tailwind CSS configuration
- [x] Type definitions
- [x] Constants & enums
- [x] Auth context
- [x] Login page with role selector
- [x] Basic routing

### Phase 2: Core Features (In Progress)
- [ ] Dashboard layouts (Navbar + Sidebar)
- [ ] Resident module (submit, view complaints)
- [ ] Staff module (manage assignments)
- [ ] Department module
- [ ] Admin module
- [ ] Super Admin module

### Phase 3: Advanced Features
- [ ] Feedback system
- [ ] Performance tracking
- [ ] Charts and analytics
- [ ] Notifications
- [ ] Search and filters

### Phase 4: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Form validation
- [ ] Testing

---

## 💡 Best Practices Implemented

✅ **Code Organization**
- Separate concerns into different directories
- One component per file
- Index files for clean imports

✅ **Type Safety**
- Full TypeScript coverage
- Interfaces for all props
- Type-safe hooks

✅ **React Patterns**
- Functional components with hooks
- Context for state management
- Custom hooks for reusability
- Protected routes for authentication

✅ **Styling**
- Tailwind CSS for utilities
- Component-level CSS classes
- Consistent color palette
- Responsive design

✅ **Code Quality**
- Consistent naming conventions
- Clean, readable code
- Error boundaries support
- Loading state handling

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Docs](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

---

## 📞 Need Help?

1. **Check the React DevTools** — Install "React Developer Tools" browser extension
2. **Check the Console** — Open DevTools (F12) to see error messages
3. **Review existing code** — Look at similar components for patterns
4. **Check constants** — Verify routes and type names in `constants/index.ts`
5. **Read TypeScript errors** — They're usually very helpful!

---

**Happy Coding! 🚀**

Last Updated: January 2026
