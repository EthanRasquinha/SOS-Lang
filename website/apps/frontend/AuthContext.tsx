import * as React from "react";

type Role = "guest" | "user" | "admin";

type AuthContextType = {
  role: Role;
  setRole: React.Dispatch<React.SetStateAction<Role>>;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = React.useState<Role>("guest");

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