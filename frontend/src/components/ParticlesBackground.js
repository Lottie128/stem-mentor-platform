import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    // Create particles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty('--delay', `${Math.random() * 5}s`);
      particle.style.setProperty('--duration', `${4 + Math.random() * 3}s`);
      container.appendChild(particle);
    }
  }, []);

  return <div ref={particlesRef} className="particles-bg" />;
};

export default ParticlesBackground;