"use client";
import DashboardSidebar from "../../components/DashboardSidebar";
import { useUser } from "../UserProvider";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  theme?: 'light' | 'dark';
}

export default function SettingsPage() {
  const { user, profile: userProfile, loading, supabase } = useUser() || {};
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !supabase) return;
    setDataLoading(true);
    fetch(`/api/dashboard/settings-profile?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile || null);
        setNewName(data.profile?.full_name || '');
        setDataLoading(false);
      });
  }, [user, supabase]);

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  const updateProfile = async () => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName })
        .eq('id', user.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, full_name: newName } : null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const updatePassword = async () => {
    if (!supabase) return;
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
    }
  };

  const deleteAccount = async () => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !supabase || !user) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    // Upload to Supabase Storage (ensure you have a bucket named 'avatars')
    let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
      setUploading(false);
      return;
    }
    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = data?.publicUrl;
    if (avatarUrl) {
      // Update profile in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      if (updateError) {
        setMessage({ type: 'error', text: 'Failed to update avatar' });
      } else {
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
        setMessage({ type: 'success', text: 'Profile picture updated!' });
      }
    }
    setUploading(false);
  };

  if (loading || dataLoading) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#10182A]">
      {/* Mobile sidebar toggle button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-30 bg-[#232e47] hover:bg-[#4fd1c5] hover:text-[#232e47] p-3 rounded-full text-white shadow-lg border-2 border-[#4fd1c5] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4fd1c5]"
        onClick={handleSidebarToggle}
        aria-label="Open sidebar"
      >
        <span className="sr-only">Open sidebar</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-40 sm:hidden"
          onClick={handleSidebarToggle}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full w-64 bg-[#10182A] transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:static sm:translate-x-0 sm:w-64`}
      >
        <DashboardSidebar userName={userProfile?.full_name || user?.email || "User"} />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 ml-0 sm:ml-64">
        <div className="sm:mt-0 mt-20 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-lg ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {message.text}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-[#17223b] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>
            <div className="flex items-center mb-6">
              <Image
                src={profile?.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover mr-4"
              />
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-[#232e47] text-white px-3 py-2 rounded-lg"
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={updateProfile}
                      className="bg-[#4fd1c5] text-[#232e47] px-4 py-2 rounded-lg hover:bg-[#38b2ac]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-white text-lg">{profile?.full_name}</div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#4fd1c5] hover:text-[#38b2ac] mt-2"
                    >
                      Edit Name
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Section */}
          {user.app_metadata.provider === 'email' && (
            <div className="bg-[#17223b] rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
              <div className="space-y-4">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#232e47] text-white px-3 py-2 rounded-lg"
                  placeholder="Current Password"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#232e47] text-white px-3 py-2 rounded-lg"
                  placeholder="New Password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#232e47] text-white px-3 py-2 rounded-lg"
                  placeholder="Confirm New Password"
                />
                <button
                  onClick={updatePassword}
                  className="bg-[#4fd1c5] text-[#232e47] px-4 py-2 rounded-lg hover:bg-[#38b2ac]"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Delete Account Section */}
          <div className="bg-[#17223b] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Delete Account</h2>
            {showDeleteConfirm ? (
              <div className="space-y-4">
                <p className="text-red-400">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="flex gap-4">
                  <button
                    onClick={deleteAccount}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete Account
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
