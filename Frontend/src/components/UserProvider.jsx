import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session on initial load
    const loadSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) console.error("Failed to get session:", error);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    loadSession(); // Listen for session changes (login, logout, token refresh)

    // Listen for session changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed. New session:", session); // Log session refresh events
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.unsubscribe?.();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, session, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Optional hook for easier access in components
export const useUser = () => useContext(UserContext);
