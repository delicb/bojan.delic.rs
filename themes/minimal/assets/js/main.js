(function () {
  // ---- Back to top ----
  var btn = document.getElementById('back-to-top');
  if (btn) {
    var shown = false;
    function toggle() {
      var shouldShow = window.scrollY > 400;
      if (shouldShow !== shown) {
        shown = shouldShow;
        btn.classList.toggle('visible', shown);
      }
    }
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Code block copy buttons ----
  var copyNotify = document.getElementById('copy-notify');
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;

    var wrapper = btn.closest('.code-block-wrapper');
    if (!wrapper) return;

    var codeEl =
      wrapper.querySelector('.lntd:last-child code') ||
      wrapper.querySelector('pre code');
    if (!codeEl) return;

    var text = codeEl.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add('copied');
        if (copyNotify) {
          copyNotify.textContent = 'Copied to clipboard';
        }
        setTimeout(function () {
          btn.classList.remove('copied');
          if (copyNotify) {
            copyNotify.textContent = '';
          }
        }, 2000);
      });
    }
  });

  // ---- Scroll-triggered reveal animations ----
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.scroll-reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.scroll-reveal').forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ---- Table horizontal scroll indicators ----
  function updateScroller(s) {
    var w = s.parentElement;
    var canLeft = s.scrollLeft > 0;
    var canRight = s.scrollLeft + s.clientWidth < s.scrollWidth - 1;
    w.classList.toggle('can-scroll-left', canLeft);
    w.classList.toggle('can-scroll-right', canRight);
  }
  document.querySelectorAll('.table-scroller').forEach(function (s) {
    updateScroller(s);
    s.addEventListener('scroll', function () {
      updateScroller(s);
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('.table-scroller').forEach(updateScroller);
  });
})();
