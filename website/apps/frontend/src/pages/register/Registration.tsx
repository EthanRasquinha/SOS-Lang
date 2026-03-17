import React from 'react';
import RegistrationForm from "@/components/RegistrationForm";

const Registration = () => {
    const handleRegistrationSuccess = () => {
        // Handle successful registration (redirect, show message, etc.)
        return console.log('Registration successful');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join us today</p>
                </div>
                <RegistrationForm onSuccess={handleRegistrationSuccess} />
            </div>
        </div>
    );
};

export default Registration;