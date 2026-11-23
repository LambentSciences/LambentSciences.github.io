(function () {
  'use strict';
  var doc = document.documentElement;
  var motion = doc.classList.contains('motion');

  /* year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* menu */
  var btn = document.querySelector('.hdr-menu');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* header takes the tone of the section underneath it */
  var hdr = document.querySelector('.hdr');
  var toned = Array.prototype.slice.call(document.querySelectorAll('main [data-tone], .ftr'));
  function syncHeader() {
    if (!hdr) return;
    var y = hdr.offsetHeight / 2, tone = 'dark';
    for (var i = 0; i < toned.length; i++) {
      var r = toned[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { tone = toned[i].getAttribute('data-tone'); break; }
    }
    if (hdr.getAttribute('data-tone') !== tone) hdr.setAttribute('data-tone', tone);
  }

  /* process line */
  var proc = document.querySelector('.process');
  var track = proc && proc.querySelector('.pc-track');
  var steps = proc ? proc.querySelectorAll('.step') : [];
  if (proc && motion) proc.classList.add('is-live');
  function syncProcess() {
    if (!track || !motion) return;
    var r = track.getBoundingClientRect();
    var mark = window.innerHeight * 0.6;
    var p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
    track.style.setProperty('--p', p.toFixed(4));
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('is-on', steps[i].getBoundingClientRect().top < mark);
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; syncHeader(); syncProcess(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* reveals */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(reveals, function (el, i) {
      el.style.transitionDelay = ((i % 4) * 80) + 'ms';
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  }

  /* hero: a waterfall of beam-profile traces */
  var cv = document.getElementById('beam');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), w = 0, h = 0, dpr = 1, t0 = performance.now(), running = true;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      var lines = 38, top = h * 0.16, span = h * 0.74, amp = h * 0.2;
      for (var i = 0; i < lines; i++) {
        var f = i / (lines - 1);
        var base = top + f * span;
        var cx = 0.5 + 0.07 * Math.sin(t * 0.5 + f * 3.1);
        var wid = 0.09 + 0.05 * Math.sin(t * 0.35 + f * 4.2) + 0.06 * f;
        var peak = 0.55 + 0.45 * Math.sin(t * 0.6 - f * 5.5) * Math.sin(t * 0.21 + f);
        ctx.beginPath();
        for (var x = 0; x <= w; x += 3) {
          var u = x / w, d = (u - cx) / wid;
          var g = Math.exp(-d * d * 0.5) * peak;
          var ripple = 0.03 * Math.sin(u * 42 + t * 2 + i) * Math.exp(-d * d * 0.12);
          var y = base - (g + ripple) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var hot = Math.max(0, 1 - Math.abs(f - 0.55) * 2.2);
        ctx.strokeStyle = hot > 0.35
          ? 'rgba(240,160,98,' + (0.35 + hot * 0.55).toFixed(3) + ')'
          : 'rgba(238,234,225,' + (0.12 + f * 0.18).toFixed(3) + ')';
        ctx.lineWidth = hot > 0.35 ? 1.25 : 1;
        ctx.stroke();
      }
      if (running && motion) requestAnimationFrame(draw);
    }
    size();
    window.addEventListener('resize', function () { size(); if (!motion) draw(performance.now()); });
    if ('IntersectionObserver' in window && motion) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(draw); }
        running = vis;
      }).observe(cv);
    }
    requestAnimationFrame(draw);
  }

  /* service illustrations */
  var IV = 'rgba(238,234,225,', AM = '#F0A062';
  var VIZ = {
    proposal: function () {
      var s = '<rect x="60" y="28" width="190" height="244" fill="none" stroke="' + IV + '.35)"/>';
      var widths = [120, 150, 96, 140, 110];
      for (var i = 0; i < widths.length; i++) s += '<rect x="80" y="' + (56 + i * 16) + '" width="' + widths[i] + '" height="4" fill="' + IV + '.22)"/>';
      s += '<rect x="80" y="44" width="70" height="5" fill="' + AM + '"/>';
      s += '<path d="M80 236H230M80 236V150" stroke="' + IV + '.3)" fill="none"/>';
      s += '<path d="M80 232C120 230 134 160 155 160S190 230 230 232" stroke="' + AM + '" stroke-width="1.6" fill="none"/>';
      s += '<text x="80" y="258" fill="' + IV + '.5)" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="1.2">APPROACH · MILESTONES · RISK</text>';
      var ms = [0, 1, 2, 3];
      s += '<path d="M290 150H440" stroke="' + IV + '.3)"/>';
      ms.forEach(function (m) {
        var x = 300 + m * 44;
        s += '<path d="M' + x + ' 144l6 6-6 6-6-6z" fill="' + (m === 0 ? AM : 'none') + '" stroke="' + (m === 0 ? AM : IV + '.55)') + '"/>';
        s += '<text x="' + x + '" y="176" text-anchor="middle" fill="' + IV + '.45)" font-family="JetBrains Mono, monospace" font-size="8">M' + (m + 1) + '</text>';
      });
      return s;
    },
    program: function () {
      var labels = ['CONCEPT', 'FEASIBILITY', 'DESIGN', 'BUILD', 'TEST', 'HANDOFF'];
      var s = '';
      for (var c = 0; c <= 8; c++) s += '<path d="M' + (140 + c * 37) + ' 40V262" stroke="' + IV + '.07)"/>';
      labels.forEach(function (l, i) {
        var y = 54 + i * 36, x = 140 + i * 44, len = 70 + (i % 2) * 22;
        s += '<text x="40" y="' + (y + 9) + '" fill="' + IV + '.5)" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="1">' + l + '</text>';
        s += '<rect x="' + x + '" y="' + y + '" width="' + len + '" height="12" fill="' + (i < 3 ? AM : 'none') + '" stroke="' + (i < 3 ? AM : IV + '.45)') + '" opacity="' + (i < 3 ? 1 - i * 0.22 : 1) + '"/>';
        if (i < labels.length - 1) s += '<path d="M' + (x + len) + ' ' + (y + 12) + 'V' + (y + 30) + 'H' + (x + 44) + '" stroke="' + IV + '.25)" fill="none"/>';
      });
      return s;
    },
    prototype: function () {
      var s = '<path d="M30 220H450" stroke="' + IV + '.25)"/>';
      for (var k = 0; k < 14; k++) s += '<circle cx="' + (44 + k * 30) + '" cy="234" r="1.6" fill="' + IV + '.25)"/>';
      s += '<rect x="44" y="132" width="78" height="44" fill="none" stroke="' + IV + '.6)"/>';
      s += '<text x="52" y="148" fill="' + IV + '.5)" font-family="JetBrains Mono, monospace" font-size="8">SOURCE</text>';
      s += '<path d="M122 154H190" stroke="' + AM + '" stroke-width="2"/>';
      s += '<path d="M190 154L262 136M190 154L262 172" stroke="' + AM + '" stroke-width="1.2" opacity=".7"/>';
      s += '<ellipse cx="200" cy="154" rx="5" ry="26" fill="none" stroke="' + IV + '.7)"/>';
      s += '<path d="M262 136L330 154L262 172" stroke="' + AM + '" stroke-width="1.2" fill="' + AM + '" fill-opacity=".12"/>';
      s += '<ellipse cx="262" cy="154" rx="6" ry="30" fill="none" stroke="' + IV + '.7)"/>';
      s += '<rect x="330" y="118" width="6" height="72" fill="' + IV + '.6)"/>';
      s += '<circle cx="330" cy="154" r="9" fill="' + AM + '" opacity=".35"/><circle cx="330" cy="154" r="3" fill="#fff"/>';
      s += '<path d="M360 96h80v52h-80z" fill="none" stroke="' + IV + '.4)"/>';
      s += '<path d="M366 140C380 140 386 106 400 106S420 140 434 140" stroke="' + AM + '" stroke-width="1.4" fill="none"/>';
      s += '<text x="366" y="88" fill="' + IV + '.5)" font-family="JetBrains Mono, monospace" font-size="8">MEASURED</text>';
      return s;
    }
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-viz]'), function (el) {
    var fn = VIZ[el.getAttribute('data-viz')];
    if (!fn) return;
    el.innerHTML = '<svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + fn() + '</svg>';
  });
})();
