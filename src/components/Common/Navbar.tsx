import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Bell, Settings, X } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { USER_ROLES, ROUTES } from '@constants/index';

interface NavbarProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, sidebarOpen = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const roleColor: Record<string, string> = {
    resident: 'bg-blue-100 text-blue-800',
    staff: 'bg-blue-100 text-blue-800',
    department: 'bg-purple-100 text-purple-800',
    admin: 'bg-orange-100 text-orange-800',
    superadmin: 'bg-red-100 text-red-800',
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Menu + Logo */}
          <div className="flex items-center gap-4">
            {/* Menu Toggle */}
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200 lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-blue-600" />
              ) : (
                <Menu className="w-6 h-6 text-blue-600" />
              )}
            </button>

            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                AI
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">SocietyAI</h1>
                <p className="text-xs text-gray-500">Community Manager</p>
              </div>
            </div>
          </div>

          {/* Center Section: Page Title */}
          <div className="hidden md:block flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {user?.role && USER_ROLES[user.role as keyof typeof USER_ROLES]} Dashboard
            </h2>
          </div>

          {/* Right Section: Notifications + User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              className="relative p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.profile?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left text-sm">
                  <p className="font-medium text-gray-900">
                    {user?.profile?.fullName || user?.email}
                  </p>
                  <p className={`text-xs px-2 py-0.5 rounded ${roleColor[user?.role || 'resident']}`}>
                    {user?.role && USER_ROLES[user.role as keyof typeof USER_ROLES]}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-md border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-medium text-gray-900">
                        {user?.profile?.fullName || user?.email}
                    </p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <button className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors duration-200">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Profile</span>
                  </button>

                  <button className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors duration-200">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
