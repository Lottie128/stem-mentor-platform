import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    // Create 60 electric particles
    for (let i = 0; i < 60; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty('--delay', `${Math.random() * 5}s`);
      particle.style.setProperty('--duration', `${5 + Math.random() * 5}s`);
      
      // Vary particle sizes for depth effect
      const size = 8 + Math.random() * 12;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      container.appendChild(particle);
    }

    // Add electric connection lines occasionally
    const createConnection = () => {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = `${Math.random() * 100}%`;
      line.style.top = `${Math.random() * 100}%`;
      line.style.width = `${50 + Math.random() * 150}px`;
      line.style.height = '2px';
      line.style.background = 'linear-gradient(90deg, transparent, #8b5cf6, transparent)';
      line.style.opacity = '0';
      line.style.transform = `rotate(${Math.random() * 360}deg)`;
      line.style.boxShadow = '0 0 10px #8b5cf6';
      line.style.animation = 'flash 0.5s ease-out';
      
      container.appendChild(line);
      
      setTimeout(() => {
        line.remove();
      }, 500);
    };

    // Create random electric flashes
    const flashInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        createConnection();
      }
    }, 1000);

    // Add flash animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flash {
        0%, 100% { opacity: 0; }
        50% { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      clearInterval(flashInterval);
      style.remove();
    };
  }, []);

  return <div ref={particlesRef} className="particles-bg" />;
};

export default ParticlesBackground;