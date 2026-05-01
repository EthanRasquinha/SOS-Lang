import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

{/*
  This component implements a modal dialog that presents an informed consent agreement to the user. 
  The user must scroll to the bottom of the content and check a box to enable the consent button.
*/}

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
              Consemiento Informado
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
              Por favor, despláce para leer el documento completo antes de continuar.
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
              Consemiento informado por el uso de SOS-LANG
            </h3>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Introducción</h4>
              <p>
                Bienvenido a SOS-Lang. 
                Esta aplicación está diseñada para apoyar el aprendizaje de idiomas mediante herramientas interactivas, funciones de toma de notas y práctica asistida por inteligencia artificial. 
                Antes de utilizar la aplicación, por favor lea atentamente la siguiente información.
              </p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Propósito de la Aplicación</h4>
              <p>
                SOS-Lang proporciona a los usuarios herramientas para mejorar sus habilidades lingüísticas en contextos prácticos y de la vida real. 
                La aplicación incluye funciones como seguimiento de vocabulario, revisión personalizada y apoyo interactivo al aprendizaje.
              </p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Participación del Usuario</h4>
              <p>Al utilizar SOS-Lang, usted puede:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>Crear y almacenar notas personales de aprendizaje</li>
                <li>Interactuar con herramientas lingüísticas basadas en inteligencia artificial</li>
                <li>Participar en ejercicios y materiales de repaso</li>
                <li>Proporcionar comentarios opcionales para mejorar la aplicación</li>
              </ul>
              <p className="mt-2">El uso de la aplicación es completamente voluntario.</p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Recopilación y Uso de Datos</h4>
              <p>SOS-Lang puede recopilar datos limitados del usuario para apoyar su funcionamiento y mejorar su rendimiento. Esto puede incluir:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>Entradas de aprendizaje (por ejemplo, notas, vocabulario)</li>
                <li>Datos de uso de la aplicación (por ejemplo, funciones utilizadas, actividad de sesión)</li>
              </ul>
              <p className="mt-2">Sus datos se utilizarán para:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>Personalizar su experiencia de aprendizaje</li>
                <li>Mejorar las funciones y el rendimiento de la aplicación</li>
              </ul>
              <p className="mt-2">No vendemos sus datos personales a terceros.</p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Privacidad y Confidencialidad</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Su información será tratada de forma segura y almacenada con las salvaguardas adecuadas</li>
                <li>La información personal identificable no será compartida sin su consentimiento</li>
                <li>Los datos pueden ser analizados de forma agregada o anonimizada para mejorar la aplicación</li>
              </ul>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Descargo de Responsabilidad sobre Contenido Generado por IA y Limitación de Responsabilidad</h4>
              <p>
                SOS-Lang incluye funciones impulsadas por inteligencia artificial (IA) que generan sugerencias, explicaciones y contenido de aprendizaje de idiomas. 
                Aunque estas herramientas están diseñadas para apoyar el aprendizaje:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>El contenido generado por IA puede ser inexacto, incompleto o incorrecto en contexto</li>
                <li>Las respuestas deben utilizarse solo como guía, no como información definitiva o autoritativa</li>
                <li>Los usuarios son responsables de revisar y verificar cualquier contenido antes de confiar en él</li>
              </ul>
              <p className="mt-2">
                En la máxima medida permitida por la ley aplicable, incluyendo el Reglamento General de Protección de Datos (RGPD):
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>SOS-Lang y sus desarrolladores declinan toda responsabilidad por errores o inexactitudes en el contenido generado por IA</li>
                <li>SOS-Lang no es responsable de decisiones, acciones o resultados derivados del uso de dicho contenido</li>
                <li>Las funciones de IA se proporcionan “tal cual” y “según disponibilidad”, sin garantías de ningún tipo, ya sean expresas o implícitas</li>
              </ul>
              <p className="mt-2 text-slate-500 text-xs">
                Nada en esta sección limita o excluye la responsabilidad cuando dicha limitación o exclusión no esté permitida por la ley aplicable.
              </p>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Riesgos y Limitaciones</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>No existen riesgos significativos asociados con el uso de la aplicación</li>
                <li>Las sugerencias generadas por IA pueden no ser completamente precisas y deben utilizarse como apoyo al aprendizaje, no como única fuente autoritativa</li>
              </ul>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Uso Voluntario</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>No está obligado a utilizar SOS-Lang</li>
                <li>Puede dejar de usar la aplicación en cualquier momento</li>
                <li>Puede solicitar la eliminación de sus datos cuando corresponda</li>
              </ul>
            </section>

            <section>
              <h4 className="text-[#dc6505] font-semibold uppercase text-xs tracking-widest mb-2">Actualizaciones de Este Acuerdo</h4>
              <p>
                Este consentimiento puede actualizarse a medida que evoluciona la aplicación. 
                El uso continuado de SOS-Lang implica la aceptación de cualquier término actualizado.
              </p>
            </section>

            <section className="border border-white/10 rounded-xl p-4 bg-white/[0.03]">
              <h4 className="text-white font-semibold text-sm mb-2">Declaración de Consentimiento</h4>
              <p>Al acceder o utilizar SOS-Lang, usted confirma que:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 mt-2">
                <li>Ha leído y comprendido esta información</li>
                <li>Acepta la recopilación y uso de sus datos según lo descrito</li>
                <li>Elige voluntariamente utilizar la aplicación</li>
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
              He leído y entendido el documento de consentimiento informado y acepto los términos descritos anteriormente.
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
              ? "Desplázate para leer el documento completo"
              : !isChecked
              ? "Por favor, marque la casilla para continuar"
              : "Yo doy consentimiento — Seguir a registrarme →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InformedConsent;
