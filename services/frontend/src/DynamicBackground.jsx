import React from 'react';
import { Box } from '@mui/material';

export default function DynamicBackground() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#070913',
      }}
    >
      {/* Orbe 1: Chrome Violet principal superior */}
      <Box
        sx={{
          position: 'absolute',
          width: '55vw',
          height: '55vw',
          minWidth: 420,
          minHeight: 420,
          borderRadius: '50%',
          top: '-15%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(95, 44, 255, 0.42) 0%, rgba(95, 44, 255, 0.08) 60%, transparent 80%)',
          filter: 'blur(75px)',
          animation: 'driftPrimary 18s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Orbe 2: Glass Blue inferior derecho */}
      <Box
        sx={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          minWidth: 380,
          minHeight: 380,
          borderRadius: '50%',
          bottom: '-15%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(223, 246, 255, 0.28) 0%, rgba(95, 44, 255, 0.12) 50%, transparent 75%)',
          filter: 'blur(80px)',
          animation: 'driftSecondary 22s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Orbe 3: Pulso central de compensación */}
      <Box
        sx={{
          position: 'absolute',
          width: '40vw',
          height: '40vw',
          minWidth: 320,
          minHeight: 320,
          borderRadius: '50%',
          top: '30%',
          left: '35%',
          background: 'radial-gradient(circle, rgba(95, 44, 255, 0.22) 0%, rgba(223, 246, 255, 0.1) 45%, transparent 70%)',
          filter: 'blur(65px)',
          animation: 'pulseCore 14s ease-in-out infinite alternate',
          willChange: 'transform, opacity',
        }}
      />
    </Box>
  );
}