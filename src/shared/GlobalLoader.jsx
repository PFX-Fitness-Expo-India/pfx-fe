import React from 'react';

const GlobalLoader = ({ fullScreen = true }) => {
  return (
    <div className={`global-loader-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loader-content">
        <div className="pfx-logo-pulse">
          <span className="pfx-letter p">P</span>
          <span className="pfx-letter f">F</span>
          <span className="pfx-letter x">X</span>
        </div>
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
        <p className="loader-text">Loading Excellence...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
