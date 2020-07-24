/*
=== Utilities ===
*/
const messages = {
  hide: 'Hide',
  noack: 'You have <strong>canceled</strong> this joint owner designation.',
  show: 'Show',
  yesack: 'You have <strong>submitted</strong> this joint owner designation.'
};
const confirmPrompt = (ownership, name) => {
  const preText = 'Please confirm or cancel your designation of (A) ';
  const midText = ' as a joint owner and (B) ';
  const postText = ' as the form of ownership.';
  return `${preText}${name}${midText}${ownership.toLowerCase()}${postText}`;
};
/*
=== Handlers ===
*/
// Remove any confirmation message.
const removeAck = () => {
  const ackContainer = document.getElementById('ack');
  if (ackContainer.textContent) {
    ackContainer.textContent= '';
  }
};
// Launch a confirmation dialog when the form is submitted.
const submissionHandler = event => {
  event.preventDefault();
  removeAck();
  const ownership = Array.from(
    document.querySelectorAll('input[type=radio]')
  ).filter(input => input.checked)[0].nextElementSibling.textContent;
  const name = document.getElementById('name').value;
  // Start new event loop; otherwise the dialog interrupts removeAck();
  setTimeout(() => {
    const decision = window.confirm(confirmPrompt(ownership, name));
    // Display an acknowledgement of the user's decision.
    document.getElementById('ack').innerHTML = messages[
      decision ? 'yesack' : 'noack'
    ];
  });
};
/*
=== After-page-load listeners ===
*/
const createListeners = () => {
  // Process a form submission.
  document.getElementById('form-main').addEventListener(
    'submit', submissionHandler
  );
  // When the user changes any input, remove the acknowledgement.
  Array.from(
    document.querySelectorAll('input[type=radio]')
  ).forEach(radioButton => {
    radioButton.addEventListener('change', removeAck);
  });
  document.getElementById('name').addEventListener('input', removeAck);
};
/*
=== Page-load listener ===
*/
document.addEventListener('DOMContentLoaded', createListeners, {once: true});
