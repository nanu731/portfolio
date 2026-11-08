/* Browser-only form behavior. Delivery credentials and recipient stay on the server. */
(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const button = form.querySelector('button[type=submit]');
  const label = form.querySelector('[data-contact-submit-label]');
  const status = form.querySelector('#contact-status');
  const fields = ['name', 'email', 'message'].map(name => form.elements.namedItem(name));
  let available = false, busy = false, preview = false;
  const notify = (message, error = false) => {
    status.setAttribute('role', error ? 'alert' : 'status');
    status.textContent = message;
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!available || busy || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    busy = true; button.disabled = true; form.setAttribute('aria-busy', 'true');
    fields.forEach(field => { field.readOnly = true; });
    label.textContent = 'Sending…';
    notify(preview ? 'Testing the form locally. No email will be sent.' : 'Sending your message…');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values), signal: AbortSignal.timeout(12000),
      });
      const result = await response.json();
      if (response.status !== 201 || result.accepted !== true) throw Error(typeof result.message === 'string' ? result.message : 'We could not confirm delivery. Your message is still here. Sending it again may create a duplicate.');
      form.reset();
      notify(result.preview === true ? 'Preview complete. No email was sent.' : 'Your message has been accepted for delivery.');
      status.focus();
    } catch (error) {
      notify(error.name === 'Error' ? error.message : 'We could not confirm delivery. Your message is still here. Sending it again may create a duplicate.', true);
      status.focus();
    } finally {
      busy = false; button.disabled = !available; label.textContent = 'Send message';
      fields.forEach(field => { field.readOnly = false; }); form.removeAttribute('aria-busy');
    }
  });
  fetch('/api/contact', { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(8000) })
    .then(response => { if (!response.ok) throw Error(); return response.json(); })
    .then(result => {
      available = result.available === true;
      preview = result.preview === true; button.disabled = !available;
      notify(!available ? 'Message delivery is unavailable. Please try again later.' : preview ? 'Local preview: messages are not emailed.' : 'All fields are required.');
    })
    .catch(() => notify('Message delivery is unavailable. Please try again later.', true));
})();
