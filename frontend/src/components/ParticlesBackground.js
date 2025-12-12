import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    // Create 50 particles for better visibility
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.setProperty('--delay', `${Math.random() * 5}s`);
      particle.style.setProperty('--duration', `${4 + Math.random() * 4}s`);
      
      // Vary particle sizes
      const size = 4 + Math.random() * 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      container.appendChild(particle);
    }
  }, []);

  return <div ref={particlesRef} className="particles-bg" />;
};

export default ParticlesBackground;