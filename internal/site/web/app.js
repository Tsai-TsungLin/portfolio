// relexes.com 個人網站：左欄導覽跟隨捲動、作品篩選、細節 modal，沒有框架
(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 進場
  var risers=document.querySelectorAll('.rise');
  if(reduce){risers.forEach(function(el){el.classList.add('in')})}
  else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1});risers.forEach(function(el){io.observe(el)})}
  // 左欄導覽跟著捲動高亮
  var sideNav=document.getElementById('sideNav');
  var links=sideNav?sideNav.querySelectorAll('a[href^="#"]'):[];
  var secs=Array.prototype.map.call(links,function(a){return document.querySelector(a.getAttribute('href'))}).filter(Boolean);
  function setOn(id){links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+id)})}
  if(secs.length){var spy=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)setOn(e.target.id)})},{rootMargin:'-30% 0px -60% 0px'});secs.forEach(function(s){spy.observe(s)});setOn('work')}
  // 分類篩選
  var chips=document.querySelectorAll('#chips .chip'),rows=document.querySelectorAll('#grid .row');
  chips.forEach(function(chip){chip.addEventListener('click',function(){var f=chip.getAttribute('data-filter');chips.forEach(function(c){c.setAttribute('aria-pressed',String(c===chip))});rows.forEach(function(r){var show=f==='all'||r.getAttribute('data-cat')===f;if(reduce){r.classList.toggle('hide',!show);return}if(show){r.classList.remove('hide');requestAnimationFrame(function(){r.classList.remove('fade')})}else{r.classList.add('fade');setTimeout(function(){if(r.classList.contains('fade'))r.classList.add('hide')},300)}})})});
  // modal
  var modal=document.getElementById('modal'),body=document.getElementById('modalBody'),last=null;
  if(modal){
  function open(row){body.innerHTML='';['.card-img','h3','.card-sum','.card-detail','.tags'].forEach(function(sel){var el=row.querySelector(sel);if(el){var c=el.cloneNode(true);if(sel==='h3')c.id='modalTitle';body.appendChild(c)}});last=document.activeElement;document.body.classList.add('modal-open');if(modal.showModal)modal.showModal();else modal.setAttribute('open','');document.getElementById('modalClose').focus()}
  function close(){if(modal.open)modal.close();else modal.removeAttribute('open')}
  modal.addEventListener('close',function(){document.body.classList.remove('modal-open');if(last&&last.focus)last.focus()});
  document.getElementById('modalClose').addEventListener('click',close);
  modal.addEventListener('click',function(e){if(!e.target.closest('.modal-card'))close()});
  document.querySelectorAll('.card-more').forEach(function(b){b.addEventListener('click',function(){open(b.closest('.row'))})});
  }
  // 履歷頁：列印按鈕與手機選單
  var printBtn=document.getElementById('printBtn');if(printBtn)printBtn.addEventListener('click',function(){window.print()});
  var toggle=document.getElementById('navToggle'),navLinks=document.getElementById('navLinks');
  if(toggle&&navLinks){toggle.addEventListener('click',function(){var o=navLinks.classList.toggle('open');toggle.setAttribute('aria-expanded',String(o))})}
  var year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());
})();
