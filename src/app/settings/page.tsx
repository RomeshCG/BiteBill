"use client";
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export default function SettingsPage() {
  const { user } = useUser() || {};
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dashboard/settings-profile?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile || null);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="text-white p-8">Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      {profile && (
        <div className="bg-[#17223b] rounded-xl p-6 flex flex-col items-center">
            <Image
              src={profile.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full mb-4"
            />
            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full mb-4" />
          
          <div className="font-semibold text-white text-lg mb-2">{profile.full_name}</div>
          <div className="text-xs text-gray-400 mb-2">User ID: {profile.id}</div>
          <div className="text-xs text-gray-400">Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</div>
        </div>
        )}
    </div>
  );
}
