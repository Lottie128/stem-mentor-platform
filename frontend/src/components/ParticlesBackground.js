import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const particlesRef = useRef(null);
  const particlesData = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const particleCount = 80;
    const connectionDistance = 150;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    container.appendChild(canvas);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particlesData.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
        color: ['#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 3)]
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesData.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections (neural network style)
        for (let j = i + 1; j < particlesData.current.length; j++) {
          const other = particlesData.current[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            
            // Gradient line
            const gradient = ctx.createLinearGradient(particle.x, particle.y, other.x, other.y);
            gradient.addColorStop(0, particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, other.color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Add pulsing effect to close connections
            if (distance < connectionDistance * 0.5) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = particle.color;
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.remove();
    };
  }, []);

  return <div ref={particlesRef} className="particles-bg" />;
};

export default ParticlesBackground;