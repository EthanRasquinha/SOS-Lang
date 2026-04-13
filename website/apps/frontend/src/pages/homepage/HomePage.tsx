import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import heroImage from '../../../assets/hero-image.png'
import { RegistrationForm } from '@/components/RegistrationForm';
import { useState} from 'react';

export const HomePage = () => {
  
  const [popupVisible, setPopupVisible] = useState<boolean>(false)
  function togglePopup() {
        setPopupVisible(!popupVisible)
    } 

  return (
    <div className="min-h-screen w-full bg-[var(--page-bg)] text-[var(--text-primary)] flex flex-col">

      {/* HERO */}
      <section className="w-full bg-[var(--surface)] border-b border-[#7c7f86] font-['Poppins']">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center animate-fade-in">

          {/* TEXT */}
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#36718f]">Study smarter with AI</p>
            <h1 className="text-5xl md:text-6xl font-bold font-['Poppins'] text-[#004d73] leading-tight">
              SOS-LANG
              <span className="block text-[#dc6505] mt-3">Smarter language review, organized.</span>
            </h1>

            <p className="text-lg text-[#7c7f86] max-w-2xl">
              Turn your notes into a powerful study system. Create flashcards, quiz yourself, and stay on track with vivid progress feedback.
            </p>

            <Button onClick={togglePopup} className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white px-6 py-3 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              Get Started
            </Button>

            <RegistrationForm
              open={popupVisible}
              onClose={togglePopup}
              onSuccess={() => console.log("Success")}
            />
          </div>

          {/* IMAGE */}
          <div className="overflow-hidden rounded-[32px] border border-[#7c7f86] shadow-[0_30px_90px_-55px_rgba(0,0,0,0.8)]">
            <img
              src={heroImage}
              alt="Language learning"
              className="rounded-[32px]"
            />
          </div>

        </div>
      </section>

      {/* MAIN */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 font-['Poppins'] space-y-20">

        {/* MISSION */}
        <section className="text-center space-y-4 animate-fade-in-up">
          <h2 className="text-2xl font-semibold font-['Poppins'] text-[#004d73]">
            A Better Way to Study
          </h2>

          <p className="max-w-2xl mx-auto text-[#7c7f86]">
            SOS-Lang helps students actively review their own material instead of passively forgetting it. Built to help language learners master vocabulary and grammar using AI-guided flashcards.
          </p>
        </section>

        {/* FEATURES (UPGRADED) */}
        <section className="space-y-10 animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-white font-['Poppins'] text-center">
            Features
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <Card className="surface-card transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-[#004d73] text-lg">
                  Personalized Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#7c7f86]">
                  Add your own vocabulary and concepts — no fixed curriculum.
                </p>
              </CardContent>
            </Card>

            <Card className="surface-card transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-[#004d73] text-lg">
                  Smart Repetition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#7c7f86]">
                  The app intelligently revisits content based on your performance.
                </p>
              </CardContent>
            </Card>

            <Card className="surface-card transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-[#004d73] text-lg">
                  Visual Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#7c7f86]">
                  Color-coded progress shows what you’ve mastered instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FEEDBACK SYSTEM */}
        <section className="text-center space-y-6 animate-fade-in-up">
          <h2 className="text-2xl font-semibold font-['Poppins'] text-[#004d73]">
            Learn Through Feedback
          </h2>

          <div className="flex justify-center gap-10 text-sm">

            <div className="transition-transform hover:scale-110">
              <div className="w-6 h-6 bg-[#7c7f86] mx-auto rounded mb-1"></div>
              <p>New</p>
            </div>

            <div className="transition-transform hover:scale-110">
              <div className="w-6 h-6 bg-[#36718f] mx-auto rounded mb-1"></div>
              <p>Mastered</p>
            </div>

            <div className="transition-transform hover:scale-110">
              <div className="w-6 h-6 bg-[#dc6505] mx-auto rounded mb-1"></div>
              <p>Review</p>
            </div>

            <div className="transition-transform hover:scale-110">
              <div className="w-6 h-6 bg-[#efb486] mx-auto rounded mb-1"></div>
              <p>Difficult</p>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--surface-soft)] border-t border-[#7c7f86] text-center py-6 text-sm text-[#004d73]">
        Built for fast review and meaningful retention.
      </footer>

    </div>
  );
};

export default HomePage;