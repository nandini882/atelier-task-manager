import confetti from 'canvas-confetti';

export const triggerConfetti = (origin?: { x: number; y: number }) => {
  // Delicate artistic burst matching Guillaume Zhu's palette
  const count = 40;
  const defaults = {
    origin: origin || { y: 0.7, x: 0.5 },
    colors: ['#E26D5C', '#F4A261', '#F5E7DF', '#81B29A', '#2B2D42'],
    ticks: 180,
    gravity: 1.1,
    decay: 0.94,
    startVelocity: 25,
    shapes: ['circle', 'square'] as ('circle' | 'square')[],
  };

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.6),
    spread: 55,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.4),
    spread: 90,
    scalar: 0.8,
  });
};
