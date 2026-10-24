/* 同一遊戲內分頁，切頁保留進度。 */
(()=>{'use strict';const $=id=>document.getElementById(id);let mode=document.querySelector('[data-ex-mode][aria-pressed=true]')?.dataset.exMode||'adventure',view='play';
const nav=document.createElement('nav');nav.className='workspace-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','目前遊戲的操作分頁');
const labels={play:'🎲 玩遊戲',map:'📍 看地圖',custom:'✏️ 自訂地點',plan:'🎒 行程分享'};
for(const [k,t]of Object.entries(labels)){const b=document.createElement('button');b.type='button';b.id='view-tab-'+k;b.textContent=t;b.dataset.view=k;b.setAttribute('role','tab');b.onclick=()=>show(k);nav.append(b);}
const modeNav=document.querySelector('[data-ex-mode]').parentElement;modeNav.after(nav);
const panels={};for(const k of ['map','custom','plan']){const n=document.createElement('section');n.id='view-panel-'+k;n.className='explorer workspace-panel';n.setAttribute('role','tabpanel');n.setAttribute('aria-labelledby','view-tab-'+k);n.hidden=true;panels[k]=n;$('unified-plan').before(n);}
function move(id,parent){const n=$(id);if(n)parent.append(n);}
const advMap=document.querySelector('.adv-map-card');panels.map.append(advMap);move('map-area',panels.map);const candidates=document.querySelector('.ex-map-panel');panels.map.append(candidates);
const advEdit=$('adv-custom-editor');panels.custom.append(advEdit);const exEdit=$('ex-custom-editor');exEdit.open=true;panels.custom.append(exEdit);
const lunchEdit=$('ex-foods').closest('details');lunchEdit.open=true;const lunchTitle=document.createElement('h2');lunchTitle.id='lunch-custom-title';lunchTitle.textContent=$('ex-campus').selectedOptions[0]?.textContent+'・自訂午餐';lunchEdit.querySelector('summary').after(lunchTitle);panels.custom.append(lunchEdit);
const classicEdit=document.createElement('section');classicEdit.className='panel';classicEdit.innerHTML='<h2>自訂地點</h2><p>替換經典環島棋盤上的景點格，套用後會重玩。</p>';move('place-form',classicEdit);move('reset-board',classicEdit);move('plan-status',classicEdit);panels.custom.append(classicEdit);const feedback=document.createElement('p');feedback.id='ex-custom-status';feedback.setAttribute('role','status');panels.custom.append(feedback);
const lotteryHint=document.createElement('section');lotteryHint.className='panel';lotteryHint.innerHTML='<h2>自訂抽籤選項</h2><p>請回到「玩遊戲」，每行輸入一個選項，再按開始抽籤。</p><button class="btn" type="button">前往輸入選項</button>';lotteryHint.querySelector('button').onclick=()=>{show('play');$('lottery-values').focus();};panels.custom.append(lotteryHint);
move('unified-plan',panels.plan);const guide=document.createElement('p');guide.className='panel';guide.innerHTML='<strong>兩步交給 Gemini 排行程</strong><br>① 按「複製行程 → 開啟 Gemini」　② 在 Gemini 貼上，再送出。<br>行程會帶入所選出發地與地點；其他需求直接在 Gemini 補充。';panels.plan.prepend(guide);
const mapHint=document.createElement('p');mapHint.className='panel';mapHint.textContent='先抽出地點，或輸入店名／地址查詢位置，再選擇正確的搜尋結果。';panels.map.prepend(mapHint);
const customHint=document.createElement('p');customHint.className='panel';customHint.textContent='請先在「玩遊戲」選定縣市，再自訂地點。';panels.custom.append(customHint);
function show(k){const previous=view;view=k;document.body.dataset.workspaceView=k;for(const b of nav.children){const on=b.dataset.view===k;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;}for(const [key,n]of Object.entries(panels))n.hidden=key!==k;
advMap.hidden=mode!=='adventure';$('map-area').hidden=mode==='adventure';candidates.hidden=!['taiwan','county','lunch'].includes(mode);mapHint.hidden=mode==='adventure';
advEdit.hidden=mode!=='adventure';lunchEdit.hidden=mode!=='lunch';classicEdit.hidden=mode!=='classic';lotteryHint.hidden=mode!=='lottery';exEdit.hidden=!['county','taiwan'].includes(mode)||(mode==='county'&&$('ex-county').value==='');customHint.hidden=!(mode==='county'&&exEdit.hidden);
if(k==='map'&&mode==='lottery'&&previous!=='map'){const first=$('lottery-values').value.split('\n').map(x=>x.trim()).find(Boolean);IslandLocations.show(first?first+' 台灣':'台灣',first||'自訂地點');}if(k==='map'&&mode!=='adventure')$('google-place-map').hidden=false;if(k==='plan')IslandPlanActions.refresh();}
nav.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const keys=Object.keys(labels),i=keys.indexOf(view),next=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;show(keys[next]);nav.children[next].focus();};
const setMode=IslandPlanActions.setMode;IslandPlanActions.setMode=next=>{const changed=next!==mode;mode=next;setMode(next);show(changed?'play':view);};
window.IslandWorkspace={show};show('play');})();
