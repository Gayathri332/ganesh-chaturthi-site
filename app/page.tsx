import SocialCards, { type CardItem } from "@/components/ui/card-fan-carousel";
import AskGanapati from "@/components/AskGanapati";

const GALLERY_CARDS: CardItem[] = [
  { imgUrl: "/images/ganesha/ganesha-vakratunda.jpg", alt: "Vakratunda — Ganesha riding a lion" },
  { imgUrl: "/images/ganesha/ganesha-ekadanta.jpg", alt: "Ekadanta — Ganesha riding a mouse" },
  { imgUrl: "/images/ganesha/ganesha-mahodara.jpg", alt: "Mahodara — Ganesha riding a mouse" },
  { imgUrl: "/images/ganesha/ganesha-gajanana.jpg", alt: "Gajanana — Ganesha riding a mouse" },
  { imgUrl: "/images/ganesha/ganesha-lambodara.jpg", alt: "Lambodara — Ganesha riding a mouse" },
  { imgUrl: "/images/ganesha/ganesha-vikata.jpg", alt: "Vikata — Ganesha riding a peacock" },
  { imgUrl: "/images/ganesha/ganesha-vighnaraja.jpg", alt: "Vighnaraja — Ganesha seated on the serpent Shesha" },
  { imgUrl: "/images/ganesha/ganesha-dhumravarna.jpg", alt: "Dhumravarna — Ganesha wreathed in smoke" },
];

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-8 md:pt-28 min-h-[92vh] md:min-h-screen overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/video/ganpati-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* Darken + tint the video so the maroon/gold palette and text stay readable */}
        <div className="absolute inset-0 z-[1] bg-maroon-950/60" aria-hidden="true" />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-maroon-950/20 via-maroon-950/55 to-maroon-950 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-gold-400/80 text-sm md:text-base font-body tracking-wide mb-4">
            Ganesh Chaturthi
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-cream-100 leading-[1.05]">
            Ganpati Bappa
            <br />
            <span className="italic text-gold-400">Morya</span>
          </h1>

          <svg
            className="mt-6 w-40 md:w-56"
            viewBox="0 0 220 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 14C40 2 70 22 110 12C150 2 180 22 218 10"
              stroke="#D4A64A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="110" cy="12" r="3.5" fill="#C1442E" />
          </svg>

          <p className="mt-6 max-w-md text-cream-200/75 text-base md:text-lg leading-relaxed">
            May the remover of obstacles bring you wisdom, good fortune, and a
            fresh start this festival season.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative">
        <p className="text-center font-display italic text-xl md:text-2xl text-gold-400/90 mb-1">
          The Eight Avatars of Ganesha
        </p>
        <p className="text-center text-cream-200/60 text-sm mb-2">
          Hover or use the arrows to browse
        </p>
        <SocialCards cards={GALLERY_CARDS} />
      </section>

      {/* Ask widget */}
      <AskGanapati />

      <footer className="text-center text-cream-200/40 text-xs pb-10 px-6">
        Made with devotion for Ganesh Chaturthi.
      </footer>
    </main>
  );
}
