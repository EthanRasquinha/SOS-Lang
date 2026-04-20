import * as React from "react";
import { Session, User } from "@supabase/supabase-js";
type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
};
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAuth: () => AuthContextType;
export {};
