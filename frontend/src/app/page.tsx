import { ParticleHero } from "@/components/Hero";
import { ThinkersSection } from "@/components/ThinkersSection";
import { GraphSection } from "@/components/GraphSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <ParticleHero />
      <ThinkersSection />
      <GraphSection />
      {/* Other sections will go here */}
      <Footer />
    </main>
  );
}
