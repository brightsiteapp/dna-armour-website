document.documentElement.classList.add('js-ready');
const groups = [
  ...document.querySelectorAll('.science-card'),
  ...document.querySelectorAll('.shop-visual, .shop-copy > *'),
];
groups.forEach((node, index) => {
  node.classList.add('reveal');
  node.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * .08}s`);
});
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
groups.forEach((node) => observer.observe(node));
