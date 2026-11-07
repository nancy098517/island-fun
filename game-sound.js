/* Local Web Audio effects. No network requests or automatic playback. */
(() => {
  'use strict';
  const KEY = 'island-fun-sound-v1';
  let enabled = true, ctx, master;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch {}
  function unlock() {
    if (!enabled) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!ctx) {
        ctx = new Audio();
        master = ctx.createGain();
        master.gain.value = 0.55;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    } catch {}
  }
  function play(kind) {
    if (!enabled || document.hidden) return;
    unlock();
    if (!ctx || ctx.state !== 'running') return;
    try {
      const now = ctx.currentTime;
      const noise = ['dice', 'tick', 'hit', 'throw'].includes(kind);
      const duration = {dice:0.065,tick:0.025,hit:0.15,throw:0.19,done:0.24}[kind] || 0.08;
      const source = noise ? ctx.createBufferSource() : ctx.createOscillator();
      const gain = ctx.createGain(), filter = ctx.createBiquadFilter();
      if (noise) {
        const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
        source.buffer = buffer;
        filter.type = kind === 'throw' ? 'bandpass' : 'lowpass';
        filter.frequency.setValueAtTime({dice:1800,tick:2800,hit:400,throw:2600}[kind],now);
        if (kind === 'throw') filter.frequency.exponentialRampToValueAtTime(700,now+duration);
      } else {
        source.type = 'sine';
        source.frequency.setValueAtTime(660,now);
        source.frequency.setValueAtTime(880,now+0.09);
        filter.frequency.value=4000;
      }
      gain.gain.setValueAtTime(0.001,now);
      gain.gain.linearRampToValueAtTime(kind==='throw'?0.12:0.24,now+0.004);
      gain.gain.exponentialRampToValueAtTime(0.001,now+duration);
      source.connect(filter);filter.connect(gain);gain.connect(master);
      source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
      source.start(now);source.stop(now+duration+0.01);
    } catch { /* Audio failure must never interrupt a draw. */ }
  }
  window.IslandSound = {unlock,play};
  const bar=document.createElement('div');
  bar.style.cssText='display:flex;justify-content:flex-end;padding:8px 16px;max-width:1200px;margin:auto';
  const button=document.createElement('button');
  button.type='button';button.className='btn';button.id='sound-toggle';
  function render(){button.textContent=enabled?'🔊 音效：開':'🔇 音效：關';button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'關閉遊戲音效':'開啟遊戲音效');}
  button.onclick=()=>{
    enabled=!enabled;
    if(master)master.gain.value=enabled?0.55:0;
    try{localStorage.setItem(KEY,enabled?'on':'off');}catch{}
    render();if(enabled){unlock();play('done');}
  };
  render();bar.append(button);
  (document.querySelector('.site-links') || document.querySelector('header')).after(bar);
  document.addEventListener('click',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&ctx&&ctx.state==='running')ctx.suspend().catch(()=>{});
  });
})();
