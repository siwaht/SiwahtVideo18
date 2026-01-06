import { useQuery } from "@tanstack/react-query";
import { User, Sparkles, Settings, Download, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Avatar } from "@shared/schema";

export default function Avatars() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch avatars from API
  const { data: avatars = [], isLoading, error } = useQuery<Avatar[]>({
    queryKey: ['/api/samples/avatars'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Get the first published avatar for preview, sorted by order index
  const publishedAvatars = avatars
    .filter(avatar => avatar.isPublished)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const featuredAvatar = publishedAvatars[0];


  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Auto-play for avatar video when it comes into view
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !featuredAvatar?.videoUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused) {
            video.play().catch((error) => {
              console.log('Auto-play prevented:', error);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [featuredAvatar?.videoUrl]);

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: User,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "Photorealistic Generation",
      description: "We create incredibly lifelike avatars using advanced AI that captures authentic human expressions and characteristics."
    },
    {
      icon: Sparkles,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "Custom Personalities",
      description: "Our team designs unique character traits, emotions, and speaking styles that perfectly match your brand or vision."
    },
    {
      icon: Settings,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
      title: "Advanced Customization",
      description: "We fine-tune every detail from facial features to clothing, ensuring your avatar meets your exact specifications."
    },
    {
      icon: Download,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      title: "Multiple Formats",
      description: "We deliver your avatars in various formats optimized for your specific platforms and applications."
    }
  ];

  return (
    <section
      id="avatars"
      className="section-padding bg-gradient-to-br from-sky-50/50 via-white to-blue-50/30"
      aria-labelledby="avatars-heading"
    >
      <div className="container-custom">
        <header className="text-center mb-16 sm:mb-20">
          <h2 
            id="avatars-heading"
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-6 sm:mb-8 text-shadow"
          >
            <span className="gradient-text">Realistic Avatars</span>
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-slate-600 max-w-5xl mx-auto leading-relaxed">
            Create photorealistic digital humans with AI-powered avatar generation. Perfect for any virtual environment.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Features */}
          <div className="space-y-8 sm:space-y-10 order-2 lg:order-1">
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
                data-testid="avatars-cta"
                aria-label="Start creating realistic avatars"
              >
                Order Custom Avatars
              </button>
            </div>
          </div>

          {/* Avatar Preview */}
          <aside className="relative order-1 lg:order-2 hover-lift">
            <div className="service-preview from-sky-100 via-blue-100 to-cyan-100 bg-gradient-to-br shadow-2xl">
              <div className="glass-card p-6 xs:p-8 mb-6 xs:mb-8 border-2 border-white/20">
                <h4 className="font-bold text-slate-900 mb-4 xs:mb-6 text-lg xs:text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Avatar Studio</h4>

{featuredAvatar ? (
                  <div className="video-container aspect-square bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl mx-auto max-w-md">
                    {/* Embed YouTube video if available */}
                    {featuredAvatar.videoUrl && featuredAvatar.videoUrl.includes('youtu') ? (
                      <iframe
                        src={featuredAvatar.videoUrl
                          .replace('youtu.be/', 'youtube.com/embed/')
                          .replace('youtube.com/watch?v=', 'youtube.com/embed/')
                        }
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={featuredAvatar.name}
                      />
                    ) : featuredAvatar.videoUrl ? (
                      <div className="video-player-wrapper relative">
                        <video 
                          ref={videoRef}
                          src={featuredAvatar.videoUrl} 
                          poster={featuredAvatar.thumbnailUrl || undefined}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted={isMuted}
                          loop
                          playsInline
                          onError={(e) => {
                          }}
                        />
                        
                        {/* Mute Button for Avatar video */}
                        <div className="absolute top-3 right-3 opacity-80 hover:opacity-100 transition-opacity z-10">
                          <Button
                            onClick={toggleMute}
                            size="sm"
                            variant="ghost"
                            className="rounded-full w-10 h-10 bg-black/40 hover:bg-black/60 text-white border-0 p-0"
                            data-testid="avatar-mute-button"
                          >
                            {isMuted ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : featuredAvatar.thumbnailUrl ? (
                      <img 
                        src={featuredAvatar.thumbnailUrl} 
                        alt={featuredAvatar.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    )}
                    
                    {/* Only show overlay if not a YouTube video */}
                    {!(featuredAvatar.videoUrl && featuredAvatar.videoUrl.includes('youtu')) && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Avatar Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/80 to-transparent">
                          <h5 className="font-semibold text-lg leading-tight">{featuredAvatar.name}</h5>
                          {featuredAvatar.description && (
                            <p className="text-sm opacity-90 mt-1 line-clamp-2 leading-tight">{featuredAvatar.description}</p>
                          )}
                          {featuredAvatar.videoUrl && !featuredAvatar.videoUrl.includes('youtu') && (
                            <p className="text-xs opacity-75 mt-1">🎬 Video Demo</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl aspect-square relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    
                    {/* Avatar Preview */}
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <div className="w-32 h-32 xs:w-40 xs:h-40 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl floating-animation">
                        <User className="h-16 w-16 xs:h-20 xs:w-20 text-white" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-center">
                        <p className="text-slate-600 text-sm">Professional avatar showcases will appear here</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center floating-animation" style={{animationDelay: '1s'}}>
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center floating-animation" style={{animationDelay: '2s'}}>
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-3 gap-3 xs:gap-4">
                <div className="glass-card p-3 xs:p-4 text-center hover-lift">
                  <div className="text-xs xs:text-sm font-medium text-slate-600 mb-1">Quality</div>
                  <div className="text-sm xs:text-base font-bold text-blue-600">4K</div>
                </div>
                <div className="glass-card p-3 xs:p-4 text-center hover-lift">
                  <div className="text-xs xs:text-sm font-medium text-slate-600 mb-1">Expressions</div>
                  <div className="text-sm xs:text-base font-bold text-cyan-600">50+</div>
                </div>
                <div className="glass-card p-3 xs:p-4 text-center hover-lift">
                  <div className="text-xs xs:text-sm font-medium text-slate-600 mb-1">Styles</div>
                  <div className="text-sm xs:text-base font-bold text-emerald-600">500+</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}