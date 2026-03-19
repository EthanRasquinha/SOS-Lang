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
    <div className=" bg-[#ebe9e8] text-[#7c7f86] flex flex-col px-6 py-16">
      
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
        <section className="bg-white border border-[#c1c4c7] rounded-xl p-2 shadow-sm animate-fade-in-up">
              <div className=" px-6 py-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-[#004d73] mb-8 animate-fade-in">Contact Us</h1>

      <Card className="w-full max-w-2xl border-[#c1c4c7] shadow-sm animate-fade-in-up">
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
            <Button type="submit" className="bg-[#dc6505] hover:bg-[#efb486] text-white w-full">Send Message</Button>
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