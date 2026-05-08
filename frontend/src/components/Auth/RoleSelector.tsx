import React from 'react';
import type { UserRole } from '@/types/common';
import { USER_ROLES, ROLE_DESCRIPTIONS } from '@constants/index';
import Card from '@components/Common/Card';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleSelect,
}) => {
  const roles: UserRole[] = ['resident', 'staff', 'department', 'admin', 'superadmin'];

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        Select Your Role
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => onRoleSelect(role)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200 text-center font-medium cursor-pointer
              ${selectedRole === role
                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 shadow-sm'
              }
            `}
            title={ROLE_DESCRIPTIONS[role]}
          >
            <div className="text-xs sm:text-sm font-bold text-inherit">
              {USER_ROLES[role]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
