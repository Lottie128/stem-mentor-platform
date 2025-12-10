import React from 'react';
import '../styles/AnimatedLogo.css';

const AnimatedLogo = ({ size = 80 }) => {
  return (
    <div className="animated-logo" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* S Letter */}
        <path 
          className="logo-path logo-s"
          d="M 35 25 Q 20 25 20 35 Q 20 45 35 45 L 55 45 Q 70 45 70 55 Q 70 65 55 65 L 25 65"
          stroke="#1d1d1f"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* T Letter */}
        <path 
          className="logo-path logo-t"
          d="M 50 30 L 80 30 M 65 30 L 65 70"
          stroke="#1d1d1f"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Orbiting dots */}
        <circle className="orbit-dot dot-1" cx="50" cy="50" r="3" fill="#1d1d1f" />
        <circle className="orbit-dot dot-2" cx="50" cy="50" r="3" fill="#1d1d1f" />
        <circle className="orbit-dot dot-3" cx="50" cy="50" r="3" fill="#1d1d1f" />
      </svg>
    </div>
  );
};

export default AnimatedLogo;