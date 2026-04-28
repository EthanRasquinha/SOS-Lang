import React, { useState } from 'react';
import { motion } from 'framer-motion';
import julianheadshot from '../../assets/julianheadshot.jpg';
import adrianaheadshot from '../../assets/adrianaheadshot.jpg';
import ethanheadshot from '../../assets/ethanheadshot.png';
import ucaEmblem from '../../assets/UCA-emblem.png';
import andresheadshot from '../../assets/andresheadshot.jpg';
import leonorheadshot from '../../assets/leonorheadshot.jpg';
import analuizaheadshot from '../../assets/analuizaheadshot.png';
import svetlanaheadshot from '../../assets/svetlanaheadshot.jpg';
import brajendraheadshot from '../../assets/brajendraheadshot.jpg';
import wpilogo from '../../assets/wpilogo.png';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeInOut" as const },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// ── Icons ──────────────────────────────────────────────
const IconTarget = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const TEAM = [
  {
    name: "Analuiza de Carvalho",
    role: "Research / Analysis",
    major: "WPI Civil Engineering '27",
    img: analuizaheadshot,
    accent: "#dc6505",
    gradient: "from-[#dc6505] to-[#f59e0b]",
  },
  {
    name: "Julian Espinal",
    role: "Web Development",
    major: "WPI Computer Science '27",
    img: julianheadshot,
    accent: "#185FA5",
    gradient: "from-[#185FA5] to-[#38bdf8]",
  },
  {
    name: "Ethan Rasquinha",
    role: "Web Development",
    major: "WPI Computer Science '27",
    img: ethanheadshot,
    accent: "#0F6E56",
    gradient: "from-[#0F6E56] to-[#34d399]",
  },
  {
    name: "Adriana Valero Navarro",
    role: "Research / Analysis",
    major: "WPI Aerospace Engineering '27",
    img: adrianaheadshot,
    accent: "#534AB7",
    gradient: "from-[#534AB7] to-[#a78bfa]",
  },
];

export const About: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const res = await fetch('https://formspree.io/f/mwvaaeqo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(formData),
  });

  if (res.ok) {
    setFormData({ name: '', email: '', message: '' });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }
};

  return (
    <div
      className="min-h-screen bg-[#06101a] text-white flex flex-col items-center overflow-x-hidden"
      style={{ fontFamily: "'Sora', 'Poppins', sans-serif" }}
    >
      <div className="max-w-5xl w-full flex flex-col gap-20 px-6 py-20">

        {/* ══════════════════════
            HEADER
        ══════════════════════ */}
        <motion.div {...fadeUp} className="relative text-center flex flex-col items-center gap-5">
          {/* Glows */}
          <div className="pointer-events-none absolute top-[-60px] left-1/2 -translate-x-1/2 w-[500px] h-[260px] rounded-full bg-[#dc6505]/12 blur-[120px]" />
          <div className="pointer-events-none absolute top-0 left-1/4 w-[200px] h-[200px] rounded-full bg-[#185FA5]/12 blur-[90px]" />
          <div className="pointer-events-none absolute top-0 right-1/4 w-[200px] h-[200px] rounded-full bg-[#534AB7]/12 blur-[90px]" />

          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dc6505]/30 bg-[#dc6505]/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#dc6505]">
            <span className="h-1.5 w-1.5 rounded-full font-[Poppins] bg-[#dc6505] shadow-[0_0_6px_rgba(220,101,5,1)]" />
            The team behind SOS-LANG
          </div>

          <h1 className="relative text-5xl font-[Poppins] font-bold tracking-tight text-white">
            About Us
          </h1>
          <p className="relative text-[15px] font-[Poppins] text-slate-400 max-w-xl leading-relaxed">
            Building smarter ways to learn. Our platform blends AI and structured learning
            to help you study faster, retain more, and stay consistent.
          </p>
        </motion.div>

        {/* ══════════════════════
            MISSION + WHAT WE DO
        ══════════════════════ */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: <IconTarget />,
              gradient: "from-[#dc6505] to-[#f59e0b]",
              glow: "rgba(220,101,5,0.3)",
              border: "border-[#dc6505]/20",
              bg: "bg-[#dc6505]/6",
              title: "Our Mission",
              body: "We aim to transform studying into an intelligent, personalized experience. By combining AI with proven learning techniques, we help you focus on what actually matters.",
            },
            {
              icon: <IconZap />,
              gradient: "from-[#185FA5] to-[#38bdf8]",
              glow: "rgba(24,95,165,0.3)",
              border: "border-[#185FA5]/20",
              bg: "bg-[#185FA5]/6",
              title: "What We Do",
              body: "Generate flashcards, quizzes, and insights directly from your notes. Track performance, identify weak areas, and continuously improve your language learning.",
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className={`relative rounded-2xl font-[Poppins] border ${card.border} ${card.bg} p-7 flex flex-col gap-5 overflow-hidden`}
            >
              <div className="pointer-events-none font-[Poppins] absolute top-0 left-0 w-40 h-40 rounded-full blur-[70px] opacity-30" style={{ background: card.glow }} />
              <div
                className={`relative w-11 h-11 font-[Poppins] rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${card.gradient}`}
                style={{ boxShadow: `0 0 20px ${card.glow}` }}
              >
                {card.icon}
              </div>
              <div className="relative">
                <h2 className="text-lg font-semibold text-white mb-2 font-[Poppins]">{card.title}</h2>
                <p className="text-[13px] text-slate-400 leading-relaxed font-[Poppins]">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════
            SPONSOR
        ══════════════════════ */}
        <div className="rounded-2xl font-[Poppins] border border-[#185FA5]/20 bg-[#185FA5]/6 overflow-hidden">
  {/* Logo + headshot row */}
  <div className="grid grid-cols-3 gap-0">

    {/* Left headshot */}
    <div className="relative font-[Poppins] overflow-hidden h-56">
      <img
        src={leonorheadshot}
        alt="Leonor"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1e35]/60 to-transparent pointer-events-none" />
    </div>

    {/* Center logo */}
    <div className="bg-white p-8 flex items-center justify-center">
      <img
        src={ucaEmblem}
        alt="CUNEAC logo"
        className="max-h-36 object-contain"
      />
    </div>

    {/* Right headshot */}
    <div className="relative font-[Poppins] overflow-hidden h-56">
      <img
        src={andresheadshot}
        alt="Andrés"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0d1e35]/60 to-transparent pointer-events-none" />
    </div>

  </div>

  {/* Description */}
  <div className="px-8 py-6 items-center justify-center flex flex-col gap-4">
    <div className='flex justify-between w-full'>
    <h3 className="text-lg font-semibold text-white text-left">Leonor Acosta Bustamante</h3>
    <h3 className="text-lg font-semibold text-white text-left">CUNEAC</h3>
    <h3 className="text-lg font-semibold text-white text-left">Andrés Santana Arribas</h3>
    </div>
    <p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-[Poppins] font-semibold">CUNEAC - (Centro Universitario para Europa del Este y Asia Central) </span>
  <br/>  
