import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

const sanitize = (str) => str.replace(/[<>"'&]/g, "").trim();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error("Session fetch error:", error.message);
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleFocus = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session) {
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email: sanitize(email),
      password,
      options: {
        data: {
          display_name: sanitize(metadata.display_name || ""),
          phone: sanitize(metadata.phone || ""),
        },
      },
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        display_name: sanitize(metadata.display_name) || null,
        phone: sanitize(metadata.phone) || null,
        role: "employee",
      });
      if (profileError) console.error("Profile insert error:", profileError.message);
    }

    return { data, error };
  };

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email: sanitize(email), password });

  const getProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: sanitize(updates.display_name || ""),
        phone: sanitize(updates.phone || ""),
      },
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          display_name: sanitize(updates.display_name) || null,
          phone: sanitize(updates.phone) || null,
        }, { onConflict: "id" });
      if (profileError) console.error("Profile update error:", profileError.message);
      await fetchProfile(data.user.id);
    }

    return { data, error };
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(sanitize(email), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    return { error };
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signOut,
      getProfile,
      updateProfile,
      updatePassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
