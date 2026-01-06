import { useQuery } from "@tanstack/react-query";
import { Mic, Languages, Volume2, Download } from "lucide-react";
import type { VoiceSample } from "@shared/schema";

export default function VoiceSynthesis() {
  // Fetch voice samples from API
  const { data: voiceSamples = [], isLoading, error } = useQuery<VoiceSample[]>({
    queryKey: ['/api/samples/voice-samples'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Get the first published voice sample for preview, sorted by order index
  const publishedVoices = voiceSamples
    .filter(voice => voice.isPublished)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const featuredVoice = publishedVoices[0];


  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: Mic,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "Natural AI Voices",
      description: "Generate incredibly realistic speech that's indistinguishable from human voice recordings."
    },
    {
      icon: Languages,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
      title: "Multi-Language Support",
      description: "Create voice content in over 50 languages with native pronunciation and cultural nuances."
    },
    {
      icon: Volume2,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "Voice Customization",
      description: "Fine-tune pitch, speed, tone, and emotion to match your exact requirements."
    },
    {
      icon: Download,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      title: "Professional Output",
      description: "Export high-quality audio files ready for podcasts, videos, and commercial use."
    }
  ];

  return (
    <section 
      id="voice-synthesis" 
      className="section-padding bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/40"
      aria-labelledby="voice-synthesis-heading"
    >
      <div className="container-custom">
        <header className="text-center mb-16 sm:mb-20">
          <h2 
            id="voice-synthesis-heading"
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-6 sm:mb-8 text-shadow"
          >
            <span className="gradient-text">Your Brand's Voice, Understood Everywhere</span>
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-slate-600 max-w-5xl mx-auto leading-relaxed">
            Don't let language be a barrier to your growth. We craft compelling, professionally translated voice ads that resonate with customers worldwide.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Voice Samples Portfolio */}
          <aside className="relative order-1 lg:order-1">
            <div className="service-preview from-emerald-100 via-teal-100 to-cyan-100">
              <div className="glass-card p-6 xs:p-8 mb-6 xs:mb-8">
                <h4 className="font-bold text-slate-900 mb-4 xs:mb-6 text-lg xs:text-xl">Professional Multilingual Voice Ads</h4>


                {publishedVoices && publishedVoices.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-80 lg:max-h-96 overflow-y-auto scrollbar-thin voice-portfolio-container">
                    {publishedVoices.map((voice, index) => (
                      <div key={voice.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 sm:p-4 border border-emerald-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900 text-sm">{voice.name}</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                {voice.language}
                              </span>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                                {voice.gender}
                              </span>
                              {voice.accent && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {voice.accent}
                                </span>
                              )}
                              {voice.ageRange && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  {voice.ageRange}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center ml-3">
                            <Volume2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        
                        {voice.description && (
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">{voice.description}</p>
                        )}
                        
                        {voice.audioUrl && (
                          <div className="mt-3">
                            <div className="bg-slate-50 p-2 rounded-lg">
                              <audio 
                                controls 
                                controlsList="nodownload"
                                className="w-full"
                                preload="metadata"
                                style={{ height: '40px' }}
                              >
                                <source src={voice.audioUrl} type="audio/mpeg" />
                                <source src={voice.audioUrl} type="audio/aac" />
                                <source src={voice.audioUrl} type="audio/wav" />
                                <source src={voice.audioUrl} type="audio/mp4" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-xl aspect-video relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-teal-600/30"></div>
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 mx-auto shadow-2xl floating-animation">
                          <Volume2 className="h-10 w-10 xs:h-12 xs:w-12 text-white" />
                        </div>
                        <p className="text-sm xs:text-base opacity-90 font-semibold">AI Voice Portfolio</p>
                        <p className="text-xs opacity-70 mt-2">Professional voice synthesis showcases will appear here</p>
                      </div>
                    </div>
                    
                    {/* Audio Waveform */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="bg-emerald-400 rounded-full animate-pulse"
                            style={{
                              width: '3px',
                              height: `${Math.random() * 20 + 10}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3 xs:gap-4">
                <div className="glass-card p-3 xs:p-4 text-center hover-lift">
                  <div className="text-xs xs:text-sm font-medium text-slate-600 mb-1">Languages</div>
                  <div className="text-sm xs:text-base font-bold text-emerald-600">80+</div>
                </div>
                <div className="glass-card p-3 xs:p-4 text-center hover-lift">
                  <div className="text-xs xs:text-sm font-medium text-slate-600 mb-1">Voices</div>
                  <div className="text-sm xs:text-base font-bold text-teal-600">
                    1000+
                  </div>
                </div>
                <div className="glass-card p-3 xs:p-4 text-center hover-lift">
                  <div className="text-xs xs:text-sm font-medium text-slate-600 mb-1">Quality</div>
                  <div className="text-sm xs:text-base font-bold text-blue-600">Studio</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Features */}
          <div className="space-y-8 xs:space-y-10 order-2 lg:order-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article 
                  key={index}
                  className="feature-card hover-lift"
                >
                  <div className="flex items-start space-x-4 xs:space-x-6">
                    <div className={`feature-icon ${feature.bgColor} icon-gradient`}>
                      <Icon className={`${feature.iconColor} h-6 w-6 xs:h-7 xs:w-7`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl xs:text-2xl font-bold text-slate-900 mb-3 text-shadow">{feature.title}</h3>
                      <p className="text-slate-600 text-base xs:text-lg leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="pt-6 xs:pt-8">
              <button 
                onClick={scrollToContact}
                className="btn-secondary w-full xs:w-auto text-lg xs:text-xl px-10 py-5"
                data-testid="voice-synthesis-cta"
                aria-label="Start creating voice ads"
              >
                Order Voice Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}