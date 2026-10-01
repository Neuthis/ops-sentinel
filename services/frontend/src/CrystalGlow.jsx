import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export default function CrystalGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Manejo de movimiento del mouse (desktop)
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setActive(true);
    };

    // Manejo de toques táctiles (móviles / tablets)
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        setPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setActive(true);
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        setPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setActive(true);
      }
    };

    const handleMouseLeave = () => setActive(false);
    const handleTouchEnd = () => setActive(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0, // Ubicado detrás de las tarjetas y el contenido
        overflow: 'hidden',
      }}
    >
      {/* Luz central Chrome Violet + Glass Blue detrás del cristal */}
      <Box
        sx={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          top: 0,
          left: 0,
          transform: `translate3d(${pos.x - 260}px, ${pos.y - 260}px, 0)`,
          background: `radial-gradient(circle, 
            rgba(95, 44, 255, 0.45) 0%, 
            rgba(223, 246, 255, 0.22) 35%, 
            rgba(95, 44, 255, 0.08) 60%, 
            transparent 75%
          )`,
          filter: 'blur(55px)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.4s ease-out, transform 0.08s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform, opacity',
        }}
      />
    </Box>
  );
}