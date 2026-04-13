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
    <div className="min-h-screen w-full bg-[#07121d] text-white flex flex-col">

      {/* HERO */}
      <section className="w-full bg-[radial-gradient(circle_at_top_left,_rgba(220,101,5,0.18),transparent_25%),linear-gradient(180deg,#07121d_0%,#0b1d2e_100%)] border-b border-white/10 font-['Poppins']">
        <div className="w-full px-6 py-24 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">

          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-[#dc6505]" />
              AI-powered review
            </div>

            <div className="space-y-5 max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                Modern study, built for momentum.
              </h1>
              <p className="text-lg leading-8 text-slate-300">
                SOS-Lang helps you organize notes, create flashcards, and focus on what matters most with intelligent review signals.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                onClick={togglePopup}
                className="rounded-full bg-[#dc6505] px-7 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(220,101,5,0.24)] transition hover:bg-[#e37b2f]"
              >
                Get Started
              </Button>
              <span className="text-sm text-slate-400 max-w-sm">
                No credit card needed — start building smarter review habits now.
              </span>
            </div>

            <RegistrationForm
              open={popupVisible}
              onClose={togglePopup}
              onSuccess={() => console.log("Success")}
            />
          </div>

          <div className=" overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1b2b] shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <img
              src={heroImage}
              alt="Language learning"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07121d] to-transparent" />
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 space-y-20">
        <section className="rounded-[32px] border border-white/10 bg-white/5 px-8 py-12 shadow-[0_30px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.35em] text-[#dc6505]/90">Why SOS-Lang</p>
              <h2 className="text-3xl font-semibold text-white">
                A cleaner way to keep your language study on track.
              </h2>
              <p className="max-w-2xl text-slate-300">
                Keep everything in one place and let the app surface which flashcards need reviews, which concepts are mastered, and which ones deserve your attention next.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[#0f1f2d] p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Organize</p>
                <p className="mt-4 text-xl font-semibold text-white">Notes to flashcards</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0f1f2d] p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Review</p>
                <p className="mt-4 text-xl font-semibold text-white">Smart quiz pacing</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-[#dc6505]/80">Features</p>
              <h2 className="text-3xl font-semibold text-white">Fast, modern workflows for studying.</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="rounded-[28px] border border-white/10 bg-[#0f1f2f] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Personalized notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Add vocabulary, grammar, and examples your way with a minimal, distraction-free layout.</p>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#0f1f2f] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Smart repetition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">The app highlights what needs practice and helps you review efficiently.</p>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/10 bg-[#0f1f2f] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Visual progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Get instant visual cues on mastery, review priority, and performance trends.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-semibold text-white">Feedback at a glance</h2>
            <p className="mx-auto max-w-2xl text-slate-300">
              Know exactly which cards are new, mastered, due for review, or still difficult — all in one clean dashboard.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-[#0f1f2f] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7c7f86] text-white">N</div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">New</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0f1f2f] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-900 text-white">M</div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Mastered</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0f1f2f] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">R</div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Review</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0f1f2f] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-900 text-white">D</div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Difficult</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#06131f] border-t border-white/10 text-center py-6 text-sm text-slate-400">
        Built for fast review and meaningful retention.
      </footer>
    </div>
  );
};

export default HomePage;