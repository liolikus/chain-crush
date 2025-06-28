import React, { useState, useEffect } from 'react';

const ScorePopup = ({ score, position, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete && onComplete();
      }, 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="score-popup"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      +{score}
    </div>
  );
};

export default ScorePopup;
