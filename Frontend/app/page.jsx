"use client"
import Hero from "@/components/hero";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import About from "@/components/about";
import Faq from "@/components/faq";
import Feature from "@/components/feature";
import Contact from "@/components/contact";
import { ChatBot } from "chatbot-widget";
import { useEffect } from "react";
import { loadUser } from "@/slices/userSlice";
import { useDispatch } from "react-redux";




export default function Home() {

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadUser())
  }, [])


  return (
    <main className="flex flex-col min-h-dvh bg-white">
      <NavBar />
      <section id="hero">
        <Hero />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="features">
        <Feature />
      </section>
      <section id="faq">
        <Faq />
      </section>
      <section id="contact">
        <Contact />
      </section>
      <Footer />

      {/* Quick Start AI Token "A1ED-7127544F-1EBAF3E7"  */}

      {/* Quantum Web Solutions "A1ED-F15D1246-2BF76968"  */}


      {/* Hot reload triggered */}
      <ChatBot token="A1ED-7127544F-1EBAF3E7"
        theme="secondary"
        wantToShowSuggestions={true}
      />
    </main>

  );
}
