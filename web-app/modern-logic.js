
/* Appended Modern Logic */
function initModernLanding() {
  // Particles Generator
  const particles = document.querySelector('.particles');
  if (particles && particles.childElementCount === 0) {
     for (let i = 0; i < 15; i++) {
        const span = document.createElement('span');
        const size = Math.random() * 15 + 4;
        span.style.setProperty('--i', Math.random() * 20);
        span.style.setProperty('--size', size + 'px');
        span.style.setProperty('--delay', Math.random() * -20 + 's');
        span.style.left = Math.random() * 100 + '%';
        particles.appendChild(span);
     }
  }

  // Scroll Reveal Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // 3D Tilt Effect
  document.querySelectorAll('.glass-card').forEach(card => {
    card.onmousemove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };
    card.onmouseleave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };
  });
}
