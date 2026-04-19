import React, { useState } from 'react';
import { Search, Plus, Eye, EyeOff, CheckCircle2, Mail } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';

interface StaffMember {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'on-leave';
  joinDate: string;
  assignedComplaints: number;
  completedComplaints: number;
  dummyUsername?: string;
  dummyPassword?: string;
}

const DepartmentStaffPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
  });
  const [addedStaff, setAddedStaff] = useState<StaffMember | null>(null);

  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Smith',
      position: 'Senior Technician',
      email: 'john.smith@example.com',
      phone: '+971-5012345678',
      status: 'active',
      joinDate: '2023-01-15',
      assignedComplaints: 12,
      completedComplaints: 95,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'Maintenance Supervisor',
      email: 'sarah.johnson@example.com',
      phone: '+971-5087654321',
      status: 'active',
      joinDate: '2022-06-20',
      assignedComplaints: 10,
      completedComplaints: 112,
    },
    {
      id: '3',
      name: 'Mike Wilson',
      position: 'Technician',
      email: 'mike.wilson@example.com',
      phone: '+971-5098765432',
      status: 'active',
      joinDate: '2023-09-10',
      assignedComplaints: 9,
      completedComplaints: 67,
    },
    {
      id: '4',
      name: 'Emma Davis',
      position: 'Technician',
      email: 'emma.davis@example.com',
      phone: '+971-5012121212',
      status: 'on-leave',
      joinDate: '2024-01-05',
      assignedComplaints: 3,
      completedComplaints: 12,
    },
    {
      id: '5',
      name: 'David Brown',
      position: 'Junior Technician',
      email: 'david.brown@example.com',
      phone: '+971-5034343434',
      status: 'active',
      joinDate: '2024-02-15',
      assignedComplaints: 5,
      completedComplaints: 18,
    },
  ]);

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate dummy username and password
  const generateDummyCredentials = (name: string, email: string) => {
    const username = email.split('@')[0].toLowerCase();
    const password = `TmpPass${Math.random().toString(36).substring(2, 8).toUpperCase()}!${name.split(' ')[0].substring(0, 2)}`;
    return { username, password };
  };

  // Send email with credentials (simulated)
  const sendCredentialsEmail = (staffMember: StaffMember, username: string, password: string) => {
    const emailContent = `
Dear ${staffMember.name},

Your staff account has been created! Here are your temporary login credentials:

Username: ${username}
Password: ${password}

You can now access the complaint management system and change your password on your first login.

Important: Please change your password immediately after login for security purposes.

Position: ${staffMember.position}
Email: ${staffMember.email}

Best regards,
Department Management Team
    `.trim();

    console.log(`[EMAIL SENT] To: ${staffMember.email}`);
    console.log(`[EMAIL CONTENT]: ${emailContent}`);
  };

  // Handle add staff form submission
  const handleAddStaff = () => {
    if (!newStaffForm.name || !newStaffForm.position || !newStaffForm.email || !newStaffForm.phone) {
      alert('❌ Please fill in all fields');
      return;
    }

    const { username, password } = generateDummyCredentials(newStaffForm.name, newStaffForm.email);

    const newStaff: StaffMember = {
      id: String(staff.length + 1),
      name: newStaffForm.name,
      position: newStaffForm.position,
      email: newStaffForm.email,
      phone: newStaffForm.phone,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      assignedComplaints: 0,
      completedComplaints: 0,
      dummyUsername: username,
      dummyPassword: password,
    };

    // Send email
    sendCredentialsEmail(newStaff, username, password);

    // Add staff to list
    setStaff([...staff, newStaff]);

    // Show credentials modal
    setAddedStaff(newStaff);
    setShowCredentialsModal(true);
    setShowAddModal(false);

    // Reset form
    setNewStaffForm({ name: '', position: '', email: '', phone: '' });

    alert(`✅ Staff member ${newStaffForm.name} added successfully!\nCredentials sent to ${newStaffForm.email}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Staff Management</h1>
          <p className="text-secondary-600 mt-2">{filteredStaff.length} staff members</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* Search */}
      <Card variant="md" className="p-6">
        <InputField
          placeholder="Search by name, position, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Staff List */}
      <div className="space-y-4">
        {filteredStaff.map((member) => (
          <Card key={member.id} variant="md" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-secondary-900">{member.name}</h3>
                  <p className="text-sm text-secondary-600">{member.position}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-secondary-600">
                    <span className="font-medium">Email:</span> {member.email}
                  </p>
                  <p className="text-secondary-600">
                    <span className="font-medium">Phone:</span> {member.phone}
                  </p>
                  <p className="text-secondary-600">
                    <span className="font-medium">Joined:</span> {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600">{member.assignedComplaints}</p>
                  <p className="text-xs text-secondary-600 mt-1">Assigned</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{member.completedComplaints}</p>
                  <p className="text-xs text-secondary-600 mt-1">Completed</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <StatusBadge
                  status={member.status === 'active' ? 'Active' : 'On Leave'}
                  color={member.status === 'active' ? 'bg-blue-100' : 'bg-yellow-100'}
                />
                <Button variant="outline" fullWidth>
                  Edit
                </Button>
                <Button variant="outline" fullWidth>
                  View Performance
                </Button>
                <Button variant="outline" fullWidth className="text-red-600 hover:bg-red-50">
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="md" className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">Add New Staff Member</h2>
              <p className="text-secondary-600 text-sm mt-2">Temporary credentials will be generated and sent via email</p>
            </div>

            <div className="space-y-4 mb-6">
              <InputField
                placeholder="Full Name"
                value={newStaffForm.name}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
              />
              <InputField
                placeholder="Position"
                value={newStaffForm.position}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, position: e.target.value })}
              />
              <InputField
                placeholder="Email Address"
                type="email"
                value={newStaffForm.email}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
              />
              <InputField
                placeholder="Phone Number"
                value={newStaffForm.phone}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleAddStaff}
              >
                Add & Send Credentials
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Credentials Confirmation Modal */}
      {showCredentialsModal && addedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="lg" className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">Staff Added Successfully!</h2>
              <p className="text-secondary-600 mt-2">Credentials have been sent to the email address</p>
            </div>

            {/* Credentials Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-secondary-900 block mb-2">
                  Staff Name
                </label>
                <div className="p-3 bg-white border border-secondary-200 rounded-lg text-secondary-700">
                  {addedStaff.name}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-secondary-900 block mb-2">
                  Position
                </label>
                <div className="p-3 bg-white border border-secondary-200 rounded-lg text-secondary-700">
                  {addedStaff.position}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-secondary-900 block mb-2">
                  Email
                </label>
                <div className="p-3 bg-white border border-secondary-200 rounded-lg text-secondary-700 break-all">
                  {addedStaff.email}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-secondary-900 block mb-2">
                  Temporary Username
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={addedStaff.dummyUsername || ''}
                    className="flex-1 p-3 bg-white border border-secondary-200 rounded-lg text-secondary-700"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(addedStaff.dummyUsername || '');
                      alert('Username copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-secondary-900 block mb-2">
                  Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    readOnly
                    value={addedStaff.dummyPassword || ''}
                    className="flex-1 p-3 bg-white border border-secondary-200 rounded-lg text-secondary-700"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-2 bg-secondary-100 text-secondary-600 rounded-lg hover:bg-secondary-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(addedStaff.dummyPassword || '');
                      alert('Password copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">⚠️ Important:</span> The staff member can change their password after first login.
              </p>
            </div>

            {/* Close Button */}
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowCredentialsModal(false)}
            >
              Done
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DepartmentStaffPage;
