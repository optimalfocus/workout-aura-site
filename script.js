/* Workout Aura — site interactions
   Sticky nav border, scroll-reveal, hero halo, vault tabs, sticky CTA visibility */

(function () {
  'use strict';

  // ─── Sticky nav border on scroll ──────────────────
  var nav = document.getElementById('nav');
  var stickyCta = document.getElementById('stickyCta');

  function onScroll() {
    var y = window.scrollY;
    if (nav) {
      if (y > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    // Show sticky CTA after first viewport, hide near footer
    if (stickyCta) {
      var doc = document.documentElement;
      var nearBottom = (window.innerHeight + y) > doc.scrollHeight - 240;
      var pastHero = y > window.innerHeight * 0.6;
      if (pastHero && !nearBottom) stickyCta.classList.add('show');
      else stickyCta.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── Scroll-reveal via IntersectionObserver ──────
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // ─── Hero phone bg cycle ─────────────────────────
  var bgs = document.querySelectorAll('.phone-bg');
  if (bgs.length > 1) {
    var idx = 0;
    setInterval(function () {
      bgs[idx].classList.remove('active');
      idx = (idx + 1) % bgs.length;
      bgs[idx].classList.add('active');
    }, 4500);
  }

  // ─── Vault tabs ───────────────────────────────────
  var tabs = document.querySelectorAll('.vault-tab');
  var panels = document.querySelectorAll('.vault-panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-tab');
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === name);
      });
    });
  });

  // ─── Smooth-scroll with sticky-nav offset ────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
