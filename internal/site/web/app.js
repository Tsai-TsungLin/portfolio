// relexes.com 個人網站：只有互動小功能，沒有框架
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 導覽列：捲動後加陰影、目前區塊高亮、手機選單
  var nav = document.getElementById('nav');
  var links = document.querySelectorAll('#navLinks a[href^="#"]');
  var toggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { navLinks.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });
  var sections = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // 進場動畫：可視區內才浮上
  var risers = document.querySelectorAll('.rise');
  if (reduce || !('IntersectionObserver' in window)) {
    risers.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    risers.forEach(function (el) { io.observe(el); });
  }

  // 首頁數字：從 0 數到目標
  if (!reduce) {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 900, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // 跑馬燈：複製一份內容才能無縫循環
  var marquee = document.getElementById('marquee');
  if (marquee) marquee.innerHTML += marquee.innerHTML;

  // 作品分類篩選
  var chips = document.querySelectorAll('#chips .chip');
  var cards = document.querySelectorAll('#grid .card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      cards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-cat') === f;
        if (reduce) { card.classList.toggle('hide', !show); return; }
        if (show) {
          card.classList.remove('hide');
          requestAnimationFrame(function () { card.classList.remove('fade'); });
        } else {
          card.classList.add('fade');
          setTimeout(function () { if (card.classList.contains('fade')) card.classList.add('hide'); }, 300);
        }
      });
    });
  });

  // 卡片展開細節
  document.querySelectorAll('.card-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.firstChild.textContent = open ? '收合 ' : '細節 ';
      btn.nextElementSibling.classList.toggle('open', open);
    });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
