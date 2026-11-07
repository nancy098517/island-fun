/* Local Web Audio effects. No network requests or automatic playback. */
(() => {
  'use strict';
  const KEY = 'island-fun-sound-v1';
  let enabled = true, ctx, master;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch {}
  // Real media playback on iOS; Web Audio can follow the hardware silent switch.
  const mediaMode = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const players = new Map();
  let message;
  function status(text) { if (message) message.textContent = text; }
  function mediaSource(kind) {
    const rate=22050, duration={dice:.09,tick:.045,hit:.18,throw:.23,done:.32}[kind]||.1;
    const length=Math.ceil(rate*duration), data=new ArrayBuffer(44+length*2);
    const view=new DataView(data);
    const str=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
    str(0,'RIFF');view.setUint32(4,36+length*2,true);str(8,'WAVE');str(12,'fmt ');
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
    view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
    str(36,'data');view.setUint32(40,length*2,true);
    let low=0;
    for(let i=0;i<length;i++){
      const t=i/rate, envelope=Math.min(1,t/.004)*Math.exp(-t/(duration/4));
      low=low*.6+(Math.random()*2-1)*.4;
      const wave=kind==='done'?Math.sin(2*Math.PI*(t<.14?660:880)*t):
        kind==='throw'?(Math.random()*2-1)*Math.sin(Math.PI*t/duration):
        kind==='hit'?low+Math.sin(2*Math.PI*110*t)*.5:low;
      view.setInt16(44+i*2,Math.max(-1,Math.min(1,wave*envelope*.7))*32767,true);
    }
    return URL.createObjectURL(new Blob([data],{type:'audio/wav'}));
  }
  function mediaPlay(kind) {
    try {
      let pool=players.get(kind);
      if(!pool){const url=mediaSource(kind);pool=Array.from({length:3},()=>{
        const a=new Audio(url);a.preload='auto';a.volume=.8;return a;
      });players.set(kind,pool);}
      const a=pool.find(a=>a.paused||a.ended)||pool[0];
      a.currentTime=0;
      const playing=a.play();
      if(playing)playing.then(()=>status('')).catch(()=>status('聲音尚未啟用，請點「試聽音效」，並確認媒體音量。'));
    } catch { status('目前無法播放音效，遊戲仍可繼續。'); }
  }
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
      if (ctx.state !== 'running') return ctx.resume().catch(() => {});
    } catch {}
  }
  function play(kind) {
    if (!enabled || document.hidden) return;
    if (mediaMode) { mediaPlay(kind); return; }
    const ready=unlock();
    if (!ctx) { mediaPlay(kind); return; }
    if (ctx.state !== 'running') {
      if(ready)ready.then(()=>{if(enabled&&!document.hidden){
        if(ctx.state==='running')play(kind);else mediaPlay(kind);
      }});
      return;
    }
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
  bar.style.cssText='display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 16px;max-width:1200px;margin:auto';
  const button=document.createElement('button');
  button.type='button';button.className='btn';button.id='sound-toggle';
  function render(){button.textContent=enabled?'🔊 音效：開':'🔇 音效：關';button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'關閉遊戲音效':'開啟遊戲音效');}
  button.onclick=()=>{
    enabled=!enabled;
    if(master)master.gain.value=enabled?0.55:0;
    if(!enabled)for(const pool of players.values())for(const a of pool){a.pause();a.currentTime=0;}
    try{localStorage.setItem(KEY,enabled?'on':'off');}catch{}
    render();if(enabled){unlock();play('done');}
  };
  const test=document.createElement('button');
  test.type='button';test.className='btn';test.id='sound-test';test.textContent='▶ 試聽音效';
  message=document.createElement('span');message.setAttribute('role','status');
  message.style.cssText='font-size:14px;flex-basis:100%;text-align:right';
  test.onclick=()=>{
    enabled=true;try{localStorage.setItem(KEY,'on');}catch{}
    if(master)master.gain.value=.55;
    render();mediaPlay('done');
  };
  render();bar.append(button,test,message);
  (document.querySelector('.site-links') || document.querySelector('header')).after(bar);
  document.addEventListener('click',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)for(const pool of players.values())for(const a of pool)a.pause();
    if(document.hidden&&ctx&&ctx.state==='running')ctx.suspend().catch(()=>{});
  });
})();
