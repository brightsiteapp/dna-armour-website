import { createBottleViewer } from './bottle.js';

const story = document.querySelector('.story');
const stage = document.querySelector('.product-stage');
const view = document.querySelector('.product-view');
const steps = [...document.querySelectorAll('[data-step]')];
const controls = [...document.querySelectorAll('[data-view]')];
const header = document.querySelector('[data-header]');
const caption = document.querySelector('.view-caption');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const captions = ['01 — The daily formula', '02 — Every ingredient', '03 — A closer look'];
const reel = document.querySelector('.ingredient-reel');
const ingredientRows = [...reel.children];
const ingredientCount = document.querySelector('[data-ingredient-count]');
const formulaShowcase = document.querySelector('.formula-showcase');
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
let viewer;
let progress = 0;
let raf;
let lastScrollY = scrollY;
let rowHeight = 60;
let storyAbsTop = 0;
let storyOffsetHeight = 1;
let storyScrollRange = 1;
let formulaAbsTop = 0;
let formulaAbsHeight = 0;
function cachePositions() {
  storyAbsTop = story.getBoundingClientRect().top + scrollY;
  storyOffsetHeight = story.offsetHeight;
  storyScrollRange = storyOffsetHeight - stage.offsetHeight;
  if (formulaShowcase) {
    formulaAbsTop = formulaShowcase.getBoundingClientRect().top + scrollY;
    formulaAbsHeight = formulaShowcase.offsetHeight;
  }
}
let marqueeReset;
const marqueeTrack = document.querySelector('.marquee-track');
const marqueeHalfGap = marqueeTrack ? (parseFloat(getComputedStyle(marqueeTrack).gap) || 30) / 2 : 15;
const marqueeAnimation = marqueeTrack && !reducedMotion.matches ? marqueeTrack.animate(
  [{ transform: 'translateX(0)' }, { transform: `translateX(calc(-50% - ${marqueeHalfGap}px))` }],
  { duration: 42000, iterations: Infinity, easing: 'linear' }
) : null;

function update() {
  raf = null;
  const storyRelTop = storyAbsTop - scrollY;
  progress = clamp(-storyRelTop / storyScrollRange * 2, 0, 2);
  // The opening title hands directly to the reel on the first movement.
  const active = progress < 1.9 ? 0 : 1;
  const controlActive = progress < .025 ? 0 : progress < 1.9 ? 1 : 2;
  const ingredientPosition = clamp(progress / 1.72, 0, 1) * (ingredientRows.length - 1);
  const introVisibility = clamp(1 - progress / .09, 0, 1);
  const carouselVisibility = clamp(progress / .09, 0, 1);
  stage.style.setProperty('--intro-visibility', String(introVisibility));
  stage.style.setProperty('--carousel-visibility', String(carouselVisibility));
  if (innerWidth > 760) stage.style.setProperty('--capsule-shift', `${progress * 18}px`);
  reel.style.transform = reducedMotion.matches ? 'none' : `translate3d(0,${(1 - ingredientPosition) * rowHeight}px,0)`;
  ingredientRows.forEach((row, i) => {
    const distance = Math.abs(i - ingredientPosition);
    const rowOpacity = clamp(1 - distance * .65, .18, 1);
    row.style.opacity = reducedMotion.matches ? '1' : String(i === 0 ? Math.max(rowOpacity, introVisibility) : rowOpacity * carouselVisibility);
  });
  ingredientCount.textContent = `${String(Math.round(ingredientPosition) + 1).padStart(2, '0')} / ${ingredientRows.length}`;
  steps.forEach((step, i) => {
    step.classList.toggle('is-active', i === active);
    step.inert = i !== active;
    step.setAttribute('aria-hidden', String(i !== active));
  });
  controls.forEach((button, i) => button.setAttribute('aria-pressed', String(i === controlActive)));
  caption.textContent = captions[controlActive];
  const mobile = innerWidth <= 760;
  const descent = reducedMotion.matches ? 0 : progress * (mobile ? 9 : 26);
  view.style.transform = `translateY(${descent}px)`;
  stage.dataset.progress = progress.toFixed(3);
  viewer?.setProgress(progress, reducedMotion.matches);
  header.classList.toggle('is-scrolled', scrollY > 24);
  header.classList.toggle('on-story', storyRelTop + storyOffsetHeight > 88);
  if (formulaShowcase) {
    const formulaRelTop = formulaAbsTop - scrollY;
    const formulaProgress = clamp((innerHeight - formulaRelTop) / (innerHeight + formulaAbsHeight * .55), 0, 1);
    formulaShowcase.style.setProperty('--formula-scale', String(.72 + formulaProgress * .68));
  }
}
function requestUpdate() { if (!raf) raf = requestAnimationFrame(update); }
addEventListener('scroll', () => {
  requestUpdate();
  if (marqueeAnimation) {
    const distance = Math.abs(scrollY - lastScrollY);
    marqueeAnimation.playbackRate = clamp(1 + distance / 34, 1, 2.15);
    clearTimeout(marqueeReset);
    marqueeReset = setTimeout(() => { marqueeAnimation.playbackRate = 1; }, 150);
  }
  lastScrollY = scrollY;
}, { passive: true });
addEventListener('resize', () => {
  rowHeight = ingredientRows[0]?.getBoundingClientRect().height || rowHeight;
  cachePositions();
  requestUpdate();
});
reducedMotion.addEventListener('change', requestUpdate);
controls.forEach((button) => button.addEventListener('click', () => {
  const fraction = Number(button.dataset.view) / 2;
  scrollTo({ top: story.offsetTop + (story.offsetHeight - stage.offsetHeight) * fraction,
    behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.documentElement.classList.add('js-ready');
document.querySelectorAll('.reveal').forEach((node) => revealObserver.observe(node));
document.querySelector('[data-year]').textContent = new Date().getFullYear();
rowHeight = ingredientRows[0]?.getBoundingClientRect().height || rowHeight;
cachePositions();
update();
try {
  viewer = await createBottleViewer(document.querySelector('#bottle-canvas'));
  cachePositions();
  update();
  window.bottleViewer = viewer;
} catch (error) {
  console.warn('3D unavailable; displaying the rendered bottle.', error);
  document.querySelector('#bottle-canvas').hidden = true;
  document.querySelector('.bottle-fallback').hidden = false;
  stage.dataset.renderer = 'fallback';
}
