import * as React from "react";
type Role = "guest" | "user" | "admin";
type AuthContextType = {
    role: Role;
    setRole: React.Dispatch<React.SetStateAction<Role>>;
};
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAuth: () => AuthContextType;
export {};
