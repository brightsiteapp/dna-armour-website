const AMAZON_URL = 'https://www.amazon.co.uk/dp/B0HN895J7C';
document.querySelector('.purchase-action').addEventListener('click', () => {
  window.open(AMAZON_URL, '_blank', 'noopener');
});