An international initiative of the University of Cádiz focused on strengthening academic, scientific, and cultural collaboration between Spain and countries in Eastern Europe and Central Asia. It promotes partnerships between universities, supports student and faculty exchanges, and develops joint research and training programs that connect education with real-world challenges. Through its projects, events, and institutional collaborations, CUNEAC helps create opportunities for cross-cultural learning, innovation, and professional development.
</p>

<p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-semibold">Leonor Acosta Bustamante</span>
  <br/>  
Leonor Acosta Bustamante is a Permanent Lecturer (Profesora Contratada Doctora) in English Philology at the University of Cádiz, specializing in Cultural Studies and Gender Studies. Her research focuses on the representation of gender in literature, film, and popular culture, with particular emphasis on the deconstruction of gender binaries. She has developed expertise in Masculinity Studies and Transfeminism, exploring how gender identities and roles are constructed and challenged across cultural texts and media. She is also part of the HUM536 research group, which studies the concept of alterity in the contemporary world.</p>

 <p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-[Poppins] font-semibold">Andrés Santana Arribas</span>
  <br/>  
Andrés Santana Arribas is a lecturer and cultural coordinator at the University of Cádiz and the University of Granada, specializing in Russian language, translation, and international relations. He is responsible for several key initiatives, including the CUNEAC Center for Eastern Europe and Central Asia, the Pushkin Institute, and the Hispanic-Russian University Classroom (AUHR). With extensive experience since the 1990s as a translator, educator, and cultural manager, he has played a major role in developing academic and cultural projects between Spain, Eastern Europe, and Central Asia, as well as organizing international events and exchange programs.
</p>


  </div>

</div>

        {/* ══════════════════════
            WPI PARTNERSHIP
        ══════════════════════ */}
        <div className="rounded-2xl font-[Poppins] border border-[#185FA5]/20 bg-[#185FA5]/6 overflow-hidden">
  {/* Logo + headshot row */}
  <div className="grid grid-cols-3 gap-0">

    {/* Left headshot */}
    <div className="relative font-[Poppins] overflow-hidden h-56">
      <img
        src={svetlanaheadshot}
        alt="Svetlana Nikitina"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1e35]/60 to-transparent pointer-events-none" />
    </div>

    {/* Center logo */}
    <div className="bg-white p-8 flex items-center justify-center">
      <img
        src={wpilogo}
        alt="WPI logo"
        className="max-h-36 object-contain"
      />
    </div>

    {/* Right headshot */}
    <div className="relative font-[Poppins] overflow-hidden h-56">
      <img
        src={brajendraheadshot}
        alt="Brajendra Mishra"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0d1e35]/60 to-transparent pointer-events-none" />
    </div>

  </div>

  {/* Professor Descriptions */}
  <div className="px-8 py-6 items-center justify-center flex flex-col gap-4">
    <div className='flex justify-between w-full'>
    <h3 className="text-lg font-semibold text-white text-left">Svetlana Nikitina</h3>
    <h3 className="text-lg font-semibold text-white text-left">WPI</h3>
    <h3 className="text-lg font-semibold text-white text-left">Brajendra Mishra</h3>
    </div>
    
    <p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-[Poppins] font-semibold">Worcester Polytechnic Institute (WPI) </span>
  <br/>  
  [Add information about WPI partnership and collaboration here]
