(function(){
  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.15});
  revealEls.forEach(function(el){ io.observe(el); });

  /* ---------- hero dial animation ---------- */
  var TARGET_PERCENT = 42;
  var CIRCUMFERENCE = 552.9;
  var dialFill = document.getElementById('dialFill');
  var dialNum = document.getElementById('dialNum');
  var chips = document.querySelectorAll('#taskChips .chip');
  var dialStarted = false;

  function animateDial(){
    if(dialStarted) return;
    dialStarted = true;
    var offset = CIRCUMFERENCE - (CIRCUMFERENCE * TARGET_PERCENT / 100);
    requestAnimationFrame(function(){
      dialFill.style.strokeDashoffset = offset;
    });
    var start = null, duration = 1600;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      dialNum.innerHTML = Math.round(eased * TARGET_PERCENT) + '<sup>%</sup>';
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    chips.forEach(function(chip){
      var delay = parseInt(chip.getAttribute('data-delay'), 10) || 0;
      setTimeout(function(){
        chip.classList.add('done');
        chip.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>' + chip.textContent;
      }, delay);
    });
  }
  window.addEventListener('load', function(){ setTimeout(animateDial, 250); });

  /* ---------- modal ---------- */
  var overlay = document.getElementById('modalOverlay');
  var modalForm = document.getElementById('modalForm');
  var modalSuccess = document.getElementById('modalSuccess');
  var leadForm = document.getElementById('leadForm');
  var tabs = document.querySelectorAll('.tab');
  var modalTitle = document.getElementById('modalTitle');
  var modalSub = document.getElementById('modalSub');
  var successSub = document.getElementById('successSub');
  var currentIntent = 'consult';
  var lastFocused = null;

  var copy = {
    consult: {
      title: '신청 정보를 입력해 주세요',
      sub: '상담 가능 시간에 맞춰 연락드립니다.',
      success: '빠른 시일 내에 입력하신 연락처로 안내드리겠습니다.'
    },
    content: {
      title: '자료를 받아보세요',
      sub: '입력하신 이메일로 AI 실무 가이드를 보내드립니다.',
      success: '입력하신 이메일로 AI 실무 가이드를 보내드렸습니다.'
    }
  };

  function setIntent(intent){
    currentIntent = intent;
    tabs.forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tab') === intent); });
    modalTitle.textContent = copy[intent].title;
    modalSub.textContent = copy[intent].sub;
  }

  function openModal(intent){
    lastFocused = document.activeElement;
    setIntent(intent || 'consult');
    modalForm.classList.remove('hide');
    modalSuccess.classList.remove('show');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ document.getElementById('fName').focus(); }, 200);
  }

  function closeModal(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    leadForm.reset();
    clearErrors();
    if(lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-open-modal]').forEach(function(btn){
    btn.addEventListener('click', function(){ openModal(btn.getAttribute('data-intent')); });
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOkBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
  tabs.forEach(function(t){
    t.addEventListener('click', function(){ setIntent(t.getAttribute('data-tab')); });
  });

  /* phone auto-format */
  var phoneInput = document.getElementById('fPhone');
  phoneInput.addEventListener('input', function(){
    var v = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 11);
    if(v.length > 7) v = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7);
    else if(v.length > 3) v = v.slice(0,3) + '-' + v.slice(3);
    phoneInput.value = v;
  });

  /* validation */
  function clearErrors(){
    leadForm.querySelectorAll('input').forEach(function(i){ i.classList.remove('error'); });
  }
  function validate(){
    clearErrors();
    var ok = true;
    var name = document.getElementById('fName');
    var email = document.getElementById('fEmail');
    var phone = document.getElementById('fPhone');
    var consent = document.getElementById('fConsent');

    if(name.value.trim().length < 2){ name.classList.add('error'); ok = false; }
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRe.test(email.value.trim())){ email.classList.add('error'); ok = false; }
    var phoneRe = /^01[0-9]-\d{3,4}-\d{4}$/;
    if(!phoneRe.test(phone.value.trim())){ phone.classList.add('error'); ok = false; }
    if(!consent.checked){ ok = false; consent.parentElement.style.color = '#C24A3A'; }
    else { consent.parentElement.style.color = ''; }

    return ok;
  }

  leadForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validate()) return;
    var submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '처리 중...';

    var payload = {
      name: document.getElementById('fName').value.trim(),
      email: document.getElementById('fEmail').value.trim(),
      phone: document.getElementById('fPhone').value.trim(),
      intent: currentIntent,
      submittedAt: new Date().toISOString()
    };
    // 실제 구현 시 이 지점에서 API/CRM/이메일 발송 서비스로 payload를 전송합니다.
    console.log('lead submitted:', payload);

    setTimeout(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = '신청 완료하기';
      successSub.textContent = copy[currentIntent].success;
      modalForm.classList.add('hide');
      modalSuccess.classList.add('show');
    }, 700);
  });
})();
