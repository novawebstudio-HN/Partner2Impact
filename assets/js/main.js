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
        var st = links.querySelector('.nav-sub-toggle');
        if (st) st.setAttribute('aria-expanded', 'false');
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
     Solutions dropdown
     Hover handles it on a pointer; this covers keyboard and touch, where
     hover either does not exist or sticks after a tap.
     ---------------------------------------------------------------------- */
  var subToggle = document.querySelector('.nav-sub-toggle');
  var sub = document.getElementById('nav-sub-solutions');

  if (subToggle && sub) {
    var closeSub = function () { subToggle.setAttribute('aria-expanded', 'false'); };

    subToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = subToggle.getAttribute('aria-expanded') === 'true';
      subToggle.setAttribute('aria-expanded', String(!open));
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-has-sub')) closeSub();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && subToggle.getAttribute('aria-expanded') === 'true') {
        closeSub();
        subToggle.focus();
      }
    });

    /* Tabbing past the last item should close it, the same as clicking away. */
    sub.addEventListener('focusout', function (e) {
      if (!e.relatedTarget || !e.relatedTarget.closest('.nav-has-sub')) closeSub();
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
     Orbital compass

     Turns the ring a quarter at a time; CSS counter-rotates each card so the
     text stays upright while it travels. Whichever slot lands at the top is
     the active one — after k quarter turns that is the card whose index makes
     (index + k) % 4 come out zero.

     It pauses on hover and on focus. A carousel that keeps moving while
     someone is reading it is worse than one that does not move at all, and
     the pause is what makes an auto-rotating panel acceptable rather than
     merely fashionable. prefers-reduced-motion stops it entirely, leaving the
     diamond static with the first card active.
     ---------------------------------------------------------------------- */
  var orbit = document.querySelector('[data-orbit]');
  if (orbit) {
    var slots = Array.prototype.slice.call(orbit.querySelectorAll('.orbit-slot'));
    var turns = 0;

    var mark = function () {
      slots.forEach(function (slot, i) {
        slot.classList.toggle('is-active', (i + turns) % slots.length === 0);
      });
    };
    mark();

    if (!reduceMotion && slots.length) {
      var held = false;
      setInterval(function () {
        if (held || document.hidden) return;
        turns += 1;
        orbit.style.setProperty('--rot', turns * 90 + 'deg');
        mark();
      }, 3800);

      ['mouseenter', 'focusin'].forEach(function (evt) {
        orbit.addEventListener(evt, function () { held = true; });
      });
      ['mouseleave', 'focusout'].forEach(function (evt) {
        orbit.addEventListener(evt, function () { held = false; });
      });
    }
  }

  /* ----------------------------------------------------------------------
     Booking calendar status

     The widget markup and its script live in contact.html so the browser can
     fetch Calendly while it parses the page — main.js is not on that critical
     path any more. All that is left here is the honest reporting.

     Calendly takes several seconds to boot even on a good connection, and it
     appends its iframe rather than replacing what it finds, so the message in
     the div is what the visitor reads the whole time. It says "loading". Only
     if no iframe has arrived after twenty seconds does it become an error —
     saying "could not load" while it is merely slow is a lie the visitor acts
     on, and it was on the live site.

     Only /contact loads Calendly. Every other page carries .book-fab, a plain
     link to this one: no third-party script and no cookies on a page someone
     is only reading.
     ---------------------------------------------------------------------- */
  var scheduler = document.querySelector('.calendly-inline-widget');
  var schedulerStatus = document.querySelector('[data-scheduler-status]');

  if (scheduler && schedulerStatus) {
    var failed = setTimeout(function () {
      if (scheduler.querySelector('iframe')) return;
      schedulerStatus.classList.add('is-error');
      schedulerStatus.innerHTML =
        'The booking calendar could not load. Write to ' +
        '<a href="mailto:info@partner2impact.com">info@partner2impact.com</a> ' +
        'and we will find a time.';
    }, 20000);

    if ('MutationObserver' in window) {
      var watcher = new MutationObserver(function () {
        if (!scheduler.querySelector('iframe')) return;
        clearTimeout(failed);
        watcher.disconnect();
      });
      watcher.observe(scheduler, { childList: true });
    }
  }

  /* ----------------------------------------------------------------------
     Mailing list

     Addresses land in the "Mailing list" tab of the same Google Sheet the
     contact form used to write to — the Apps Script was already deployed and
     still answering, so this needed a branch in the script rather than a new
     service. It is a holding place until a real email tool is chosen.

     Two things it deliberately does not do: send a confirmation, and offer an
     unsubscribe link. That makes it single opt-in, which is fine for
     collecting addresses and not fine for sending campaigns from — see
     /privacy and the README before importing these anywhere.

     Empty the constant and the form falls back to opening the visitor's mail
     client, so the address still reaches a person if the endpoint ever dies.

     FormData is sent on purpose: multipart/form-data is CORS-safelisted, so
     the browser skips the preflight OPTIONS request that Apps Script cannot
     answer.
     ---------------------------------------------------------------------- */

  var MAILING_LIST_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbyW-bvysipZQXIWDCLEsrhPaJxZWtiWePHyM3Vi7ABIZubJU7aTAzy6b6TL2ok14ATBvQ/exec';
  var LIST_EMAIL = 'info@partner2impact.com';

  var signup = document.querySelector('[data-signup]');
  if (signup) {
    var field = signup.querySelector('input[type="email"]');
    var note = document.querySelector('.signup-status');
    var button = signup.querySelector('[type="submit"]');

    var say = function (message, type) {
      if (!note) return;
      note.textContent = message;
      note.className = 'signup-status is-visible' + (type === 'error' ? ' is-error' : '');
    };

    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
        field.setAttribute('aria-invalid', 'false');
        if (note) note.className = 'signup-status';
      }
    });

    signup.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!field.checkValidity()) {
        field.setAttribute('aria-invalid', 'true');
        say('Please enter a valid email address.', 'error');
        field.focus();
        return;
      }
      field.setAttribute('aria-invalid', 'false');


      var label = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Joining…'; }

      /* Apps Script is slow and wildly variable: the same endpoint was measured
         answering in 2.9s, 8.0s and 11.0s on three consecutive calls, so a
         cold start can easily pass ten. Twenty-five seconds is generous enough
         that a working submission is never cut off — the first version used
         eight and aborted real signups — while still ending a request that has
         genuinely died instead of leaving the button stuck on "Joining…". */
      var abort = new AbortController();
      var timer = setTimeout(function () { abort.abort(); }, 25000);

      var payload = new FormData(signup);
      /* Tells the Apps Script this is a subscription, not a contact enquiry —
         it routes on this and skips the name/email validation. */
      payload.append('type', 'mailing-list');
      payload.append('page', window.location.href);

      fetch(MAILING_LIST_ENDPOINT, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
        signal: abort.signal
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          /* Apps Script always answers 200 and reports failure in the body. */
          return res.json().catch(function () { return null; });
        })
        .then(function (result) {
          if (result && result.result === 'error') throw new Error(result.message);
          signup.reset();
          say('Thank you — you are on the list.');
        })
        .catch(function () {
          /* No mailto fallback. Hijacking the visitor's mail client is a jarring
             answer to a one-field form, and the address is not lost — the
             message names where to send it. */
          say('That did not go through. Please write to ' + LIST_EMAIL + ' and we will add you.', 'error');
        })
        .finally(function () {
          clearTimeout(timer);
          if (button) { button.disabled = false; button.textContent = label; }
        });
    });
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
