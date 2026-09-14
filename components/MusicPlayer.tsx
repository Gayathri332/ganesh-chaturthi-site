"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Site-wide background bhajan. Browsers block audio with sound from
 * autoplaying until the visitor has interacted with the page at least
 * once — so this tries to start playing immediately, and if that's
 * blocked, it quietly starts on the very first click/tap/keypress
 * anywhere on the page instead. The floating button always lets the
 * visitor mute or unmute by hand.
 */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.45;

    const tryPlay = () => {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          // Autoplay blocked — wait for the first user interaction.
          const startOnInteraction = () => {
            audio
              .play()
              .then(() => setPlaying(true))
              .catch(() => {});
          };
          const events: (keyof DocumentEventMap)[] = ["click", "touchstart", "keydown"];
          events.forEach((evt) =>
            document.addEventListener(evt, startOnInteraction, { once: true })
          );
          return () => {
            events.forEach((evt) =>
              document.removeEventListener(evt, startOnInteraction)
            );
          };
        });
    };

    tryPlay();
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/ganpati-bhajan.mp3" loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "Mute background music" : "Play background music"}
        aria-pressed={playing}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-maroon-800/90 border border-gold-500/40 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center text-gold-300 hover:border-gold-400 hover:text-gold-200 transition-colors"
      >
        {playing ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        )}
      </button>
    </>
  );
}
