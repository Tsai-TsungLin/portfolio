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

  // 細節用 modal 顯示：把該張卡片的內容複製進 dialog，卡片本身高度不變
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modalBody');
  var lastFocus = null;
  function openModal(card) {
    modalBody.innerHTML = '';
    ['.card-img', '.card-top', 'h3', '.card-sum', '.card-detail', '.tags'].forEach(function (sel) {
      var el = card.querySelector(sel);
      if (el) {
        var copy = el.cloneNode(true);
        if (sel === 'h3') copy.id = 'modalTitle';
        modalBody.appendChild(copy);
      }
    });
    lastFocus = document.activeElement;
    document.body.classList.add('modal-open');
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    document.getElementById('modalClose').focus();
  }
  function closeModal() {
    if (modal.open) modal.close(); else modal.removeAttribute('open');
  }
  modal.addEventListener('close', function () {
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  // 點背景關閉：dialog 本身佔滿視窗，點到的不是卡片內容就關
  modal.addEventListener('click', function (e) {
    if (!e.target.closest('.modal-card')) closeModal();
  });
  document.querySelectorAll('.card-more').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.closest('.card')); });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
