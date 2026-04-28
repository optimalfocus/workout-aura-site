/* Workout Aura — site interactions
   Sticky nav border, scroll-reveal, hero halo, vault tabs, sticky CTA visibility */

(function () {
  'use strict';

  // ─── Sticky nav border on scroll ──────────────────
  var nav = document.getElementById('nav');
  var stickyCta = document.getElementById('stickyCta');

  // Hide sticky CTA when the inline #cta is in view (avoid stacked CTAs)
  var ctaSection = document.getElementById('cta');
  var ctaInView = false;
  if (ctaSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      ctaInView = entries[0].isIntersecting;
      onScroll();
    }, { threshold: 0.25 }).observe(ctaSection);
  }

  function onScroll() {
    var y = window.scrollY;
    if (nav) {
      if (y > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    if (stickyCta) {
      var doc = document.documentElement;
      var nearBottom = (window.innerHeight + y) > doc.scrollHeight - 240;
      var pastHero = y > window.innerHeight * 0.6;
      if (pastHero && !nearBottom && !ctaInView) stickyCta.classList.add('show');
      else stickyCta.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── Waitlist form ────────────────────────────────
  var wlForm = document.getElementById('waitlistForm');
  var wlMsg = document.getElementById('waitlistMsg');
  if (wlForm) {
    wlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = wlForm.querySelector('input[type="email"]').value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) {
        showMsg('Please enter a valid email address.', true);
        return;
      }
      var endpoint = wlForm.getAttribute('action');
      // Pre-launch fallback: if the endpoint hasn't been wired yet, open mailto.
      if (!endpoint || endpoint.indexOf('REPLACE_WITH_YOUR_FORM_ID') !== -1) {
        window.location.href = 'mailto:support@myworkoutaura.com?subject=Waitlist%20signup&body=' + encodeURIComponent(email);
        showMsg("Thanks — we'll be in touch.", false);
        return;
      }
      wlForm.classList.add('sending');
      var data = new FormData(wlForm);
      fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) {
          wlForm.classList.remove('sending');
          if (r.ok) {
            wlForm.reset();
            showMsg("You're on the list. Check your inbox for confirmation.", false);
          } else {
            showMsg('Something went wrong. Email support@myworkoutaura.com to join.', true);
          }
        })
        .catch(function () {
          wlForm.classList.remove('sending');
          showMsg('Network error. Email support@myworkoutaura.com to join.', true);
        });
    });
  }
  // ─── Hide vs-table swipe hint after first horizontal scroll
  var vsScroll = document.querySelector('.vs-scroll');
  var vsHint = document.querySelector('.vs-scroll-hint');
  if (vsScroll && vsHint) {
    var fadeHint = function () {
      if (vsScroll.scrollLeft > 12) {
        vsHint.style.transition = 'opacity 0.4s ease';
        vsHint.style.opacity = '0';
        vsScroll.removeEventListener('scroll', fadeHint);
      }
    };
    vsScroll.addEventListener('scroll', fadeHint, { passive: true });
  }

  function showMsg(text, isError) {
    if (!wlMsg) return;
    wlMsg.textContent = text;
    wlMsg.classList.toggle('error', !!isError);
    wlMsg.hidden = false;
  }

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

  // ─── Hero phone bg cycle (lazy-create siblings) ──
  var firstBg = document.querySelector('.phone-bg[data-bg-rotate]');
  if (firstBg) {
    var ids = (firstBg.getAttribute('data-bg-rotate') || '').split(',').filter(Boolean);
    var screen = firstBg.parentNode;
    var bgs = [firstBg];
    // Build sibling <img> for the remaining rotation indices, lazy-loaded
    for (var i = 1; i < ids.length; i++) {
      var im = new Image();
      im.src = 'assets/workout-bg/workout' + ids[i] + 'bg.webp';
      im.alt = '';
      im.className = 'phone-bg';
      im.loading = 'lazy';
      im.decoding = 'async';
      im.width = 1376; im.height = 768;
      screen.insertBefore(im, firstBg.nextSibling);
      bgs.push(im);
    }
    if (bgs.length > 1) {
      var idx = 0;
      setInterval(function () {
        bgs[idx].classList.remove('active');
        idx = (idx + 1) % bgs.length;
        bgs[idx].classList.add('active');
      }, 4500);
    }
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
