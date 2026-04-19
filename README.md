# AI-Based Society Complaint Management System

A professional, scalable complaint management system built with React, TypeScript, Tailwind CSS, and Vite.

## 🎯 Project Overview

A multi-role complaint management system designed for societies/communities to efficiently handle, track, and resolve resident complaints.

### Key Features

- **Multi-Role System**: Resident, Staff, Department, Admin, Super Admin
- **Unified Login**: Single login page for all user types
- **Role-Based Dashboard**: Customized dashboards for each user role
- **Complaint Management**: Submit, track, and manage complaints
- **Feedback System**: Star ratings and comments after complaint resolution
- **Performance Tracking**: Monitor staff efficiency and workload
- **Department Management**: Organize staff and complaints by department
- **Admin Controls**: Approve residents and manage departments

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Development Server & Build Tool |
| **Tailwind CSS** | Styling |
| **React Router DOM** | Client-side Routing |
| **Axios** | HTTP Requests |
| **Lucide React** | Icons |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Common/              # Reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── InputField.tsx
│   │   └── StatusBadge.tsx
│   └── Auth/                # Authentication components
│       ├── RoleSelector.tsx
│       └── LoginForm.tsx
├── pages/
│   ├── Auth/                # Auth pages
│   │   └── LoginPage.tsx
│   ├── Resident/            # Resident role pages
│   ├── Staff/               # Staff role pages
│   ├── Department/          # Department role pages
│   ├── Admin/               # Admin role pages
│   └── SuperAdmin/          # Super Admin role pages
├── layouts/                 # Layout components (Navbar, Sidebar)
├── context/                 # React Context
│   └── AuthContext.tsx
├── hooks/                   # Custom React hooks
│   └── useAuth.ts
├── services/                # API services
├── constants/               # Constants & Enums
│   └── index.ts
├── types/                   # TypeScript interfaces
│   └── index.ts
├── utils/                   # Utility functions
├── styles/                  # Global styles
├── assets/                  # Images, icons
├── App.tsx                  # Main app component
├── Root.tsx                 # Root component with providers
└── main.tsx                 # Entry point

public/                      # Static files
```

---

## 🎨 Design System

### Color Palette

**Primary Colors** (Blue Theme)
- Primary-50 to Primary-900 (from light to dark blue)
- Used for buttons, links, and primary actions

**Secondary Colors** (Gray/Neutral)
- Secondary-50 to Secondary-900 (from light to dark gray)
- Used for text and secondary elements

### Component Styling

- **Soft Shadows**: `shadow-soft`, `shadow-soft-md`, `shadow-soft-lg`
- **Rounded Corners**: `rounded-xl`, `rounded-2xl`
- **Cards**: Custom card component with variants
- **Buttons**: Primary, Secondary, Outline, Danger variants
- **Input Fields**: Consistent styling with error states

### Theme: Light Mode Only
- White background (`bg-white`)
- Light blue accents
- NO dark theme

---

## 🔐 User Roles & Permissions

### 1. **Resident**
- Submit new complaints
- View personal complaint status
- Provide feedback after resolution
- Track complaint progress
- **Can signup**: ✅ Yes

### 2. **Staff**
- View assigned complaints
- Start/complete work on complaints
- Upload proof images
- Add work notes
- **Can signup**: ❌ No (Created by Admin)

### 3. **Department**
- Manage staff in department
- View all complaints in department
- Assign/reassign complaints
- Set complaint priority
- **Can signup**: ❌ No (Created by Admin)

### 4. **Admin**
- Approve new residents
- Manage departments
- Assign department heads
- View system analytics
- **Can signup**: ❌ No (Created by Super Admin)

### 5. **Super Admin**
- Full system control
- View department analytics
- Monitor admin performance
- Generate system reports
- **Can signup**: ❌ No (System default)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd fyp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 📝 Usage Guide

### Login

1. Navigate to `/login`
2. Enter email and password
3. Select your role from the role selector
4. Click "Sign In"

### Role Selector

- Shows for **Resident**: Shows "Create Account" button
- Shows for **Other Roles**: Shows message "Only residents can signup"

### Remember Me

- Checks the "Remember Me" checkbox to stay logged in

### Forgot Password

- Click "Forgot?" link on login page (Feature to be implemented)

---

## 🔌 API Integration

### Authentication Service

Currently uses **dummy data** for demonstration. To integrate with backend:

Update `src/context/AuthContext.tsx`:

```typescript
// Replace dummy implementation with actual API calls
const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, loginRequest);
```

### Available Endpoints (To be implemented)

```typescript
// Auth
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/logout

