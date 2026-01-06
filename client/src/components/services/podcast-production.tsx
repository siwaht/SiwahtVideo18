import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Headphones, Volume2, Mic2, Radio, Play, Pause, Calendar, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PodcastSample {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  category: string;
  duration?: string;
  hostName?: string;
  guestName?: string;
  isPublished: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export default function PodcastProduction() {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const { data: podcastSamples, isLoading, error } = useQuery({
    queryKey: ["/api/samples/podcast-samples"],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: Mic2,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      title: "AI Host Generation",
      description: "Create engaging AI podcast hosts with unique personalities and natural conversation flow."
    },
    {
      icon: Volume2,
      iconColor: "text-secondary",
      bgColor: "bg-secondary/10",
      title: "Audio Enhancement",
      description: "Automatically remove background noise, balance levels, and optimize audio quality."
    },
    {
      icon: Headphones,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
      title: "Content Optimization",
      description: "AI analyzes and optimizes content structure for maximum listener engagement and retention."
    },
    {
      icon: Radio,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-100",
      title: "Multi-Format Export",
      description: "Export in all podcast formats with automatic metadata, show notes, and transcript generation."
    }
  ];

  const podcastTypes = [
    "Interview", "Educational", "News", "Storytelling", "Comedy", "Business"
  ];

  return (
    <section 
      id="podcast" 
      className="py-12 xs:py-16 md:py-20 lg:py-24 bg-white"
      aria-labelledby="podcast-heading"
    >
      <div className="max-w-7xl mx-auto px-4 xs:px-6 lg:px-8">
        <header className="text-center mb-12 xs:mb-16">
          <h2 
            id="podcast-heading"
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 xs:mb-6"
          >
            AI Podcast Production
          </h2>
          <p className="text-lg xs:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
            Create professional podcasts with AI hosts, automated editing, and intelligent content optimization. From concept to publishing.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-12 xl:gap-16 items-center">
          {/* Features */}
          <div className="space-y-6 xs:space-y-8 order-2 lg:order-1">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article 
                  key={index}
                  className="flex items-start space-x-3 xs:space-x-4 p-3 xs:p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className={`w-10 h-10 xs:w-12 xs:h-12 ${feature.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}>
                    <Icon className={`${feature.iconColor} h-5 w-5 xs:h-6 xs:w-6`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg xs:text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 text-sm xs:text-base leading-relaxed">{feature.description}</p>
                  </div>
                </article>
              );
            })}

            <div className="pt-4 xs:pt-6">
              <button 
                onClick={scrollToContact}
                className="w-full xs:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 transform hover:-translate-y-1 text-center"
                data-testid="podcast-cta"
                aria-label="Start podcast production"
              >
                Launch Your Podcast
              </button>
            </div>
          </div>

          {/* Podcast Samples */}
          <aside className="relative order-1 lg:order-2">
            <div className="bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl p-4 xs:p-6 md:p-8 shadow-2xl">
              <h4 className="font-semibold text-slate-900 mb-4 xs:mb-6 text-sm xs:text-base flex items-center gap-2">
                <Radio className="h-5 w-5 text-pink-600" />
                Our Podcast Samples
              </h4>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl p-4 xs:p-6 shadow-lg text-center">
                  <Radio className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">Unable to load podcast samples</p>
                  <Button 
                    onClick={scrollToContact}
                    className="mt-3"
                    size="sm"
                  >
                    Contact Us
                  </Button>
                </div>
              ) : podcastSamples && Array.isArray(podcastSamples) && podcastSamples.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {podcastSamples.slice(0, 3).map((sample: PodcastSample) => (
                    <Card key={sample.id} className="p-4 hover:shadow-md transition-shadow">
                      <CardHeader className="p-0 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">
                              {sample.title}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-2 mt-1">
                              {sample.description}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {sample.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-0">
                        <div className="space-y-2">
                          {(sample.hostName || sample.guestName) && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              {sample.hostName && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>Host: {sample.hostName}</span>
                                </div>
                              )}
                              {sample.hostName && sample.guestName && <span>•</span>}
                              {sample.guestName && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>Guest: {sample.guestName}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {sample.duration && (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Calendar className="h-3 w-3" />
                              <span>{sample.duration}</span>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <div className="bg-slate-50 p-2 rounded-lg">
                              {sample.audioUrl ? (
                                <div>
                                  {sample.audioUrl.includes('soundcloud.com') ? (
                                    <iframe
                                      width="100%"
                                      height="166"
                                      scrolling="no"
                                      frameBorder="no"
                                      allow="autoplay"
                                      src={`${sample.audioUrl.replace('soundcloud.com', 'w.soundcloud.com/player/?url=https://soundcloud.com')}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                                      className="rounded"
                                    />
                                  ) : sample.audioUrl.includes('spotify.com') ? (
                                    <iframe
                                      src={`https://open.spotify.com/embed/track/${sample.audioUrl.split('/').pop()?.split('?')[0]}?utm_source=generator&theme=0`}
                                      width="100%"
                                      height="152"
                                      frameBorder="0"
                                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                      loading="lazy"
                                      className="rounded"
                                    />
                                  ) : (
                                    <audio
                                      controls
                                      controlsList="nodownload"
                                      className="w-full"
                                      preload="metadata"
                                    >
                                      <source src={sample.audioUrl} type="audio/mpeg" />
                                      <source src={sample.audioUrl} type="audio/wav" />
                                      <source src={sample.audioUrl} type="audio/ogg" />
                                      Your browser does not support the audio element.
                                    </audio>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-slate-500">
                                  <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-xs">Audio preview coming soon</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {Array.isArray(podcastSamples) && podcastSamples.length > 3 && (
                    <div className="text-center pt-2">
                      <Button 
                        onClick={scrollToContact}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        View More Samples
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4 xs:p-6 shadow-lg text-center">
                  <Radio className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-3">No podcast samples available yet</p>
                  <Button 
                    onClick={scrollToContact}
                    size="sm"
                  >
                    Request Demo
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}