// Scroll Reveal Animation Utility
// Add this to any component that needs scroll-triggered animations

import { useEffect, useRef } from 'react';

export function useScrollReveal(options = {}) {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
        ...options
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, defaultOptions);

        // Observe all elements with 'reveal' class
        const elements = document.querySelectorAll('.reveal');
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
        };
    }, []);
}

// Usage in components:
// import { useScrollReveal } from './utils/scrollReveal';
//
// function MyComponent() {
//   useScrollReveal();
//
//   return (
//     <div className="reveal">
//       Content that will fade in on scroll
//     </div>
//   );
// }
