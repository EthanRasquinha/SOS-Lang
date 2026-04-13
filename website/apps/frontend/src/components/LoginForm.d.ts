import * as React from "react";
type LoginFormProps = {
    onSuccess: () => void;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
};
export declare const LoginForm: ({ onSuccess, open, onClose, children }: LoginFormProps) => React.JSX.Element | null;
export {};
