import { useEffect } from 'react';

/**
 * useScrollAnimation — attaches an IntersectionObserver to animate sections
 * into view by adding the `in-view` CSS class when they enter the viewport.
 */
export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const targets = document.querySelectorAll('.section, .sport-card, .ticket-card, .stat-card, .sponsor-card');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
