import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#ebe9e8] text-[#7c7f86] flex flex-col px-6 py-16">
      
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-[#004d73] text-center animate-fade-in">
          About Us
        </h1>

        {/* Mission Section */}
        <section className="bg-white border border-[#c1c4c7] rounded-xl p-8 shadow-sm animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-[#004d73] mb-4">
            Our Mission
          </h2>
          <p>
            We are dedicated to creating innovative solutions that make a difference.
            Our team is committed to delivering high-quality products and services.
          </p>
        </section>

        {/* Who We Are */}
        <section className="bg-white border border-[#c1c4c7] rounded-xl p-8 shadow-sm animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-[#004d73] mb-4">
            Who We Are
          </h2>
          <p>
            Founded with a passion for excellence, we bring together talented
            individuals from diverse backgrounds to solve complex problems.
          </p>
        </section>

        {/* Get In Touch */}
        <section className="bg-white border border-[#c1c4c7] rounded-xl p-8 shadow-sm animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-[#004d73] mb-4">
            Get In Touch
          </h2>
          <p>
            Have questions? We'd love to hear from you. Contact us at:{' '}
            <a
              href="mailto:info@example.com"
              className="text-[#dc6505] hover:text-[#efb486] transition-colors duration-200"
            >
              info@example.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
};

export default About;