export async function runConfettiBurst() {
  if (typeof window === 'undefined') {
    return;
  }

  const confetti = (await import('canvas-confetti')).default;

  confetti({
    particleCount: 90,
    spread: 80,
    origin: { x: 0.2, y: 0.7 },
  });

  confetti({
    particleCount: 90,
    spread: 80,
    origin: { x: 0.8, y: 0.7 },
  });
}