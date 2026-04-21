import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  History,
  CheckCircle,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Building2,
  Shield,
  LogOut,
  ChevronRight,
  Home,
  ClipboardList,
  TrendingUp,
  Zap,
  Plus,
  User,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/index';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
}

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define menu items by role
  const getMenuByRole = (): MenuSection[] => {
    switch (user?.role) {
      case 'resident':
        return [
          {
            title: 'Main',
            items: [
              {
                label: 'Dashboard',
                icon: <Home className="w-5 h-5" />,
                path: ROUTES.RESIDENT_DASHBOARD,
              },
              {
                label: 'Submit Complaint',
                icon: <FileText className="w-5 h-5" />,
                path: ROUTES.RESIDENT_SUBMIT_COMPLAINT,
              },
              {
                label: 'My Complaints',
                icon: <History className="w-5 h-5" />,
                path: ROUTES.RESIDENT_MY_COMPLAINTS,
              },
            ],
          },
          {
            title: 'Account',
            items: [
              {
                label: 'Profile',
                icon: <User className="w-5 h-5" />,
                path: ROUTES.PROFILE,
              },
              {
                label: 'Help & Support',
                icon: <HelpCircle className="w-5 h-5" />,
                path: ROUTES.HELP_SUPPORT,
              },
            ],
          },
        ];

      case 'staff':
        return [
          {
            title: 'Work',
            items: [
              {
                label: 'Dashboard',
                icon: <LayoutDashboard className="w-5 h-5" />,
                path: ROUTES.STAFF_DASHBOARD,
              },
              {
                label: 'Assigned Complaints',
                icon: <ClipboardList className="w-5 h-5" />,
                path: ROUTES.STAFF_ASSIGNED_COMPLAINTS,
              },
              {
                label: 'Completed Work',
                icon: <CheckCircle className="w-5 h-5" />,
                path: '#',
              },
            ],
          },
          {
            title: 'Support',
            items: [
              {
                label: 'Profile',
                icon: <User className="w-5 h-5" />,
                path: ROUTES.PROFILE,
              },
              {
                label: 'Help & Support',
                icon: <HelpCircle className="w-5 h-5" />,
                path: ROUTES.HELP_SUPPORT,
              },
            ],
          },
        ];

      case 'department':
        return [
          {
            title: 'Management',
            items: [
              {
                label: 'Dashboard',
                icon: <LayoutDashboard className="w-5 h-5" />,
                path: ROUTES.DEPARTMENT_DASHBOARD,
              },
              {
                label: 'Staff',
                icon: <Users className="w-5 h-5" />,
                path: ROUTES.DEPARTMENT_STAFF,
              },
              {
                label: 'Complaints',
                icon: <ClipboardList className="w-5 h-5" />,
                path: ROUTES.DEPARTMENT_COMPLAINTS,
              },
              {
                label: 'Performance',
                icon: <TrendingUp className="w-5 h-5" />,
                path: ROUTES.DEPARTMENT_PERFORMANCE,
              },
            ],
          },
          {
            title: 'Support',
            items: [
              {
                label: 'Profile',
                icon: <User className="w-5 h-5" />,
                path: ROUTES.PROFILE,
              },
              {
                label: 'Help & Support',
                icon: <HelpCircle className="w-5 h-5" />,
                path: ROUTES.HELP_SUPPORT,
              },
            ],
          },
        ];

      case 'admin':
        return [
          {
            title: 'Administration',
            items: [
              {
                label: 'Dashboard',
                icon: <Shield className="w-5 h-5" />,
                path: ROUTES.ADMIN_DASHBOARD,
              },
              {
                label: 'Departments',
                icon: <Building2 className="w-5 h-5" />,
                path: ROUTES.ADMIN_DEPARTMENTS,
              },
              {
                label: 'Add Staff',
                icon: <Users className="w-5 h-5" />,
                path: ROUTES.ADMIN_CREATE_STAFF,
              },
              {
                label: 'Approve Residents',
                icon: <CheckCircle className="w-5 h-5" />,
                path: ROUTES.ADMIN_APPROVE_RESIDENTS,
              },
            ],
          },
          {
            title: 'Support',
            items: [
              {
                label: 'Profile',
                icon: <User className="w-5 h-5" />,
                path: ROUTES.PROFILE,
              },
              {
                label: 'Help & Support',
                icon: <HelpCircle className="w-5 h-5" />,
                path: ROUTES.HELP_SUPPORT,
              },
            ],
          },
        ];

      case 'superadmin':
        return [
          {
            title: 'System',
            items: [
              {
                label: 'Dashboard',
                icon: <Zap className="w-5 h-5" />,
                path: ROUTES.SUPERADMIN_DASHBOARD,
              },
              {
                label: 'Analytics',
                icon: <BarChart3 className="w-5 h-5" />,
                path: ROUTES.SUPERADMIN_ANALYTICS,
              },
              {
                label: 'Reports',
                icon: <FileText className="w-5 h-5" />,
                path: ROUTES.SUPERADMIN_REPORTS,
              },
            ],
          },
          {
            title: 'Approvals',
            items: [
              {
                label: 'Department Requests',
                icon: <CheckCircle className="w-5 h-5" />,
                path: ROUTES.SUPERADMIN_REQUESTS,
              },
            ],
          },
          {
            title: 'Support',
            items: [
              {
                label: 'Profile',
                icon: <User className="w-5 h-5" />,
                path: ROUTES.PROFILE,
              },
              {
                label: 'Help & Support',
                icon: <HelpCircle className="w-5 h-5" />,
                path: ROUTES.HELP_SUPPORT,
              },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const menuSections = getMenuByRole();
  const isLinkActive = (path?: string) => path && location.pathname === path;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 top-[73px] w-64 bg-white border-r border-gray-200 
        transition-transform duration-300 z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky
      `}
    >
      <div className="h-full overflow-y-auto flex flex-col">
        {/* Menu Sections */}
        <nav className="flex-1 px-4 py-6 space-y-8">
          {menuSections.map((section) => (
            <div key={section.title}>
              {/* Section Title */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">
                {section.title}
              </p>

              {/* Menu Items */}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path || '#'}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${
                        isLinkActive(item.path)
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-blue-50'
                      }
                    `}
                  >
                    <span className={isLinkActive(item.path) ? 'text-blue-600' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {isLinkActive(item.path) && (
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          {/* Settings */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors duration-200">
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="border-t border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">SocietyAI v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
