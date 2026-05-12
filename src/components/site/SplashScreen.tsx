import { useEffect, useState } from 'react';

type Phase = 'enter' | 'hold' | 'exit';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 80);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(onDone, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'linear-gradient(145deg, #0f2d00 0%, #1a4a00 40%, #2b7600 100%)',
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(43,118,0,0.4) 0%, transparent 70%)' }}
      />

      {/* Logo block */}
      <div
        className={`relative flex flex-col items-center gap-5 transition-all duration-700 ${phase === 'enter' ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}
      >
        {/* R mark */}
        <div
          className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <span className="text-white font-black" style={{ fontSize: '3rem', lineHeight: 1 }}>R</span>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <div className="text-white font-bold tracking-tight" style={{ fontSize: '2rem' }}>
            Rahi Travels
          </div>
          <div
            className="mt-2 text-xs font-medium tracking-[0.22em] uppercase"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            A Product of Rahi Group
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className={`absolute bottom-16 transition-opacity duration-300 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: '120px' }}
      >
        <div
          style={{
            height: '2px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: '99px',
              animation: phase !== 'enter' ? 'splashBar 2s ease-in-out forwards' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