</p>

<p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-semibold">Svetlana</span>
  <br/>  
  [Add Svetlana's role, background, and contributions to the SOS-LANG project here]
</p>

 <p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-[Poppins] font-semibold">Brajendra</span>
  <br/>  
  [Add Brajendra's role, background, and contributions to the SOS-LANG project here]
</p>



  </div>

<div className="grid grid-cols-4 gap-0">

    {/* Analuiza */}
    <div className="relative font-[Poppins] overflow-hidden h-56">
      <img
        src={analuizaheadshot}
        alt="Analuiza de Carvalho"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1e35]/60 to-transparent pointer-events-none" />
    </div>

    {/* Julian */}
    <div className="bg-white p-8 flex items-center justify-center">
      <img
        src={julianheadshot}
        alt="Julian Espinal"
        className="max-h-36 object-contain"
      />
    </div>

    {/* Ethan */}
    <div className="relative font-[Poppins] overflow-hidden h-56">
      <img
        src={ethanheadshot}
        alt="Ethan Rasquinha"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0d1e35]/60 to-transparent pointer-events-none" />
    </div>

    {/* Adriana */}
    <div className="relative font-[Poppins] overflow-hidden h-56">
      <img
        src={adrianaheadshot}
        alt="Adriana Navarro Valero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0d1e35]/60 to-transparent pointer-events-none" />
    </div>

  </div>


</div>

        {/* ══════════════════════
            TEAM
        ══════════════════════ */}
        <motion.div {...fadeUp} className="flex flex-col gap-8">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-3">The people</p>
            <h2 className="text-3xl font-semibold font-[Poppins] text-white">Who We Are</h2>
          </div>

          <motion.div variants={stagger} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="group relative font-[Poppins] rounded-2xl border border-white/[0.06] bg-[#0d1f35] hover:border-white/[0.14] overflow-hidden transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Photo */}
                <div className="relative h-60 w-full overflow-hidden">
                  {member.img ? (
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${member.gradient}`}
                    >
                      <span className="text-4xl font-bold text-white/30">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d1f35] to-transparent pointer-events-none" />
                </div>

                {/* Info */}
                <div className="px-5 pb-5 pt-2">
                  <div
                    className="h-0.5 w-8 rounded-full mb-3"
                    style={{ background: `linear-gradient(90deg, ${member.accent}, transparent)` }}
                  />
                  <p className="text-sm font-semibold text-white leading-tight font-[Poppins]">{member.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-[Poppins]">{member.role}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-[Poppins]">{member.major}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ══════════════════════
            CONTACT
        ══════════════════════ */}
        <motion.div {...fadeUp} className="relative rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f1e2e 0%, #0d1a2c 50%, #101428 100%)" }}
        >
          {/* Glows */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[160px] rounded-full bg-[#dc6505]/12 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 w-[200px] h-[150px] rounded-full bg-[#185FA5]/15 blur-[60px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-[200px] h-[150px] rounded-full bg-[#534AB7]/15 blur-[60px]" />

          <div className="relative px-8 py-12 flex flex-col gap-8">
            <div className="text-center flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dc6505]/30 bg-[#dc6505]/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#dc6505]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#dc6505]" />
                Say hello
              </div>
              <h2 className="text-3xl font-semibold font-[Poppins] text-white">Get in Touch</h2>
              <p className="text-[13px] text-slate-400 max-w-sm leading-relaxed">
                Have feedback or ideas? We'd love to hear from you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0d1e35] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-[#dc6505]/50 focus:ring-1 focus:ring-[#dc6505]/30 transition-all"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0d1e35] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-[#dc6505]/50 focus:ring-1 focus:ring-[#dc6505]/30 transition-all"
                />
              </div>
              <textarea
                name="message"
                rows={5}
                placeholder="Your message..."
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full bg-[#0d1e35] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-[#dc6505]/50 focus:ring-1 focus:ring-[#dc6505]/30 transition-all resize-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(220,101,5,0.4)]"
                style={{ background: "linear-gradient(135deg, #dc6505, #f59e0b)" }}
              >
                {sent ? "Message sent!" : <><IconSend /> Send Message</>}
              </button>
            </form>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.07] bg-[#06101a] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#dc6505] shadow-[0_0_6px_rgba(220,101,5,0.8)]" />
          <span className="text-xs font-semibold text-slate-500">SOS-LANG</span>
        </div>
        <p className="text-xs text-slate-600">Built for fast review and meaningful retention.</p>
      </footer>
    </div>
  );
};

export default About;