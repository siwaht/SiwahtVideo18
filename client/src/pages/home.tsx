import { useEffect } from "react";
import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import VideoAds from "@/components/services/video-ads";
import Avatars from "@/components/services/avatars";
import VoiceSynthesis from "@/components/services/voice-synthesis";
import VideoEditing from "@/components/services/video-editing";
import PodcastProduction from "@/components/services/podcast-production";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  useEffect(() => {
    // Set page metadata for SEO
    document.title = "Siwaht - AI Video Ads, Avatars, Voice & Podcast Production | Professional AI Agency";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional AI agency creating custom video ads, realistic avatars, voice ads in 80+ languages, video editing & podcast production. Fast turnaround, 4K quality. Transform your content with AI.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Professional AI agency creating custom video ads, realistic avatars, voice ads in 80+ languages, video editing & podcast production. Fast turnaround, 4K quality. Transform your content with AI.';
      document.head.appendChild(meta);
    }

    // Add keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      const keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      keywordsMeta.content = 'AI video ads, AI avatars, AI voice synthesis, AI podcast production, video editing AI, multilingual voice ads, custom video creation, professional AI services, Siwaht';
      document.head.appendChild(keywordsMeta);
    }

    // Add Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'Siwaht - Professional AI Video & Audio Creation Agency' },
      { property: 'og:description', content: 'We specialize in creating custom AI video ads, realistic avatars, and premium audio content for businesses and brands.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href }
    ];

    ogTags.forEach(tag => {
      let existingTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', tag.content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      }
    });

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://siwaht.com';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navigation />
      
      <main role="main">
        <Hero />
        
        <section id="services" className="w-full" aria-label="Our AI-powered services">
          <VideoAds />
          <Avatars />
          <VoiceSynthesis />
          <VideoEditing />
          <PodcastProduction />
        </section>

        
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
}
