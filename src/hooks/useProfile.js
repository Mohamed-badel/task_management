import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function useProfile() {
  const { user, getProfile, updateProfile, updatePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    let data = await getProfile(user.id);

    if (!data) {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        display_name: user.user_metadata?.display_name || null,
        email: user.email || null,
        phone: user.user_metadata?.phone || null,
        role: "employee",
      });

      if (!error) {
        data = await getProfile(user.id);
      }
    }

    setProfile(data);
    setLoading(false);
  }, [user, getProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const meta = user?.user_metadata || {};
  const displayName = profile?.display_name || meta.display_name || "";
  const phone = profile?.phone || meta.phone || "";
  const email = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || email.slice(0, 2).toUpperCase();

  const update = useCallback(async (updates) => {
    const { data, error } = await updateProfile(updates);
    if (!error) {
      setProfile((prev) => ({
        ...prev,
        display_name: updates.display_name || prev?.display_name,
        phone: updates.phone || prev?.phone,
      }));
    }
    return { error };
  }, [updateProfile]);

  const updatePasswordFn = useCallback(async (newPassword) => {
    return await updatePassword(newPassword);
  }, [updatePassword]);

  return {
    profile,
    loading,
    displayName,
    phone,
    email,
    initials,
    user,
    updateProfile: update,
    updatePassword: updatePasswordFn,
    refetch: fetchProfile,
  };
}
