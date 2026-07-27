import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import { ChatBot } from 'quickstart-ai-chatbot-widget';

export default function App() {
  // Use VITE_API_URL if provided, or default to deployed Vercel backend URL
  const backendApiUrl = import.meta.env.VITE_API_URL || "https://quick-start-ai-backend.vercel.app/api/v1";

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white relative">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />

      {/* QuickStart AI Chatbot Floating Widget configured with NexusCloud API Token */}
      <ChatBot
        token="A1ED-D0E3A288-6448AA95"
        apiUrl={backendApiUrl}
        theme="primary"
        wantToShowSuggestions={true}
      />
    </div>
  );
}
