import React from "react";
import { Header } from "./landing/Header";
import { Hero } from "./landing/Hero";
import { HowItWorks, Features, Segments, Testimonials, Faq, FinalCta, Footer } from "./landing/Sections";

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans antialiased">
      <Header onLogin={onLogin} onSignup={onSignup} />
      <Hero onSignup={onSignup} />
      <HowItWorks />
      <Features />
      <Segments />
      <Testimonials />
      <Faq />
      <FinalCta onSignup={onSignup} />
      <Footer />
    </div>
  );
}
