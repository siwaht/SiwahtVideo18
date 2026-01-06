/**
 * Utility to automatically pause all media elements (video and audio) when they scroll out of view
 * This provides a global solution for auto-pause functionality across the entire application
 */

let globalObserver: IntersectionObserver | null = null;
const observedElements = new Set<HTMLMediaElement>();

interface MediaState {
  wasPlaying: boolean;
  shouldAutoResume: boolean;
}

const mediaStates = new WeakMap<HTMLMediaElement, MediaState>();

export function initializeAutoPauseMedia() {
  if (globalObserver) return; // Already initialized

  globalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const media = entry.target as HTMLMediaElement;
        const isVisible = entry.isIntersecting;
        
        if (!media || !(media instanceof HTMLVideoElement || media instanceof HTMLAudioElement)) {
          return;
        }

        const state = mediaStates.get(media) || { wasPlaying: false, shouldAutoResume: false };

        if (isVisible) {
          // Media is visible
          if (state.shouldAutoResume && media.paused) {
            media.play().catch((error) => {
              console.log('Auto-resume failed:', error);
            });
            state.shouldAutoResume = false;
          }
        } else {
          // Media is not visible
          if (!media.paused) {
            state.wasPlaying = true;
            state.shouldAutoResume = true;
            media.pause();
            console.log('Auto-paused media:', media.src || media.currentSrc);
          }
        }

        mediaStates.set(media, state);
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  // Observe all existing media elements
  startObservingAllMedia();

  // Set up mutation observer to catch dynamically added media
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          // Check if the added node is a media element
          if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
            observeMediaElement(element as HTMLMediaElement);
          }
          // Also check for media elements within the added node
          const mediaElements = element.querySelectorAll('video, audio');
          mediaElements.forEach((media) => {
            observeMediaElement(media as HTMLMediaElement);
          });
        }
      });
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function startObservingAllMedia() {
  const allMedia = document.querySelectorAll('video, audio');
  allMedia.forEach((media) => {
    observeMediaElement(media as HTMLMediaElement);
  });
}

function observeMediaElement(media: HTMLMediaElement) {
  if (observedElements.has(media) || !globalObserver) return;
  
  observedElements.add(media);
  globalObserver.observe(media);
  
  // Initialize state
  mediaStates.set(media, { wasPlaying: false, shouldAutoResume: false });
}

export function cleanupAutoPauseMedia() {
  if (globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }
  observedElements.clear();
}