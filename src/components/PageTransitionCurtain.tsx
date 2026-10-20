import React from 'react';

interface PageTransitionCurtainProps {
  isTransitioning: boolean;
}

export const PageTransitionCurtain: React.FC<PageTransitionCurtainProps> = ({ isTransitioning }) => {
  if (!isTransitioning) return null;

  return (
    <div className="page-transition-curtain" aria-hidden="true">
      <div className="curtain-slice animate-sweep" />
    </div>
  );
};
