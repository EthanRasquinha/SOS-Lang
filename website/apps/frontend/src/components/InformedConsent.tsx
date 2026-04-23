import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type InformedConsentProps = {
  open: boolean;
  onClose: () => void;
  onConsent: () => void;
};

export const InformedConsent = ({ open, onClose, onConsent }: InformedConsentProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
      setIsChecked(false);
      // Small delay so the DOM is ready before we check scroll height
      setTimeout(() => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight) {
          setHasScrolledToBottom(true);
        }
      }, 100);
    }
  }, [open]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (atBottom) setHasScrolledToBottom(true);
  };

  const handleConsent = () => {
    onConsent();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`
          relative bg-[#07121d] border border-white/10 rounded-2xl shadow-2xl
          w-full max-w-2xl mx-4 flex flex-col
          transition-all duration-300
          ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#dc6505] shadow-[0_0_8px_rgba(220,101,5,0.8)]" />
            <h2 className="text-white font-['Poppins'] font-semibold text-lg tracking-tight">
              Informed Consent
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scroll indicator banner */}
        {!hasScrolledToBottom && (
          <div className="bg-[#dc6505]/10 border-b border-[#dc6505]/20 px-7 py-2 shrink-0">
            <p className="text-[#dc6505] text-xs font-['Poppins'] font-medium flex items-center gap-2">
              <span>↓</span>
              Please scroll through the entire document before proceeding.
            </p>
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto px-7 py-5 flex-1 scroll-smooth"
          style={{ minHeight: 0 }}
        >
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-['Poppins'] space-y-5 text-sm leading-relaxed">

            <h3 className="text-white font-semibold text-base">
              Informed Consent for Use of SOS-Lang Application
            </h3>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Introduction</h4>
              <p>
                Welcome to SOS-Lang. This application is designed to support language learning through interactive
                tools, note-taking features, and AI-assisted practice. Before using the app, please read the
                following information carefully.
              </p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Purpose of the Application</h4>
              <p>
                SOS-Lang provides users with tools to improve language skills in practical, real-world contexts.
                The app includes features such as vocabulary tracking, personalized review, and interactive
                learning support.
              </p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">User Participation</h4>
              <p>By using SOS-Lang, you may:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>Create and store personal learning notes</li>
                <li>Interact with AI-based language tools</li>
                <li>Engage with exercises and review materials</li>
                <li>Provide optional feedback to improve the app</li>
              </ul>
              <p className="mt-2">Use of the application is entirely voluntary.</p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Data Collection and Use</h4>
              <p>SOS-Lang may collect limited user data to support functionality and improve performance. This may include:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>Learning inputs (e.g., notes, vocabulary entries)</li>
                <li>App usage data (e.g., features used, session activity)</li>
              </ul>
              <p className="mt-2">Your data will be used to:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>Personalize your learning experience</li>
                <li>Improve app features and performance</li>
              </ul>
              <p className="mt-2">We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Privacy and Confidentiality</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Your information will be handled securely and stored using appropriate safeguards</li>
                <li>Personally identifiable information will not be shared without your consent</li>
                <li>Data may be analyzed in an aggregated or anonymized form to improve the application</li>
              </ul>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">AI-Generated Content Disclaimer and Limitation of Liability</h4>
              <p>
                SOS-Lang includes features powered by artificial intelligence (AI) that generate suggestions,
                explanations, and language-learning content. While these tools are designed to support learning:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>AI-generated content may be inaccurate, incomplete, or contextually incorrect</li>
                <li>Responses should be used as guidance only, not as definitive or authoritative information</li>
                <li>Users are responsible for reviewing and verifying any content before relying on it</li>
              </ul>
              <p className="mt-2">
                To the fullest extent permitted by applicable law, including under the General Data Protection
                Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>SOS-Lang and its developers disclaim all liability for errors or inaccuracies in AI-generated content</li>
                <li>SOS-Lang is not responsible for any decisions, actions, or outcomes resulting from reliance on such content</li>
                <li>AI-generated features are provided "as is" and "as available," without warranties of any kind, whether express or implied</li>
              </ul>
              <p className="mt-2 text-slate-500 text-xs">
                Nothing in this section limits or excludes liability where such limitation or exclusion is not permitted under applicable law.
              </p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Risks and Limitations</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>There are no significant risks associated with using the app</li>
                <li>AI-generated suggestions may not always be fully accurate and should be used as learning support, not as a sole authoritative source</li>
              </ul>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Voluntary Use</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>You are not required to use SOS-Lang</li>
                <li>You may stop using the application at any time</li>
                <li>You may request the deletion of your data where applicable</li>
              </ul>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Updates to This Agreement</h4>
              <p>
                This consent may be updated as the application evolves. Continued use of SOS-Lang indicates
                acceptance of any updated terms.
              </p>
            </section>

            <section className="border border-white/10 rounded-xl p-4 bg-white/[0.03]">
              <h4 className="text-white font-semibold text-sm mb-2">Consent Statement</h4>
              <p>By accessing or using SOS-Lang, you confirm that:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>You have read and understood this information</li>
                <li>You agree to the collection and use of your data as described</li>
                <li>You voluntarily choose to use the application</li>
              </ul>
            </section>

            {/* Bottom spacer so content clears the fade */}
            <div className="h-2" />
          </div>
        </div>

        {/* Fade overlay at the bottom of scroll area */}
        <div className="pointer-events-none absolute left-0 right-0 h-12 bg-gradient-to-t from-[#07121d] to-transparent" style={{ bottom: "130px" }} />

        {/* Footer: checkbox + button */}
        <div className="px-7 py-5 border-t border-white/10 shrink-0 space-y-4">
          <label
            className={`flex items-start gap-3 cursor-pointer group transition-opacity duration-200 ${
              !hasScrolledToBottom ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="sr-only"
              />
              <div
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                  ${isChecked
                    ? "bg-[#dc6505] border-[#dc6505]"
                    : "bg-transparent border-white/30 group-hover:border-[#dc6505]/60"}
                `}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-slate-300 text-sm font-['Poppins'] leading-snug select-none">
              I have read and understood the informed consent document and agree to the terms described above.
            </span>
          </label>

          <Button
            onClick={handleConsent}
            disabled={!hasScrolledToBottom || !isChecked}
            className={`
              w-full py-3 text-sm font-['Poppins'] font-semibold rounded-full transition-all duration-300
              ${hasScrolledToBottom && isChecked
                ? "bg-[#dc6505] hover:bg-[#e37b2f] text-white shadow-[0_12px_30px_rgba(220,101,5,0.35)] hover:scale-[1.02]"
                : "bg-white/5 text-slate-500 cursor-not-allowed"}
            `}
          >
            {!hasScrolledToBottom
              ? "Scroll to read the full document"
              : !isChecked
              ? "Please check the box to continue"
              : "I Consent — Continue to Sign Up →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InformedConsent;
