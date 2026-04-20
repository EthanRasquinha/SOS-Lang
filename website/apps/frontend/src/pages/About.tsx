import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import julianheadshot from '../../assets/julianheadshot.jpg';
import adrianaheadshot from '../../assets/adrianaheadshot.jpg';
import ethanheadshot from '../../assets/ethanheadshot.jpg';
import ucaEmblem from '../../assets/UCA-emblem.png';
import andresheadshot from '../../assets/andresheadshot.jpg';

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
    <div className="min-h-screen bg-[var(--page-bg)] font-[Poppins] text-white px-6 py-16 flex flex-col items-center">
      <div className="max-w-5xl w-full flex flex-col gap-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-[Poppins] space-y-4"
        >
          <h1 className="text-5xl font-[Poppins] tracking-tight">About</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Building smarter ways to learn. Our platform blends AI and structured learning
            to help you study faster, retain more, and stay consistent.
          </p>
        </motion.div>

        {/* Grid Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-[Poppins]">Our Mission</h2>
              <p className="text-slate-400">
                We aim to transform studying into an intelligent, personalized experience.
                By combining AI with proven learning techniques, we help you focus on what
                actually matters.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-[Poppins]">What We Do</h2>
              <p className="text-slate-400">
                Generate flashcards, quizzes, and insights directly from your notes.
                Track performance, identify weak areas, and continuously improve.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Who We Are Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-3xl font-[Poppins] text-center">Who We Are</h2>
          {/* Sponsor */}
            <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-hidden">
              <h1 className="font-[Poppins] text-2xl">Our Sponsor</h1>
              <div className="bg-white p-5 w-full flex gap-4">
  
  {/* LEFT: main banner */}
  <div className="w-2/3 h-48">
    <img
      src={ucaEmblem}
      alt="CUNEAC logo"
      className="w-full h-full object-contain"
    />
  </div>

  {/* RIGHT: smaller box */}
  <div className="w-1/3 h-48">
    <img
      src={andresheadshot}
      alt="Andres headshot"
      className="w-full h-full object-cover rounded-xl"
    />
  </div>

</div>
              <CardContent className="p-6 text-center">
                <h1 className="font-[Poppins] text-2xl">CUNEAC</h1>
                <p className="text-slate-400 text-sm">CUNEAC (University of Cádiz – Escuela Técnica Superior de Ingeniería de Algeciras) is a student-focused academic and professional development initiative that connects engineering education with real-world application. It fosters collaboration between students, faculty, and industry partners, supporting innovation, technical growth, and hands-on learning opportunities. Through events, sponsorships, and applied projects, CUNEAC helps bridge the gap between classroom knowledge and practical experience. </p>
              </CardContent>
            </Card>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Team Member 1 */}
            <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-hidden">
                <img alt="Analuiza De Carvalho" className="w-full h-full object-cover" />
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold">Analuiza De Carvalho</h3>
                <p className="text-slate-400 text-sm">Role / Focus</p>
              </CardContent>
            </Card>

            {/* Team Member 2 */}
            <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-hidden">
                <img src={julianheadshot} alt="Julian Espinal" className="w-full h-full object-cover" />
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold">Julian Espinal</h3>
                <p className="text-slate-400 text-sm">Role / Focus</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-hidden">
                <img src={ethanheadshot} alt="Ethan Rasquinha" className="w-full h-full object-cover" />
              
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold">Ethan Rasquinha</h3>
                <p className="text-slate-400 text-sm">Role / Focus</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-hidden">
                <img src={adrianaheadshot} alt="Adriana Navarro" className="w-full h-full object-cover" />
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold">Adriana Navarro</h3>
                <p className="text-slate-400 text-sm">Role / Focus</p>
              </CardContent>
            </Card>

            
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl">
            <CardContent className="p-10 flex flex-col gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Get in Touch</h2>
                <p className="text-slate-400 text-sm">
                  Have feedback or ideas? We'd love to hear from you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Textarea
                  name="message"
                  rows={5}
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />

                <Button
                  type="submit"
                  className="w-full rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold transition-all duration-300 hover:scale-[1.02]"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default About;
