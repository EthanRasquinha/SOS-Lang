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
    role: "Investigación / Análisis",
    major: "WPI Ingeniería Civil '27",
    img: analuizaheadshot,
    accent: "#dc6505",
    gradient: "from-[#dc6505] to-[#f59e0b]",
  },
  {
    name: "Julian Espinal",
    role: "Desarrollo web",
    major: "WPI Ciencias de la Computación '27",
    img: julianheadshot,
    accent: "#185FA5",
    gradient: "from-[#185FA5] to-[#38bdf8]",
  },
  {
    name: "Ethan Rasquinha",
    role: "Desarrollo web",
    major: "WPI Ciencias de la Computación '27",
    img: ethanheadshot,
    accent: "#0F6E56",
    gradient: "from-[#0F6E56] to-[#34d399]",
  },
  {
    name: "Adriana Valero Navarro",
    role: "Investigación / Análisis",
    major: "WPI Ingeniería Aeroespacial '27",
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

        {/* ENCABEZADO */}
        <motion.div {...fadeUp} className="relative text-center flex flex-col items-center gap-5">
          <div className="pointer-events-none absolute top-[-60px] left-1/2 -translate-x-1/2 w-[500px] h-[260px] rounded-full bg-[#dc6505]/12 blur-[120px]" />
          <div className="pointer-events-none absolute top-0 left-1/4 w-[200px] h-[200px] rounded-full bg-[#185FA5]/12 blur-[90px]" />
          <div className="pointer-events-none absolute top-0 right-1/4 w-[200px] h-[200px] rounded-full bg-[#534AB7]/12 blur-[90px]" />

          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dc6505]/30 bg-[#dc6505]/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#dc6505]">
            <span className="h-1.5 w-1.5 rounded-full font-[Poppins] bg-[#dc6505] shadow-[0_0_6px_rgba(220,101,5,1)]" />
            El equipo detrás de SOS-LANG
          </div>

          <h1 className="relative text-5xl font-[Poppins] font-bold tracking-tight text-white">
            ¿Por qué y para qué?
          </h1>
          <p className="relative text-[15px] font-[Poppins] font-semibold text-slate-300 leading-relaxed">
            SOS-LANG es una iniciativa del Centro CUNEAC de la Universidad de Cádiz, desarrollada conjuntamente con el Instituto Politécnico de Worcester (WPI) mediante un convenio de colaboración bilateral para el desarrollo de proyectos técnicos de orientación social.
          </p>
          <p className="relative text-[15px] font-[Poppins] text-slate-400 leading-relaxed">
            Nuestro Equipo está compuesto por docentes y alumnos de varios países. Nuestra experiencia de enseñanza y aprendizaje nos demuestra que lo más difícil es organizar nuestros apuntes y repasar constantemente lo aprendido.
            Por ello, somos conscientes de que necesitamos formas más inteligentes de aprender. Nuestra plataforma combina la IA y un sencillo sistema de aprendizaje estructurado para ayudarte a estudiar más rápido, retener más y mantener siempre activos todos tus conocimientos.
          </p>
        </motion.div>

        {/* MISIÓN + QUÉ HACEMOS */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: <IconTarget />,
              gradient: "from-[#dc6505] to-[#f59e0b]",
              glow: "rgba(220,101,5,0.3)",
              border: "border-[#dc6505]/20",
              bg: "bg-[#dc6505]/6",
              title: "Nuestro Misión",
              body: "Nuestro objetivo es transformar el estudio en una experiencia inteligente y personalizada. Al combinar IA con técnicas de aprendizaje probadas, te ayudamos a centrarte en lo que realmente importa y que siempre tengas activados todos tus conocimientos.",
            },
            {
              icon: <IconZap />,
              gradient: "from-[#185FA5] to-[#38bdf8]",
              glow: "rgba(24,95,165,0.3)",
              border: "border-[#185FA5]/20",
              bg: "bg-[#185FA5]/6",
              title: "Que Hacemos",
              body: "Te facilitamos crear tus tarjetas de estudio de la manera más sencilla, con resúmenes y cuestionarios para ordenar, resumir y repasar tus apuntes. Podrás hacer un seguimiento regular y en tiempo real de tus progresos, identificar tus áreas más débiles y mejorar continuamente tu aprendizaje.",
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
<div>
        <h2 className="text-3xl font-semibold font-[Poppins] text-white mb-6 text-center">Nuestros Patrocinadores</h2>
        <div className="rounded-2xl font-[Poppins] border border-[#185FA5]/20 bg-[#185FA5]/6 overflow-hidden">
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

            <div className="bg-white p-8 flex items-center justify-center">
              <img
                src={ucaEmblem}
                alt="Logo CUNEAC"
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
  Una iniciativa internacional de la Universidad de Cádiz centrada en fortalecer la colaboración académica, científica y cultural entre España y los países de Europa del Este y Asia Central. Promueve alianzas entre universidades, apoya el intercambio de estudiantes y profesores, y desarrolla programas conjuntos de investigación y formación que conectan la educación con los desafíos del mundo real. A través de sus proyectos, eventos y colaboraciones institucionales, CUNEAC contribuye a crear oportunidades de aprendizaje intercultural, innovación y desarrollo profesional.
</p>

<p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-semibold">Leonor Acosta Bustamante</span>
  <br/>  
  Leonor Acosta Bustamante es Profesora Contratada Doctora de Filología Inglesa en la Universidad de Cádiz, especializada en Estudios Culturales y Estudios de Género. Su investigación se centra en la representación del género en la literatura, el cine y la cultura popular, con especial énfasis en la deconstrucción de los binarismos de género. Ha desarrollado una especialización en Estudios de Masculinidades y Transfeminismo, explorando cómo se construyen y cuestionan las identidades y roles de género en los textos culturales y los medios de comunicación. También forma parte del grupo de investigación HUM536, que estudia el concepto de alteridad en el mundo contemporáneo.
</p>

 <p className="text-[13px] text-slate-300 leading-relaxed text-left">
  <span className="text-white font-[Poppins] font-semibold">Andrés Santana Arribas</span>
  <br/>  
  Andrés Santana Arribas es profesor y coordinador cultural en la Universidad de Cádiz y la Universidad de Granada, especializado en lengua rusa, traducción y relaciones internacionales. Es responsable de varias iniciativas clave, entre ellas el Centro CUNEAC para Europa del Este y Asia Central, el Instituto Pushkin y el Aula Universitaria Hispano-Rusa (AUHR). Con una amplia trayectoria desde los años 90 como traductor, docente y gestor cultural, ha desempeñado un papel fundamental en el desarrollo de proyectos académicos y culturales entre España, Europa del Este y Asia Central, así como en la organización de eventos internacionales y programas de intercambio.
</p>


  </div>

</div>

        {/* ══════════════════════
            WPI PARTNERSHIP
        ══════════════════════ */}
        <div>
        <h2 className="text-3xl font-semibold font-[Poppins] text-white mb-6 text-center">Nuestros Profesores</h2>
        <div className="rounded-2xl font-[Poppins] border border-[#185FA5]/20 bg-[#185FA5]/6 overflow-hidden">

          {/* ── Professors: photo row ── */}
          <div className="grid grid-cols-3 gap-0">
            {/* Svetlana */}
            <div className="relative overflow-hidden h-56">
              <img src={svetlanaheadshot} alt="Svetlana Nikitina" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1e35]/60 to-transparent pointer-events-none" />
            </div>
            {/* WPI logo */}
            <div className="bg-white p-8 flex items-center justify-center">
              <img src={wpilogo} alt="WPI logo" className="max-h-36 object-contain" />
            </div>
            {/* Brajendra */}
            <div className="relative overflow-hidden h-56">
              <img src={brajendraheadshot} alt="Brajendra Mishra" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0d1e35]/60 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* ── Professors: info row ── */}
          <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
            {/* Svetlana info */}
            <div className="px-6 py-5">
              <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: 'linear-gradient(90deg, #AC2B37, transparent)' }} />
              <p className="text-sm font-semibold text-white font-[Poppins]">Svetlana Nikitina</p>
              <p className="text-[11px] text-slate-500 mt-0.5 italic font-serif font-[Poppins]">Directora del Centro de Proyectos en Cádiz</p>
              <p className="text-[12px] text-slate-500 mt-0.5 font-[Poppins]">Dirección académica e institucional</p>
            </div>
            {/* WPI info */}
            <div className="px-6 py-5">
              <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: 'linear-gradient(90deg, #AC2B37, transparent)' }} />
              <p className="text-sm font-semibold text-white font-[Poppins]">Worcester Polytechnic Institute</p>
            </div>
            {/* Brajendra info */}
            <div className="px-6 py-5">
              <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: 'linear-gradient(90deg, #AC2B37, transparent)' }} />
              <p className="text-sm font-semibold text-white font-[Poppins]">Brajendra Mishra</p>
              <p className="text-[11px] text-slate-500 mt-0.5 italic font-serif font-[Poppins]">Profesor de Ingeniería Mecánica y Materiales</p>
              <p className="text-[12px] text-slate-500 mt-0.5 font-[Poppins]">Coordinación Académica</p>
            </div>
          </div>
        </div>
