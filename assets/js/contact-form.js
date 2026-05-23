(function () {
  function initContactForm(form) {
    var status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.style.cssText = 'margin-top:0.75rem;font-size:0.9375rem;display:none;line-height:1.4;';
      form.appendChild(status);
    }

    function setStatus(text, ok) {
      status.textContent = text;
      status.style.color = ok ? '#065F46' : '#991B1B';
      status.style.display = 'block';
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var orig = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }
      status.style.display = 'none';

      try {
        var res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        var data = {};
        try { data = await res.json(); } catch (_) {}
        if (res.ok && data.ok) {
          setStatus('Thanks - we will respond within one business day.', true);
          form.reset();
        } else {
          setStatus(data.error || 'Something went wrong. Please try again or book a call.', false);
        }
      } catch (err) {
        setStatus('Connection error. Please try again or book a call.', false);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = orig;
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('form[data-contact-form]');
    forms.forEach(initContactForm);
  });
})();
