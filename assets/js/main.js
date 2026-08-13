/* Partner2Impact — site interactions
   Vanilla JS, no dependencies. Everything degrades gracefully without it. */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     Sticky header shadow
     ---------------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------------------- */
  var revealables = document.querySelectorAll('[data-reveal]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!revealables.length) {
    /* nothing to do */
  } else if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el, i) {
      /* stagger siblings a little */
      var delay = parseInt(el.getAttribute('data-reveal-delay') || '', 10);
      if (!isNaN(delay)) el.style.setProperty('--reveal-delay', delay + 'ms');
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     Count-up for stat tiles
     ---------------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countObserver.unobserve(el);

        var target = parseFloat(el.getAttribute('data-count-to'));
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1100;
        var start = null;

        var tick = function (ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased).toLocaleString('en-US') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Contact form
     ---------------------------------------------------------------------- */

  /* Where the form posts.
     - Leave empty to use the built-in mailto fallback (works with no backend).
     - Google Apps Script: deploy google-apps-script/Code.gs as a web app and
       paste its /exec URL here. Submissions land in the sheet and Tracey and
       David get an email.
         var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfy…/exec';
     - Any hosted form service works too (Formspree, Basin, Netlify Forms):
       paste its endpoint instead.
     The body is sent as FormData on purpose — multipart/form-data is a
     CORS-safelisted content type, so the browser skips the preflight OPTIONS
     request that Apps Script cannot answer. */
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyW-bvysipZQXIWDCLEsrhPaJxZWtiWePHyM3Vi7ABIZubJU7aTAzy6b6TL2ok14ATBvQ/exec';
  var CONTACT_EMAIL = 'Hello@Partner2Impact.com';

  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = form.querySelector('.form-status');

    var setStatus = function (message, type) {
      if (!status) return;
      status.textContent = message;
      status.className = 'form-status is-visible is-' + type;
    };

    var showFieldError = function (field, message) {
      var wrap = field.closest('.field');
      var slot = wrap && wrap.querySelector('.error');
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (slot) slot.textContent = message || '';
    };

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      var clearOnFix = function () {
        if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
          showFieldError(field, '');
        }
      };
      field.addEventListener('input', clearOnFix);
      field.addEventListener('change', clearOnFix);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot — silently accept and drop bot submissions. */
      var honeypot = form.querySelector('[name="company_website"]');
      if (honeypot && honeypot.value) {
        setStatus('Thank you — your message has been sent.', 'success');
        form.reset();
        return;
      }

      var valid = true;
      var firstInvalid = null;

      form.querySelectorAll('input[required], textarea[required], select[required]').forEach(function (field) {
        if (field.checkValidity()) {
          showFieldError(field, '');
        } else {
          valid = false;
          firstInvalid = firstInvalid || field;
          showFieldError(
            field,
            field.type === 'checkbox'
              ? 'Please tick this box to continue.'
              : field.validity.valueMissing
                ? 'This field is required.'
                : field.type === 'email'
                  ? 'Please enter a valid email address.'
                  : 'Please check this field.'
          );
        }
      });

      if (!valid) {
        setStatus('Please complete the highlighted fields.', 'error');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = new FormData(form);
      var submitBtn = form.querySelector('[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : '';

      if (FORM_ENDPOINT) {
        /* Which page the enquiry came from, so the sheet shows the context. */
        data.append('page', window.location.href);

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
        fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (!res.ok) throw new Error('Request failed');
            /* Apps Script always answers 200 and reports failure in the body,
               so the payload decides. Services that signal through the status
               code alone send no JSON — treat that as success. */
            return res.json().catch(function () { return null; });
          })
          .then(function (payload) {
            if (payload && payload.result === 'error') throw new Error(payload.message);
            form.reset();
            setStatus('Thank you — your message is on its way. We reply within one business day.', 'success');
          })
          .catch(function () {
            setStatus(
              'Something went wrong sending the form. Please email us directly at ' + CONTACT_EMAIL + '.',
              'error'
            );
          })
          .finally(function () {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
          });
        return;
      }

      /* No backend configured: open the visitor's mail client, pre-filled. */
      var lines = [
        'Name: ' + (data.get('name') || ''),
        'Organization: ' + (data.get('organization') || '—'),
        'Email: ' + (data.get('email') || ''),
        'Phone: ' + (data.get('phone') || '—'),
        'CRM: ' + (data.get('crm') || '—'),
        'Primary challenge: ' + (data.get('challenge') || '—'),
        '',
        (data.get('message') || '')
      ];

      var href =
        'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent('Data health check request — ' + (data.get('organization') || data.get('name') || 'New enquiry')) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = href;
      setStatus(
        'Your email app is opening with the message ready to send. If nothing happens, write to ' +
          CONTACT_EMAIL + ' directly.',
        'success'
      );
    });
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