// Complaints
GET    /api/complaints
GET    /api/complaints/:id
POST   /api/complaints
PUT    /api/complaints/:id

// Feedback
POST   /api/feedback
GET    /api/feedback/:complaintId
```

---

## 📦 Key Components

### Common Components

#### `Button`
```typescript
<Button variant="primary" size="lg" fullWidth isLoading={false}>
  Click Me
</Button>
```

#### `Card`
```typescript
<Card variant="md" className="p-6">
  Content here
</Card>
```

#### `InputField`
```typescript
<InputField
  label="Email"
  type="email"
  error={errors.email}
  required
/>
```

#### `StatusBadge`
```typescript
<StatusBadge status="In Progress" color="bg-yellow-100 text-yellow-800" />
```

### Auth Components

#### `RoleSelector`
```typescript
<RoleSelector selectedRole={role} onRoleSelect={setRole} />
```

---

## 🎯 Current Implementation Status

✅ **Completed:**
- Project setup with Vite + TypeScript
- Tailwind CSS configuration
- Type definitions and constants
- Auth context and hooks
- Common reusable components
- Login page with role selector
- Basic routing setup

⏳ **In Progress:**
- Dashboard layouts (Navbar + Sidebar)
- Role-specific pages

⬜ **To Do:**
- Dashboard implementations
- API integration
- Complaint management features
- Feedback system
- Performance tracking
- Department management
- Admin controls
- Authentication with backend
- Error handling & validation
- Testing
- Deployment

---

## 📋 Routes

### Auth Routes
- `GET  /login` - Login page
- `GET  /register` - Signup page (Resident only)

### Resident Routes
- `GET  /resident/dashboard` - Resident dashboard
- `GET  /resident/submit-complaint` - Submit complaint form
- `GET  /resident/my-complaints` - List of resident's complaints
- `GET  /resident/complaint/:id` - Complaint details
- `GET  /resident/feedback/:id` - Feedback form

### Staff Routes
- `GET  /staff/dashboard` - Staff dashboard
- `GET  /staff/assigned-complaints` - List of assigned complaints

### Department Routes
- `GET  /department/dashboard` - Department dashboard
- `GET  /department/staff` - Staff management
- `GET  /department/complaints` - View complaints
- `GET  /department/performance` - Performance metrics

### Admin Routes
- `GET  /admin/dashboard` - Admin dashboard
- `GET  /admin/departments` - Manage departments
- `GET  /admin/approve-residents` - Approve residents

### Super Admin Routes
- `GET  /superadmin/dashboard` - Super Admin dashboard
- `GET  /superadmin/analytics` - Department analytics
- `GET  /superadmin/reports` - System reports

---

## 🔒 Protected Routes

All protected routes require:
1. Valid authentication token
2. Matching user role

Unauthorized access redirects to login.

---

## 🌟 Code Quality

### Best Practices Implemented

- ✅ Functional components with React Hooks
- ✅ TypeScript for type safety
- ✅ Reusable components
- ✅ Clean code structure
- ✅ Consistent naming conventions
- ✅ Error handling patterns
- ✅ Loading states

### File Naming Conventions

- Components: PascalCase (e.g., `LoginPage.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)
- Types/Interfaces: PascalCase (e.g., `User`, `LoginRequest`)

---

## 🛠 Development Tips

### Adding New Routes

1. Create page component in `src/pages/`
2. Import in `src/App.tsx`
3. Add route in `AppRoutes` component
4. Update constants in `src/constants/index.ts`

### Creating New Components

1. Create in appropriate folder (`src/components/Common/` or `src/components/[FeatureName]/`)
2. Use TypeScript interfaces for props
3. Export as default export
4. Use Tailwind CSS for styling

### Adding New Types

1. Add to `src/types/index.ts`
2. Export the type
3. Use in components with proper typing

---

## 📞 Support & Documentation

For detailed implementation guides:
1. Check TypeScript interfaces in `src/types/`
2. Review component props in component files
3. Check constants in `src/constants/`

---

## 📄 License

This is an academic project (Final Year Project).

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: In Development
