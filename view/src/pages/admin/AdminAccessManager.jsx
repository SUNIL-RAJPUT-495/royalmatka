import React, { useState } from 'react';
import { 
  FaUserPlus, FaUserShield, FaTrashAlt, FaRedo, 
  FaShieldAlt, FaUserEdit, FaCheckCircle, FaTimesCircle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const AdminAccessManager = () => {
  // Available permissions array
  const permissionOptions = [
    'Game Management',
    'Starline',
    'Jackpot',
    'Financial',
    'User Management',
    'Communication',
    'Settings',
    'Manage Admins'
  ];

  // Admins state with default items matching screenshot look
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'Ramesh Sharma',
      email: 'ramesh@royal1008.com',
      role: 'Sub Admin',
      permissions: ['Game Management', 'Starline', 'User Management']
    },
    {
      id: 2,
      name: 'Anjali Gupta',
      email: 'anjali@royal1008.com',
      role: 'Admin',
      permissions: ['Game Management', 'Starline', 'Jackpot', 'Financial', 'User Management', 'Communication', 'Settings']
    }
  ]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Modal Control States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToRevoke, setAdminToRevoke] = useState(null); // { id, name }

  // Toggle permission checkbox
  const handlePermissionChange = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  };

  // Submit Handler
  const handleCreateAdmin = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the admin name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const newAdmin = {
      id: Date.now(),
      name,
      email,
      role,
      permissions: selectedPermissions.length > 0 ? selectedPermissions : ['Game Management']
    };

    setAdmins((prev) => [newAdmin, ...prev]);
    toast.success(`${role} created successfully!`);

    // Reset Form
    setName('');
    setEmail('');
    setPassword('');
    setRole('Admin');
    setSelectedPermissions([]);
  };

  // Delete Click handler
  const handleDeleteAdminClick = (id, adminName) => {
    setAdminToRevoke({ id, name: adminName });
    setIsDeleteModalOpen(true);
  };

  // Delete Confirm handler
  const handleConfirmDelete = () => {
    if (adminToRevoke) {
      setAdmins((prev) => prev.filter((a) => a.id !== adminToRevoke.id));
      toast.success('Admin access revoked successfully');
    }
    setIsDeleteModalOpen(false);
    setAdminToRevoke(null);
  };

  // Refresh Handler
  const handleRefresh = () => {
    toast.success('Admin access list updated');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800">
      {/* Page Title Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4 shrink-0">
        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-md text-white">
          <FaUserShield size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
            Admin Access Manager
          </h1>
          <p className="text-xs text-gray-505 font-semibold mt-1.5 uppercase tracking-wider">
            Manage System Administrators & Permissions
          </p>
        </div>
      </div>

      {/* Main Grid: Add Admin (Left) & Access List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Add Admin Form Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <FaUserPlus className="text-blue-600" size={17} />
            <h3 className="font-bold text-sm md:text-base text-gray-900 uppercase tracking-wide">
              Add Admin
            </h3>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            {/* Name Input */}
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Role Select Dropdown */}
            <div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Sub Admin">Sub Admin</option>
                <option value="Operator">Operator</option>
              </select>
            </div>

            {/* Permissions Box */}
            <div>
              <label className="block text-xs font-bold text-gray-750 mb-1.5 uppercase tracking-wide">
                Permissions
              </label>
              
              <div className="border border-gray-300 rounded-2xl p-3.5 space-y-2.5 max-h-[220px] overflow-y-auto bg-gray-50/50 shadow-2xs">
                {permissionOptions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <label 
                      key={perm} 
                      className="flex items-center justify-between text-xs font-medium text-gray-800 cursor-pointer select-none py-0.5 hover:text-blue-600 transition-colors"
                    >
                      <span>{perm}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePermissionChange(perm)}
                        className="w-4.5 h-4.5 text-blue-600 border-gray-355 rounded-md focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer uppercase mt-2"
            >
              <FaUserPlus size={14} />
              <span>Create Admin</span>
            </button>
          </form>
        </div>

        {/* Right Side: Admin Access List Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm flex flex-col">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-blue-600" size={17} />
              <h3 className="font-bold text-sm md:text-base text-gray-900 uppercase tracking-wide">
                Admin Access List
              </h3>
            </div>

            <button
              onClick={handleRefresh}
              className="border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
            >
              <FaRedo size={11} />
              <span>Refresh</span>
            </button>
          </div>

          {/* List display */}
          <div className="space-y-4">
            {admins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="pb-3 pl-2">Admin Profile</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Permissions</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {admins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Profile name and email */}
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm shadow-2xs shrink-0">
                              {adm.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{adm.name}</div>
                              <div className="text-[10px] text-gray-500 font-medium mt-0.5">{adm.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4">
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wide">
                            {adm.role}
                          </span>
                        </td>

                        {/* Permissions */}
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                            {adm.permissions.map((perm) => (
                              <span 
                                key={perm} 
                                className="bg-gray-100 text-gray-700 text-[9px] font-semibold px-2 py-0.5 rounded-md border border-gray-200/80 uppercase"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Revoke action */}
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => handleDeleteAdminClick(adm.id, adm.name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 border border-red-150 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-bold uppercase"
                            title="Revoke Admin Access"
                          >
                            <FaTrashAlt size={11} />
                            <span>Revoke</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-3xl">
                <p className="text-sm font-medium text-gray-450 italic">
                  No extra admins found.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirm Revoke Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Revoke Admin Access"
        message={`Are you sure you want to revoke system access for "${adminToRevoke?.name}"? They will lose all permissions immediately.`}
        confirmText="Revoke Access"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />

    </div>
  );
};

export default AdminAccessManager;
