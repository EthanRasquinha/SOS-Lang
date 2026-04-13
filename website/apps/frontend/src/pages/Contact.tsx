import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Contact: React.FC = () => {
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
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] px-6 py-16 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-[#004d73] mb-8 animate-fade-in">Contact Us</h1>

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
  );
};

export default Contact;