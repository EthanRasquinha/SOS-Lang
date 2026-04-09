import * as React from "react";
import { supabase } from "./src/lib/supabaseClient";

type Role = "guest" | "user" | "admin";

type AuthContextType = {
  role: Role;
  setRole: React.Dispatch<React.SetStateAction<Role>>;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = React.useState<Role>("guest");

  React.useEffect(() => {
    let mounted = true;

    const updateRole = (session: any) => {
      if (!mounted) return;
      setRole(session?.user ? "user" : "guest");
    };

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      updateRole(session);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateRole(session);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};