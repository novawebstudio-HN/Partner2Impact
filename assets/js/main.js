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
     Calendly

     One constant for the whole site. The booking address has already moved
     once (Tracey's personal account to the Generedge account that pays for
     Calendly and Zoom) and event slugs change whenever an event is renamed,
     so it lives here and nowhere else — /contact carries the widget div with
     no data-url of its own and gets filled in below.

     Two shapes, depending on the page:
       - /contact has the calendar inline. It is the page's main content, so
         it loads as soon as this script runs.
       - Every other page gets the floating badge, on window load, so a
         third-party script and its render-blocking stylesheet can never
         delay the page they sit on. Calendly's own snippet puts that
         stylesheet in <head> and assigns window.onload directly, which would
         clobber anything else that wanted it; neither is used here.

     Privacy cost, recorded in /privacy: the badge means Calendly, and its
     cookies, load on every page rather than only on /contact.

     The contact form was removed with the switch to booking. Its Apps Script
     backend is still in google-apps-script/Code.gs and the README still
     carries the wiring, in case a form is ever wanted again.
     ---------------------------------------------------------------------- */

  var CALENDLY_URL = 'https://calendly.com/tracey-generedge/new-meeting';
  var CALENDLY_JS = 'https://assets.calendly.com/assets/external/widget.js';
  var CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css';

  var loadCalendly = function (onReady) {
    var js = document.createElement('script');
    js.src = CALENDLY_JS;
    js.async = true;
    if (onReady) js.onload = onReady;
    document.head.appendChild(js);
  };

  var inlineWidget = document.querySelector('.calendly-inline-widget');

  if (inlineWidget) {
    /* Calendly's script scans for .calendly-inline-widget[data-url] when it
       loads, so the address has to be on the element before the script is. */
    inlineWidget.setAttribute('data-url', CALENDLY_URL);
    loadCalendly();
  } else {
    var loadBadge = function () {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = CALENDLY_CSS;
      document.head.appendChild(css);

      loadCalendly(function () {
        if (!window.Calendly) return;
        window.Calendly.initBadgeWidget({
          url: CALENDLY_URL,
          text: 'Book 15 minutes',
          color: '#cf4703',
          textColor: '#ffffff',
          branding: true
        });
      });
    };

    if (document.readyState === 'complete') loadBadge();
    else window.addEventListener('load', loadBadge);
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
