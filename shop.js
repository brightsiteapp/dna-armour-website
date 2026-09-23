const note = document.querySelector('.purchase-note');
document.querySelector('.purchase-action').addEventListener('click', () => {
  const choice = document.querySelector('input[name="purchase"]:checked').value;
  note.textContent = `${choice === 'subscribe' ? 'Subscription' : 'One-off purchase'} selected. Add the final price and payment provider to activate checkout.`;
});