</div>



        {/* ══════════════════════
                    THE TEAM
                ══════════════════════ */}
          <div>
          <h2 className="text-3xl font-semibold font-[Poppins] text-white mb-6 text-center">Nuestro Equipo</h2>
           <div className="rounded-2xl font-[Poppins] border border-[#185FA5]/20 bg-[#185FA5]/6 overflow-hidden">

          {/* ── Students: 4-col cards ── */}

          {/* ── Students: photo row ── */}
          <div className="grid grid-cols-4 gap-0">
            {/* Analuiza */}
            <div className="relative overflow-hidden h-56">
              <img src={analuizaheadshot} alt="Analuiza" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none" />
            </div>
            {/* Julian */}
            <div className="relative overflow-hidden h-56">
              <img src={julianheadshot} alt="Julian" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none" />
            </div>
            {/* Adriana */}
            <div className="relative overflow-hidden h-56">
              <img src={adrianaheadshot} alt="Adriana" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none" />
            </div>
            {/* Ethan */}
            <div className="relative overflow-hidden h-56">
              <img src={ethanheadshot} alt="Ethan" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none" />
            </div>
          </div>
          

          {/* ── Students: info row ── */}
          <div className="grid grid-cols-4 divide-x divide-white/[0.06]">
            {/* Analuiza info */}
            <div className="px-6 py-5">
              <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: 'linear-gradient(90deg, #185FA5, transparent)' }} />
              <p className="text-sm font-semibold text-white font-[Poppins]">Analuiza de Carvalho</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-[Poppins]">Investigación / Análisis
              </p>
              <p className="text-[11px] text-slate-500 italic font-serif mt-0.5 font-[Poppins]">
                Alumno de Ingeniería Civil '27
              </p>
            </div>
            {/* Julian info */}
            <div className="px-6 py-5">
              <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: 'linear-gradient(90deg, #185FA5, transparent)' }} />
              <p className="text-sm font-semibold text-white font-[Poppins]">Julian Espinal</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-[Poppins]">Desarrollo Web</p>
              <p className="text-[11px] text-slate-500 italic font-serif mt-0.5 font-[Poppins]">
                Alumno de Informática '27
              </p>
            </div>
            
            {/* Adriana info */}
            <div className="px-6 py-5">
              <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: 'linear-gradient(90deg, #185FA5, transparent)' }} />
              <p className="text-sm font-semibold text-white font-[Poppins]">Adriana Navarro Valero</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-[Poppins]">Investigación / Análisis</p>
              <p className="text-[11px] text-slate-500 italic font-serif mt-0.5 font-[Poppins]">
                Alumno de Ingeniería Aeroespacial '27
              </p>
            </div>
            {/* Ethan info */}
            <div className="px-6 py-5">
              <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: 'linear-gradient(90deg, #185FA5, transparent)' }} />
              <p className="text-sm font-semibold text-white font-[Poppins]">Ethan Rasquinha</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-[Poppins]">Desarrollo Web</p>
              <p className="text-[11px] text-slate-500 italic font-serif mt-0.5 font-[Poppins]">
                Alumno de Informática '27
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* CONTACTO */}
        <motion.div {...fadeUp} className="relative rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f1e2e 0%, #0d1a2c 50%, #101428 100%)" }}
        >
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[160px] rounded-full bg-[#dc6505]/12 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 w-[200px] h-[150px] rounded-full bg-[#185FA5]/15 blur-[60px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-[200px] h-[150px] rounded-full bg-[#534AB7]/15 blur-[60px]" />

          <div className="relative px-8 py-12 flex flex-col gap-8">
            <div className="text-center flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dc6505]/30 bg-[#dc6505]/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#dc6505]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#dc6505]" />
                Dinos hola
              </div>
              <h2 className="text-3xl font-semibold font-[Poppins] text-white">Ponte en contacto</h2>
              <p className="text-[13px] text-slate-400 max-w-sm leading-relaxed">
                ¿Tienes comentarios o ideas? Nos encantaría saber de ti.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0d1e35] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-[#dc6505]/50 focus:ring-1 focus:ring-[#dc6505]/30 transition-all"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0d1e35] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-[#dc6505]/50 focus:ring-1 focus:ring-[#dc6505]/30 transition-all"
                />
              </div>
              <textarea
                name="message"
                rows={5}
                placeholder="Tu mensaje..."
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
                {sent ? "¡Mensaje enviado!" : <><IconSend /> Enviar mensaje</>}
              </button>
            </form>
          </div>
        </motion.div>

      </div>

      {/* Pie de página */}
      <footer className="w-full border-t border-white/[0.07] bg-[#06101a] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#dc6505] shadow-[0_0_6px_rgba(220,101,5,0.8)]" />
          <span className="text-xs font-semibold text-slate-500">SOS-LANG</span>
        </div>
        <p className="text-xs text-slate-600">Diseñado para un repaso rápido y una retención significativa.</p>
      </footer>
    </div>
  );
};

export default About;