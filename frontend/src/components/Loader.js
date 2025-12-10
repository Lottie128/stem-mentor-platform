import React from 'react';
import AnimatedLogo from './AnimatedLogo';
import '../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <AnimatedLogo size={120} />
        <div className="loader-text">
          <span className="letter">S</span>
          <span className="letter">T</span>
          <span className="letter">E</span>
          <span className="letter">M</span>
          <span className="letter-space"></span>
          <span className="letter">M</span>
          <span className="letter">e</span>
          <span className="letter">n</span>
          <span className="letter">t</span>
          <span className="letter">o</span>
          <span className="letter">r</span>
        </div>
        <div className="loader-tagline">Building Tomorrow's Innovators Today</div>
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--delay': `${i * 0.2}s`,
            '--duration': `${3 + (i % 3)}s`,
            '--x': `${Math.random() * 100}vw`,
            '--y': `${Math.random() * 100}vh`
          }}></div>
        ))}
      </div>
    </div>
  );
};

export default Loader;