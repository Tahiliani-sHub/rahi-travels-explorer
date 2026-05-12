import { useEffect, useState, useRef } from 'react';

export function ExplodedView() {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        const currentScroll = -rect.top;
        
        let p = 0;
        if (currentScroll > 0) {
          p = Math.min(1, currentScroll / maxScroll);
        }
        setScrollY(p);
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const progress = scrollY; // 0 to 1

  // Center expanding image
  const centerScale = 1 + progress * 2.5;
  const centerOpacity = 1 - progress * 1.5;

  // Scattered images
  const p1 = Math.min(1, progress * 1.5); // animate slightly faster
  const item1X = -p1 * 35;
  const item1Y = -p1 * 25;
  
  const item2X = p1 * 35;
  const item2Y = -p1 * 20;

  const item3X = -p1 * 30;
  const item3Y = p1 * 30;

  const item4X = p1 * 30;
  const item4Y = p1 * 25;

  return (
    <div ref={containerRef} className="h-[250vh] relative bg-black text-white overflow-hidden">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black z-10" />
        
        {/* Title that appears as we scroll */}
        <div 
          className="relative z-20 text-center w-full max-w-4xl px-5 pointer-events-none"
          style={{ 
            opacity: progress * 2.5,
            transform: `translateY(${(1 - progress) * 50}px)`,
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
          }}
        >
          <span className="inline-block px-4 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs font-semibold mb-6 uppercase tracking-widest shadow-lg">
            Premium Curations
          </span>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] text-white">A world apart.</h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] font-light leading-relaxed">
            Discover the hidden gems of Tunisia, from the deep Sahara to the sparkling Mediterranean.
          </p>
        </div>

        {/* Center Image */}
        <div 
          className="absolute w-[300px] md:w-[400px] aspect-[3/4] bg-cover bg-center rounded-2xl md:rounded-3xl shadow-2xl z-10 will-change-transform border border-white/10"
          style={{ 
            backgroundImage: "url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80)",
            transform: `scale(${centerScale})`,
            opacity: Math.max(0, centerOpacity),
            transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
          }} 
        >
          <div className="absolute inset-0 bg-black/10 rounded-2xl md:rounded-3xl" />
        </div>

        {/* Exploded Item 1 */}
        <div 
          className="absolute w-[200px] md:w-[280px] aspect-[4/5] bg-cover bg-center rounded-2xl shadow-2xl z-10 will-change-transform border border-white/10"
          style={{ 
            backgroundImage: "url(https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80)",
            transform: `translate(${item1X}vw, ${item1Y}vh) rotate(${-progress * 15}deg) scale(${0.8 + progress * 0.2})`,
            opacity: progress > 0.02 ? 1 : 0,
            transition: 'transform 0.1s ease-out, opacity 0.3s ease-out'
          }} 
        />
        
        {/* Exploded Item 2 */}
        <div 
          className="absolute w-[220px] md:w-[300px] aspect-square bg-cover bg-center rounded-2xl shadow-2xl z-10 will-change-transform border border-white/10"
          style={{ 
            backgroundImage: "url(https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80)",
            transform: `translate(${item2X}vw, ${item2Y}vh) rotate(${progress * 10}deg) scale(${0.8 + progress * 0.2})`,
            opacity: progress > 0.02 ? 1 : 0,
            transition: 'transform 0.1s ease-out, opacity 0.3s ease-out'
          }} 
        />

        {/* Exploded Item 3 */}
        <div 
          className="absolute w-[180px] md:w-[240px] aspect-[3/4] bg-cover bg-center rounded-2xl shadow-2xl z-10 will-change-transform border border-white/10"
          style={{ 
            backgroundImage: "url(https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=600&q=80)",
            transform: `translate(${item3X}vw, ${item3Y}vh) rotate(${-progress * 20}deg) scale(${0.8 + progress * 0.2})`,
            opacity: progress > 0.02 ? 1 : 0,
            transition: 'transform 0.1s ease-out, opacity 0.3s ease-out'
          }} 
        />

        {/* Exploded Item 4 */}
        <div 
          className="absolute w-[240px] md:w-[320px] aspect-[16/9] bg-cover bg-center rounded-2xl shadow-2xl z-10 will-change-transform border border-white/10"
          style={{ 
            backgroundImage: "url(https://images.unsplash.com/photo-1574513816654-e910bd6dbce0?auto=format&fit=crop&w=600&q=80)",
            transform: `translate(${item4X}vw, ${item4Y}vh) rotate(${progress * 25}deg) scale(${0.8 + progress * 0.2})`,
            opacity: progress > 0.02 ? 1 : 0,
            transition: 'transform 0.1s ease-out, opacity 0.3s ease-out'
          }} 
        />
      </div>
    </div>
  );
}
