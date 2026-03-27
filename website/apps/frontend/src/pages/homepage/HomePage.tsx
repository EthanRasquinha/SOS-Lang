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
    <div className="min-h-screen w-full bg-[#ebe9e8] text-[#7c7f86] flex flex-col">

      {/* HERO */}
      <section className="w-full bg-white border-b font-['Poppins'] border-[#c1c4c7]">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center animate-fade-in">

          {/* TEXT */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold font-['Poppins'] text-[#004d73]">
              SOS-LANG: <br/>Language Learning Application
            </h1>

            <p className="text-lg">
              Turn your notes into an intelligent study system that helps you
              retain and master languages through active review.
            </p>

            <Button onClick={togglePopup} className="bg-[#dc6505] hover:bg-[#efb486] text-white px-6 py-2 transition-all duration-300 hover:scale-105">
              Get Started
            </Button>

            <RegistrationForm
                      open={popupVisible}
                      onClose={togglePopup}
                      onSuccess={() => console.log("Success")}
                    >
                      {/* optional children here */}
                    </RegistrationForm>
          </div>

          {/* IMAGE */}
          <div className="overflow-hidden rounded-xl">
            <img
              src={heroImage}
              alt="Language learning"
              className="rounded-xl shadow-sm"
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

          <p className="max-w-2xl mx-auto">
            SOS-Lang helps students actively review their own material instead
            of passively forgetting it. Built for accessibility, it supports
            learners from all backgrounds.
          </p>
        </section>

        {/* FEATURES (UPGRADED) */}
        <section className="space-y-10 animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-[#004d73] font-['Poppins'] text-center">
            Features
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <Card className="bg-white border border-[#c1c4c7] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-[#004d73] text-lg">
                  Personalized Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Add your own vocabulary and concepts — no fixed curriculum.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#c1c4c7] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-[#004d73] text-lg">
                  Smart Repetition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  The app intelligently revisits content based on your performance.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#c1c4c7] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-[#004d73] text-lg">
                  Visual Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
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
              <div className="w-6 h-6 bg-black mx-auto rounded mb-1"></div>
              <p>New</p>
            </div>

            <div className="transition-transform hover:scale-110">
              <div className="w-6 h-6 bg-green-500 mx-auto rounded mb-1"></div>
              <p>Mastered</p>
            </div>

            <div className="transition-transform hover:scale-110">
              <div className="w-6 h-6 bg-[#dc6505] mx-auto rounded mb-1"></div>
              <p>Review</p>
            </div>

            <div className="transition-transform hover:scale-110">
              <div className="w-6 h-6 bg-red-500 mx-auto rounded mb-1"></div>
              <p>Difficult</p>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#c1c4c7] text-center py-4 text-sm">
        <p>&copy; 2024 SOS-Lang</p>
      </footer>

    </div>
  );
};

export default HomePage;