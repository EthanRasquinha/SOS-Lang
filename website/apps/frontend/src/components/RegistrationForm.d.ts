import * as React from "react";
type RegistrationFormProps = {
    onSuccess: () => void;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
};
export declare const RegistrationForm: ({ onSuccess, open, onClose, children }: RegistrationFormProps) => React.JSX.Element | null;
export {};
