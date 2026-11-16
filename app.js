(() => {
  document.querySelectorAll('.copy-email').forEach(button => button.addEventListener('click', async () => {
    const feedback = button.parentElement.querySelector('.copy-feedback');
    let copied = false;
    try { await navigator.clipboard.writeText(button.dataset.email); copied = true; }
    catch {
      const field = document.createElement('textarea');
      field.value = button.dataset.email;
      field.className = 'clipboard-fallback';
      document.body.append(field);
      field.select();
      copied = document.execCommand('copy');
      field.remove();
      button.focus();
    }
    feedback.textContent = copied ? 'Copied.' : 'Select the email address to copy it.';
    setTimeout(() => { feedback.textContent = ''; }, 4000);
  }));
  const dialog = document.getElementById('video-dialog');
  const video = dialog.querySelector('video');
  document.querySelectorAll('.video-trigger').forEach(button => button.addEventListener('click', () => {
    dialog.querySelector('#video-title').textContent = button.dataset.title;
    video.src = button.dataset.video;
    video.poster = button.dataset.poster;
    dialog.querySelector('.video-original').href = button.dataset.video;
    video.querySelectorAll('track').forEach(track => track.remove());
    if (button.dataset.captions) {
      const track = document.createElement('track');
      track.kind = 'captions'; track.srclang = 'en'; track.label = 'English'; track.src = button.dataset.captions;
      video.append(track);
    }
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    video.pause(); video.removeAttribute('src'); video.load(); document.body.classList.remove('dialog-open');
  });
  const expandButton = document.querySelector('.expand-all');
  if (expandButton) expandButton.addEventListener('click', () => {
    const items = [...document.querySelectorAll('.case-scope details')];
    const open = !items.every(item => item.open);
    items.forEach(item => { item.open = open; });
    expandButton.textContent = open ? 'Collapse all −' : 'Expand all +';
    expandButton.setAttribute('aria-expanded', String(open));
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = document.querySelector('.scroll-scene');
  const panels = [...document.querySelectorAll('.scene-panel')];
  const steps = [...document.querySelectorAll('.scene-step')];
  let selected = -1;
  let ticking = false;
  const progressLine = document.createElement('div');
  progressLine.className = 'reading-progress';
  progressLine.setAttribute('aria-hidden','true');
  document.body.append(progressLine);
  const revealTargets = document.querySelectorAll('.project-row,.about-grid,.case-context,.case-scope,.evidence,.recording,.related,.secondary-cover');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    });
  }, {threshold:0.06,rootMargin:'0px 0px -25px 0px'});
  revealTargets.forEach(element => { element.classList.add('reveal-block'); revealObserver.observe(element); });
  document.documentElement.classList.add('motion-ready');
  const updateScene = () => {
    ticking = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressLine.style.transform = `scaleX(${total>0?Math.min(1,window.scrollY/total):0})`;
    if (!scene || reducedMotion.matches) return;
    const top = scene.getBoundingClientRect().top;
    const header = document.querySelector('.site-header').offsetHeight;
    const span = scene.offsetHeight - scene.querySelector('.scene-stage').offsetHeight;
    const progress = Math.max(0,Math.min(1,(header-top)/Math.max(1,span)));
    const section = Math.min(3,Math.floor(progress*4));
    const local = Math.min(1,progress*4-section);
    if (section !== selected) {
      selected = section;
      panels.forEach((panel,index) => {
        const active = index === selected;
        panel.classList.toggle('is-active',active);
        panel.setAttribute('aria-hidden',String(!active));
        panel.inert = !active;
        steps[index].classList.toggle('is-active',active);
        if(active) steps[index].setAttribute('aria-current','step');
        else steps[index].removeAttribute('aria-current');
      });
    }
    panels[section].style.setProperty('--screen-scale',String(1.035-local*.035));
    steps.forEach((step,index)=>step.style.setProperty('--step-progress',String(index<section?1:index===section?local:0)));
  };
  const requestFrame = () => { if(!ticking){ticking=true;requestAnimationFrame(updateScene);} };
  const syncMotion = () => {
    if(scene) scene.classList.toggle('is-static',reducedMotion.matches);
    if(reducedMotion.matches) panels.forEach(panel=>{panel.removeAttribute('aria-hidden');panel.inert=false;});
    else selected = -1;
    requestFrame();
  };
  steps.forEach((button,index)=>button.addEventListener('click',()=>{
    const header = document.querySelector('.site-header').offsetHeight;
    const span = scene.offsetHeight-scene.querySelector('.scene-stage').offsetHeight;
    const top = window.scrollY+scene.getBoundingClientRect().top-header+span*(index/4+.01);
    window.scrollTo({top,behavior:reducedMotion.matches?'auto':'smooth'});
  }));
  window.addEventListener('scroll',requestFrame,{passive:true});
  window.addEventListener('resize',requestFrame,{passive:true});
  reducedMotion.addEventListener('change',syncMotion);
  syncMotion();
})();
