(function () {
  'use strict';

  function mapDataAttributes() {
    document.querySelectorAll('[data-toggle]').forEach(function (el) {
      if (!el.hasAttribute('data-bs-toggle')) {
        el.setAttribute('data-bs-toggle', el.getAttribute('data-toggle'));
      }
    });

    document.querySelectorAll('[data-target]').forEach(function (el) {
      if (!el.hasAttribute('data-bs-target')) {
        el.setAttribute('data-bs-target', el.getAttribute('data-target'));
      }
    });

    document.querySelectorAll('[data-dismiss]').forEach(function (el) {
      if (!el.hasAttribute('data-bs-dismiss')) {
        el.setAttribute('data-bs-dismiss', el.getAttribute('data-dismiss'));
      }
    });

    document.querySelectorAll('[data-spy="scroll"]').forEach(function (el) {
      if (!el.hasAttribute('data-bs-spy')) {
        el.setAttribute('data-bs-spy', 'scroll');
      }
    });

    document.querySelectorAll('[data-offset]').forEach(function (el) {
      if (!el.hasAttribute('data-bs-offset')) {
        el.setAttribute('data-bs-offset', el.getAttribute('data-offset'));
      }
    });
  }

  function initScrollSpy() {
    if (!window.bootstrap || !window.bootstrap.ScrollSpy) {
      return;
    }

    document.querySelectorAll('[data-bs-spy="scroll"]').forEach(function (el) {
      var target = el.getAttribute('data-bs-target') || el.getAttribute('data-target');
      if (!target) {
        return;
      }

      var offset = parseInt(el.getAttribute('data-bs-offset') || el.getAttribute('data-offset') || '10', 10);
      window.bootstrap.ScrollSpy.getOrCreateInstance(el, {
        target: target,
        offset: isNaN(offset) ? 10 : offset
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mapDataAttributes();
      initScrollSpy();
    }, { once: true });
  } else {
    mapDataAttributes();
    initScrollSpy();
  }
})();
