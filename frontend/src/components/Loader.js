import React from 'react';
import AnimatedLogo from './AnimatedLogo';
import '../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="loader-content">
        <AnimatedLogo size={120} />
        <div className="loader-text">
          <span className="letter" style={{ '--i': 0 }}>S</span>
          <span className="letter" style={{ '--i': 1 }}>T</span>
          <span className="letter" style={{ '--i': 2 }}>E</span>
          <span className="letter" style={{ '--i': 3 }}>M</span>
          <span className="letter-space"></span>
          <span className="letter" style={{ '--i': 4 }}>M</span>
          <span className="letter" style={{ '--i': 5 }}>e</span>
          <span className="letter" style={{ '--i': 6 }}>n</span>
          <span className="letter" style={{ '--i': 7 }}>t</span>
          <span className="letter" style={{ '--i': 8 }}>o</span>
          <span className="letter" style={{ '--i': 9 }}>r</span>
        </div>
        <div className="loader-tagline">Building Tomorrow's Innovators Today</div>
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;