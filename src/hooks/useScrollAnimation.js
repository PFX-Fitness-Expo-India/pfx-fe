import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollAnimation — attaches an IntersectionObserver to animate sections
 * into view by adding the `in-view` CSS class when they enter the viewport.
 */
export function useScrollAnimation() {
  const location = useLocation();

  useEffect(() => {
    // Disable scroll animations on mobile for better performance and refresh reliability
    if (window.innerWidth <= 768) return;

    let observer;
    
    // Slight timeout allows React Router to mount the new elements before we query them
    const timeout = setTimeout(() => {
      observer = new IntersectionObserver(
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
    }, 50);

    return () => {
      clearTimeout(timeout);
      if (observer) observer.disconnect();
    };
  }, [location.pathname]);
}
