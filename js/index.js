// Subtle parallax on the background as the user scrolls
(() => {
  const bg = document.querySelector('.bg');
  if (!bg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const ratio = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        bg.style.transform = `scale(1.06) translateY(${ratio * -4}%)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
