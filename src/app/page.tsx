import ImageUploader from "@/components/upload/ImageUploader";
import { Layers, Zap, Shield, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "3 Formatos",
    description: "Square, Story y Landscape optimizados",
  },
  {
    icon: Zap,
    title: "Procesamiento Rápido",
    description: "IA y Sharp para resultados instantáneos",
  },
  {
    icon: Shield,
    title: "Seguro",
    description: "Tus imágenes se procesan localmente",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <header className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Fase 1: MVP Activo
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent">
            AURA
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Transforma tus imágenes en múltiples formatos optimizados para redes sociales
          </p>
        </header>

        <section className="mb-16">
          <ImageUploader />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-surface/50 border border-border rounded-2xl hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-500">{feature.description}</p>
            </div>
          ))}
        </section>

        <footer className="mt-20 text-center border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-zinc-500">
            <p>AURA © 2026</p>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-2">
              <span>Roadmap:</span>
              <span className="text-primary">Fase 1</span>
              <ArrowRight className="w-4 h-4" />
              <span className="text-zinc-600">Fase 2 (Próximamente)</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
