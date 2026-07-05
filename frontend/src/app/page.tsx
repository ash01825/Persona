import { ParticleHero } from "@/components/Hero";
import { ThinkersSection } from "@/components/ThinkersSection";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#050505]">
      <ParticleHero />
      <ThinkersSection />
      <ArchitectureSection />
      
      {/* Blog CTA Banner */}
      <section className="w-full bg-[#0a0a0a] border-y border-white/5 py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Want to see how we built this?</h3>
            <p className="text-muted-foreground text-sm">Read our engineering deep-dive on pushing Cognee to its absolute limit.</p>
          </div>
          <Link href="/blog" className="shrink-0 bg-white/5 border border-white/10 hover:border-white/30 text-white px-6 py-3 rounded-full text-sm font-medium transition-all">
            Read Engineering Blog →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
