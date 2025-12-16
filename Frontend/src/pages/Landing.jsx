// src/pages/Landing.jsx
import { React, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '../components/AuroraBackground';
import Footer from '../components/Footer';
export default function Landing() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const mainSectionRef = useRef(null);
  const headline = " Together for cleaner neighbourhoods.";

    // typing effect (small, fast)
    useEffect(() => {
    let i = 0;
    let cancelled = false;

    setTypedText(""); // always start empty

    function typeNext() {
      if (cancelled) return;

      if (i < headline.length) {
        setTypedText(prev => prev + headline.charAt(i));
        i++;
        setTimeout(typeNext, 35); // smooth speed
      }
    }

    typeNext();

    return () => {
      cancelled = true;
    };
  }, []);

  const featurecards = [
    {
      title: 'Report Issues',
      details: 'Easily report civic problems with photos and location details.',
      image: '/landingfeature1.png',
      bgClass: 'bg-rose-100',
    },
    {
      title: 'Track Progress',
      details: ' Monitor status of reported issues and see updates in real time.',
      image: '/landingfeature2.png',
      bgClass: 'bg-green-100',
    },
    {
      title: 'Community Impact',
      details: 'Vote and comment on issues to help prioritise community needs.',
      image: '/landingfeature3.png',
      bgClass: 'bg-cyan-100',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO - full viewport */}
      <header className="relative h-screen w-full overflow-hidden">
        {/* background image */}
        <div
          className="absolute inset-0 bg-cover bg-center filter saturate-90"
          style={{ backgroundImage: "url('/street.jpg')" }}
          aria-hidden="true"
        />

        {/* dark + color overlay to dull the image and give contrast for text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />

        {/* subtle texture overlay from public/bg.jpg (low opacity) */}
        <div
          className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none"
          aria-hidden="true"
        />

        {/* content (glass card) */}
        <div className="relative z-10 max-w-6xl mx-auto h-full px-6 flex items-center justify-center">
          <div className="w-full ">
            <div className="bg-white/8 flex justify-center flex-col backdrop-blur-lg border border-white/20 rounded-2xl p-10 md:p-12 shadow-xl">
              <div className="flex flex-col justify-center items-center">
                <div className="flex gap-4 justify-center items-center">
                  <div className="aspect-square rounded-full bg-white/20 flex items-center justify-center  w-10 h-10 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 ">
                    {/* small logo from public */}
                    <img
                      src="/sweep.jpg"
                      alt="CleanStreet logo"
                      className=" object-cover rounded-full"
                    />
                  </div>
                  <div className="">
                    <h1 className="text-center text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold text-white leading-tight whitespace-nowrap">
                      Clean Street
                    </h1>
                  </div>
                </div>

                <div className="mt-3 w-full">
                  <p
                    className="text-center text-md sm:text-md md:text-xl lg:text-4xl
             font-semibold typing text-white/90
             min-h-[3.5em]"
                  >
                    {typedText}
                  </p>

                  <p className="mt-6 text-white/80 max-w-xl">
                    Report issues, track progress and create local impact — all in one place.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-cyan-500 to-sky-600 hover:opacity-95 text-white rounded-full font-semibold shadow-lg transition"
                >
                  Get Started
                </button>

                <button
                  onClick={() => {
                    mainSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full border border-white/10 hover:bg-white/20 transition"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS — appears after you scroll */}
      <main ref={mainSectionRef} className="relative w-full overflow-hidden bg-slate-50 py-16">
        <AuroraBackground className="h-fit"></AuroraBackground>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <section className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              HOW CLEANSTREET WORKS
            </h2>
            <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
              Report issues around you and see updates as authorities take action — all through
              CleanStreet.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featurecards.map((card, index) => (
              <article
                key={index}
                className={`p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col h-full backdrop-blur-sm ${card.bgClass}`}
              >
                <div className="flex flex-col h-full gap-4">
                  <div>
                    <h3 className="font-semibold text-xl">{card.title}</h3>
                  </div>
                  <div className="mt-auto">
                    <p className="text-lg text-slate-800">{card.details}</p>
                  </div>
                  <div className="w-full h-64 flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}
