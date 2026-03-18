import React from 'react';
import RegistrationForm from "@/components/RegistrationForm";

export const Registration = () => {
  const handleRegistrationSuccess = () => {
    console.log('Registration successful');
  };

  return (
    <div className="min-h-screen bg-[#ebe9e8] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white border border-[#c1c4c7] rounded-xl shadow-sm p-8 space-y-6 animate-fade-in-up">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#004d73]">
            Create Account
          </h1>
          <p className="text-[#7c7f86]">
            Join SOS-Lang today
          </p>
        </div>

        {/* Registration Form */}
        <RegistrationForm onSuccess={handleRegistrationSuccess} />

      </div>
    </div>
  );
};

export default Registration;