import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const About: React.FC = () => {

    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };
  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] flex flex-col px-6 py-16">
      
      <div className="max-w-4xl mx-auto font-['Poppins'] space-y-12">

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-[#004d73] font-['Poppins'] text-center animate-fade-in">
          About Us
        </h1>

        {/* Mission Section */}
        <section className="surface-card rounded-3xl p-8 shadow-2xl animate-fade-in-up border border-[#7c7f86]">
          <h2 className="text-2xl font-semibold font-['Poppins'] text-[#004d73] mb-4">
            Our Mission
          </h2>
          <p>
            We are dedicated to creating innovative solutions that make a difference.
            Our team is committed to delivering high-quality products and services.
          </p>
        </section>

        {/* Who We Are */}
        <section className="surface-card rounded-3xl p-8 shadow-2xl animate-fade-in-up border border-[#7c7f86]">
          <h2 className="text-2xl font-semibold font-['Poppins'] text-[#004d73] mb-4">
            Who We Are
          </h2>
          <p>
            Founded with a passion for excellence, we bring together talented
            individuals from diverse backgrounds to solve complex problems.
          </p>
        </section>

        {/* Get In Touch */}
        <section className="surface-card font-['Poppins'] rounded-3xl p-2 shadow-2xl animate-fade-in-up border border-[#7c7f86]">
              <div className=" px-6 py-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-[#004d73] font-['Poppins'] mb-8 animate-fade-in">Contact Us</h1>

      <Card className="w-full max-w-2xl surface-card shadow-2xl animate-fade-in-up border border-[#7c7f86]">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label htmlFor="name" className="font-medium text-[#7c7f86]">Name</label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="email" className="font-medium text-[#7c7f86]">Email</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="message" className="font-medium text-[#7c7f86]">Message</label>
              <Textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required />
            </div>
            <Button type="submit" className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white w-full">Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
        </section>

      </div>
    </div>
  );
};

export default About;