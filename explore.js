/* 島遊趣：三種決策模式。所有預設景點是候選靈感，非已驗證行程。 */
(() => {
'use strict';
const COUNTY = {
 '臺北市':['臺北101','國立故宮博物院','龍山寺','大安森林公園'],
 '新北市':['淡水老街','九份老街','野柳地質公園','鶯歌陶瓷博物館'],
 '基隆市':['基隆廟口','和平島地質公園','正濱漁港','國立海洋科技博物館'],
 '桃園市':['大溪老街','石門水庫','慈湖','小烏來天空步道'],
 '新竹市':['新竹都城隍廟','新竹公園','南寮漁港','新竹市玻璃工藝博物館'],
 '新竹縣':['內灣老街','北埔老街','新瓦屋客家文化保存區','湖口老街'],
 '苗栗縣':['南庄老街','勝興車站','龍騰斷橋','苗栗客家文化園區'],
 '臺中市':['國立臺灣美術館','國立自然科學博物館','臺中國家歌劇院','臺中公園','臺中第二市場','高美濕地','一中商圈','草悟道'],
 '彰化縣':['鹿港老街','鹿港天后宮','八卦山大佛','扇形車庫'],
 '南投縣':['日月潭','車埕車站','中興新村','溪頭自然教育園區'],
 '雲林縣':['北港朝天宮','西螺老街','虎尾糖廠','古坑綠色隧道'],
 '嘉義市':['檜意森活村','嘉義市立美術館','嘉義公園','北門驛'],
 '嘉義縣':['阿里山國家森林遊樂區','故宮南院','奮起湖老街','東石漁人碼頭'],
 '臺南市':['臺南孔廟','莉莉水果店','林百貨','國立臺灣文學館','赤崁樓','安平古堡','神農街','安平樹屋'],
 '高雄市':['駁二藝術特區','旗津','蓮池潭','高雄市立美術館'],
 '屏東縣':['墾丁國家公園','鵝鑾鼻公園','恆春古城','國立海洋生物博物館'],
 '宜蘭縣':['國立傳統藝術中心','礁溪溫泉公園','冬山河親水公園','蘭陽博物館'],
 '花蓮縣':['七星潭','松園別館','鯉魚潭','花蓮文化創意產業園區'],
 '臺東縣':['池上伯朗大道','鹿野高台','鐵花新聚落','臺東森林公園'],
 '澎湖縣':['澎湖天后宮','篤行十村','二崁聚落','澎湖跨海大橋'],
 '金門縣':['莒光樓','水頭聚落','翟山坑道','山后民俗文化村'],
 '連江縣':['南竿媽祖巨神像','北竿芹壁聚落','南竿北海坑道','東引燈塔']
};
const KEY='island-fun-explore-v2';
const $=id=>document.getElementById(id);
const MODES=['adventure','taiwan','county','lunch','lottery','classic'];
const DEFAULT_LUNCH=['礁溪柯家蔥油餅', '熹湯舖子', '好家木瓜牛奶', '縱卝公滷', '京燉滷味', '健身舒肥水煮餐盒', '泓維便當店', 'cama', '露易莎', '星巴克', '蓮尾一鳴 豚骨拉麵專門店', '春水堂', '童話樹簡餐廳', '麥當勞', 'Subway', 'Sukiya'];
let s={mode:'adventure',county:'',campus:'三民校區',routes:{},origins:{},custom:{},lunch:DEFAULT_LUNCH, lunchRevision:2, lottery:{text:'',count:1,result:[]},last:null};
let busy=false;
try {
 const v=JSON.parse(localStorage.getItem(KEY));
 if(v && MODES.includes(v.mode) && (v.county==='' || Object.hasOwn(COUNTY,v.county)) && ['三民校區','民生校區'].includes(v.campus) && Array.isArray(v.lunch) && v.lunch.length>0 && v.lunch.length<=40 && v.lunch.every(x=>typeof x==='string'&&x.length>0&&x.length<=60) && v.routes && typeof v.routes==='object'&&!Array.isArray(v.routes) && Object.values(v.routes).every(r=>Array.isArray(r)&&r.length<=150&&r.every(x=>typeof x?.name==='string'&&x.name.length<=150&&typeof x?.query==='string'&&x.query.length<=250))) s={...s,...v,last:null};
} catch {}
if (!s.custom || typeof s.custom !== 'object' || Array.isArray(s.custom) || !Object.values(s.custom).every(a=>Array.isArray(a)&&a.length>0&&a.length<=150&&a.every(n=>typeof n==='string'&&n.trim()&&n.length<=60))) s.custom={};
if(s.lunchRevision!==2){s.lunch=DEFAULT_LUNCH;s.lunchRevision=2;}
if(!s.lottery || typeof s.lottery.text!=='string'||s.lottery.text.length>20000||!Number.isInteger(s.lottery.count)||s.lottery.count<1||s.lottery.count>200||!Array.isArray(s.lottery.result)||s.lottery.result.length>200||!s.lottery.result.every(x=>typeof x==='string'&&x.length<=80))s.lottery={text:'',count:1,result:[]};
if(!s.origins||typeof s.origins!=='object'||Array.isArray(s.origins)||!Object.values(s.origins).every(x=>IslandTransport.COUNTIES.includes(x)))s.origins={};
if(!s.adventureIntro){s.mode='adventure';s.adventureIntro=true;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(s));$('ex-save').textContent='選擇與各地圖行程已儲存在此瀏覽器。';$('lottery-save').textContent='抽籤設定與上次結果已儲存。';}catch{$('ex-save').textContent='目前無法儲存，離開前請先複製行程。';$('lottery-save').textContent='目前無法儲存，請先複製抽籤結果。';}}
const routeKey=()=>s.mode==='county'?'county:'+s.county:s.mode==='lunch'?'lunch:'+s.campus:'taiwan';
const route=()=>s.routes[routeKey()] || [];
function options(){
 if(s.mode==='county'&&!s.county)return Object.keys(COUNTY).map(name=>({name,query:name}));
 if(s.custom[routeKey()])return s.custom[routeKey()].map(name=>({name,query:s.mode==='lunch'?'國立臺中科技大學 '+s.campus+' 附近 '+name:(s.mode==='county'?s.county+' ':'')+name}));
 if(s.mode==='lunch')return s.lunch.map(name=>({name,query:'國立臺中科技大學 '+s.campus+' 附近 '+name}));
 const counties=s.mode==='county'?[s.county]:Object.keys(COUNTY);
 return counties.flatMap(c=>COUNTY[c].map(name=>({name:s.mode==='taiwan'?c+'・'+name:name,query:c+' '+name})));
}
const candidates=()=>options().filter(x=>!route().some(r=>r.query===x.query));
const mapURL=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q+' 台灣');
function setStatus(t){$('ex-status').textContent=t;}
function markPlace(x){const b=document.createElement('button');b.type='button';b.textContent='在地圖標示';b.onclick=()=>IslandMap.show(x.query,x.name);return b;}
function makeLink(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function render(){
 document.querySelectorAll('[data-ex-mode]').forEach(b=>{const on=b.dataset.exMode===s.mode;b.setAttribute('aria-pressed',String(on));});
 $('classic-game').hidden=s.mode!=='classic';$('ex-play').hidden=['adventure','classic','lottery'].includes(s.mode);$('ex-lottery').hidden=s.mode!=='lottery';
 $('adventure-game').hidden=s.mode!=='adventure';if(s.mode==='adventure'){IslandMap.hide();IslandAdventure.activate();return;}IslandAdventure.deactivate();
 if(s.mode==='lottery'){IslandMap.hide();renderLottery();return;}
 if(s.mode==='classic'){document.dispatchEvent(new Event('island:classic'));return;}
 const countyPick=s.mode==='county'&&!s.county;
 $('ex-county-controls').hidden=s.mode!=='county';$('ex-lunch-controls').hidden=s.mode!=='lunch';
 $('ex-county').value=s.county;
 $('ex-departure').hidden=s.mode==='lunch'||countyPick;$('ex-origin').value=s.origins[routeKey()]||'臺北市';$('ex-origin').disabled=busy;
 $('ex-campus').value=s.campus;$('ex-foods').value=(s.custom[routeKey()]||s.lunch).join('\n');
 $('ex-custom-editor').hidden=countyPick||s.mode==='lunch';$('ex-map-places').value=options().map(x=>x.name).join('\n');
 $('ex-title').textContent=s.mode==='lunch'?'今天中午，吃什麼？':countyPick?'突然放假，去哪個縣市？':s.mode==='county'?s.county+'探索地圖':'今天，遊台灣';
 $('ex-description').textContent=s.mode==='lunch'?'只在中科大所選校區周邊找午餐。預設為你提供的 16 個店家／餐點選項；也能自行輸入、替換整份午餐地圖。':countyPick?'選一種玩法抽縣市，或直接選擇縣市；抽到後就進入當地景點地圖。':s.mode==='county'?'每抽一次決定下一個當地景點或美食，加入你的旅行路線。':'直接從全台候選景點抽下一站；想集中玩同一縣市，請切換「選縣市玩」。';
 const mapPoint=s.last||route().at(-1);IslandMap.show(mapPoint?mapPoint.query:s.mode==='lunch'?'國立臺中科技大學 '+s.campus:s.mode==='county'&&s.county?s.county:'台灣',mapPoint?mapPoint.name:s.mode==='lunch'?'中科大'+s.campus:s.mode==='county'&&s.county?s.county:'台灣');
 const list=candidates();$('ex-count').textContent=`本次候選 ${list.length} 個`;
 $('ex-candidate-list').replaceChildren(...options().map(x=>{const li=document.createElement('li');const i=list.findIndex(v=>v.query===x.query);const b=document.createElement('button');b.type='button';b.textContent=(i<0?'✓ 已加入 · ':`${i+1}. `)+x.name;b.onclick=()=>IslandMap.show(x.query,x.name);li.append(b);li.classList.toggle('ex-visited',i<0);return li;}));
 $('ex-next-label').textContent=countyPick?'先抽縣市':s.mode==='lunch'?'抽今天午餐':'抽下一站';
 $('ex-result').hidden=!s.last;
 if(s.last){$('ex-result-name').textContent=s.last.name;$('ex-result-transport').textContent=s.last.transport?IslandTransport.text(s.last.transport):'';$('ex-result-map').replaceChildren(markPlace(s.last));}
 const r=route();IslandMap.setTrip(s.mode==='lunch'?'中科大'+s.campus+'午餐邀約':s.mode==='county'&&s.county?s.county+'出遊邀約':'我的台灣旅行邀約',r);$('ex-route-title').textContent=s.mode==='lunch'?s.campus+'午餐抽選紀錄':s.mode==='county'&&s.county?s.county+'旅行路線':'我的台灣旅行路線';
 $('ex-route').replaceChildren(...r.map((x,i)=>{const li=document.createElement('li');const title=document.createElement('strong');title.textContent=x.name;li.append(title);if(x.transport){const note=document.createElement('p');note.className='ex-train-note';note.textContent=IslandTransport.text(x.transport);li.append(note);}const links=document.createElement('div');links.className='ex-route-links';links.append(markPlace(x));const del=document.createElement('button');del.type='button';del.textContent='移除';del.setAttribute('aria-label','移除'+x.name);del.onclick=()=>{if(busy)return;s.routes[routeKey()].splice(i,1);s.last=null;render();persist();};links.append(del);li.append(links);return li;}));
 $('ex-empty').hidden=!!r.length;$('ex-copy').disabled=!r.length;$('ex-copy-ai').disabled=!r.length;$('ex-clear').disabled=!r.length;
 $('ex-manual-copy').hidden=true;$('ex-manual-label').hidden=true;
 document.querySelectorAll('[data-draw]').forEach(b=>b.disabled=busy||!list.length);
 if(!busy){$('ex-visual').replaceChildren();drawWheel(list.length?list:[],0);}
}
// 加密亂數加上拒絕取樣，避免候選數不是 6 的倍數時偏向某些選項。
function randomIndex(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}
const svgNS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs){const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;}
function drawWheel(list,rotation){
 const svg=svgEl('svg',{viewBox:'0 0 320 320',role:'img','aria-label':'抽選輪盤，選項詳見下方候選清單'});const g=svgEl('g',{transform:`rotate(${rotation} 160 160)`});svg.append(g);
 if(!list.length){g.append(svgEl('circle',{cx:160,cy:160,r:142,fill:'#d8e6df'}));}
 list.forEach((x,i)=>{const step=360/list.length,a=(i*step-90)*Math.PI/180,b=((i+1)*step-90)*Math.PI/180;const x1=160+142*Math.cos(a),y1=160+142*Math.sin(a),x2=160+142*Math.cos(b),y2=160+142*Math.sin(b);if(list.length===1)g.append(svgEl('circle',{cx:160,cy:160,r:142,fill:'#f2c64f'}));else g.append(svgEl('path',{d:`M160 160 L${x1} ${y1} A142 142 0 ${step>180?1:0} 1 ${x2} ${y2} Z`,fill:['#f4c14b','#8fc5b4','#9bcbdc','#ded3b8'][i%4],stroke:'#fff','stroke-width':1}));const mid=(a+b)/2,t=svgEl('text',{x:160+112*Math.cos(mid),y:164+112*Math.sin(mid),'text-anchor':'middle',fill:'#14304a','font-size':list.length>30?7:12});t.textContent=String(i+1);g.append(t);});
 svg.append(svgEl('circle',{cx:160,cy:160,r:20,fill:'#14304a'}));const pin=svgEl('path',{d:'M150 4 L170 4 L160 28 Z',fill:'#c5402f'});svg.append(pin);$('ex-visual').replaceChildren(svg);
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function draw(method){
 if(busy)return;const list=candidates();if(!list.length)return;
 busy=true;render();const index=randomIndex(list.length);const chosen=list[index];const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const fast=new URLSearchParams(location.search).has('fast');const ms=fast||reduce?0:75;
 try{
  if(method==='wheel'){
   for(let k=0;k<=20;k++){drawWheel(list, k/20*(1080-(index+.5)*360/list.length));await wait(ms);}
   setStatus(`輪盤停在第 ${index+1} 個選項：${chosen.name}`);
  } else if(method==='dart'){
   drawWheel(list,0);const svg=$('ex-visual').querySelector('svg'),angle=((index+.5)*360/list.length-90)*Math.PI/180;
   for(let k=0;k<6;k++){setStatus('瞄準中'+'.'.repeat(k%3+1));await wait(ms*2);}
   const marker=svgEl('text',{x:160+90*Math.cos(angle),y:169+90*Math.sin(angle),'text-anchor':'middle','font-size':30});marker.textContent='🎯';svg.append(marker);setStatus(`飛鏢隨機落在第 ${index+1} 區：${chosen.name}`);
  } else {
   const dice=[];let n=index;let digits=1;while(6**digits<list.length)digits++;for(let k=0;k<digits;k++){dice.unshift(n%6+1);n=Math.floor(n/6);}
   const faces=['⚀','⚁','⚂','⚃','⚄','⚅'];for(let k=0;k<9;k++){const div=document.createElement('div');div.className='ex-dice';div.textContent=Array.from({length:digits},()=>faces[randomIndex(6)]).join(' ');$('ex-visual').replaceChildren(div);await wait(ms);}
   $('ex-visual').firstChild.textContent=dice.map(v=>faces[v-1]).join(' ');setStatus(`骰子編碼 ${dice.join('、')} → 第 ${index+1} 個選項：${chosen.name}（各候選等機率）`);
  }
  if(s.mode==='county'&&!s.county){s.county=chosen.name;s.last=null;busy=false;render();setStatus(`抽到${chosen.name}！現在可繼續抽當地下一站。`);}
  else {const k=routeKey();if(s.mode!=='lunch'){const previous=route().at(-1);const from=previous?IslandTransport.countyOf(previous.query):(s.origins[k]||'臺北市');chosen.transport=IslandTransport.draw(from,IslandTransport.countyOf(chosen.query));}s.routes[k]=[...route(),chosen];s.last=chosen;busy=false;const visual=$('ex-visual').firstChild;render();if(visual)$('ex-visual').replaceChildren(visual);}
  persist();
 } finally {busy=false;document.querySelectorAll('[data-draw]').forEach(b=>b.disabled=!candidates().length);}
}
function copyText(){return `Travel Plan｜${$('ex-route-title').textContent}\n出發地：${s.mode==='lunch'?'國立臺中科技大學 '+s.campus:(s.origins[routeKey()]||'臺北市')}\n\n`+route().map((x,i)=>`${i+1}. ${x.name}\n地圖：${mapURL(x.query)}`).join('\n\n')+'\n\n這是想去的地點清單，尚未依距離排序。可按「複製給 AI 排行程」交給 AI 規劃。';}
function aiText(){return IslandAIPlan.build({origin:s.mode==='lunch'?'國立臺中科技大學 '+s.campus:(s.origins[routeKey()]||'臺北市'),destination:s.mode==='lunch'?'國立臺中科技大學 '+s.campus+'周邊午餐':s.mode==='county'?s.county:'臺灣',places:route()});}
document.querySelectorAll('[data-ex-mode]').forEach(b=>b.onclick=()=>{if(busy)return;s.mode=b.dataset.exMode;s.last=null;render();persist();setStatus('已切換模式。各模式的行程分開保留。');});
document.querySelectorAll('[data-draw]').forEach(b=>b.onclick=()=>draw(b.dataset.draw));
$('ex-origin').replaceChildren(...IslandTransport.COUNTIES.map(x=>new Option(x,x)));$('ex-origin').onchange=e=>{if(busy){e.target.value=s.origins[routeKey()]||'臺北市';return;}const origin=e.target.value;s.origins[routeKey()]=origin;const first=route()[0];if(first){const to=IslandTransport.countyOf(first.query),pool=IslandTransport.choices(origin,to),old=first.transport;first.transport={...(pool.find(t=>t.name===old?.name)||pool[0]),from:origin,to};}s.last=null;render();persist();setStatus('出發地已更新，行程清單保留。');};
$('ex-county').replaceChildren(new Option('讓遊戲決定縣市',''),...Object.keys(COUNTY).map(x=>new Option(x,x)));$('ex-county').onchange=e=>{if(busy){e.target.value=s.county;return;}s.county=e.target.value;s.last=null;render();persist();setStatus(s.county?'已進入'+s.county+'，選一種玩法抽下一站。':'選一種玩法抽縣市。');};
$('ex-reroll-county').onclick=()=>{if(busy)return;s.county='';s.last=null;render();persist();setStatus('選骰子、飛鏢或輪盤，重新決定縣市。');};
$('ex-campus').onchange=e=>{if(busy){e.target.value=s.campus;return;}s.campus=e.target.value;s.last=null;render();persist();};
$('ex-reset-foods').onclick=()=>{if(busy)return;if(confirm('恢復預設 16 個午餐選項，並清除此校區抽選紀錄？')){delete s.custom[routeKey()];s.lunch=DEFAULT_LUNCH;s.routes[routeKey()]=[];s.last=null;render();persist();setStatus('已恢復 16 個午餐預設選項。');}};
$('ex-save-foods').onclick=()=>{if(busy)return;const list=[...new Set($('ex-foods').value.split('\n').map(x=>x.trim()).filter(Boolean))];if(!list.length||list.length>40||list.some(x=>x.length>60)){setStatus('請輸入 1～40 個午餐選項，每行一個，每項最多 60 字。');return;}if(route().length&&!confirm('更新午餐地圖會清除這個校區目前的抽選紀錄，是否套用？'))return;s.custom[routeKey()]=list;s.routes[routeKey()]=[];s.last=null;render();persist();setStatus('午餐選項已更新，地圖會抽你輸入的餐點或店家。');};
$('ex-apply-map').onclick=()=>{if(busy)return;const list=[...new Set($('ex-map-places').value.split('\n').map(x=>x.trim()).filter(Boolean))];if(!list.length||list.length>150||list.some(n=>n.length>60)){setStatus('請輸入 1～150 個地點，每行一個，每項最多 60 字。');return;}if(route().length&&!confirm('替換地圖會清除這張地圖的抽選紀錄，是否套用？'))return;s.custom[routeKey()]=list;s.routes[routeKey()]=[];s.last=null;render();persist();setStatus('地圖已替換。接下來只會抽到你輸入的地點。');};
$('ex-default-map').onclick=()=>{if(busy)return;if(confirm('恢復預設地點並清除此地圖抽選紀錄？')){delete s.custom[routeKey()];s.routes[routeKey()]=[];s.last=null;render();persist();setStatus('已恢復預設地圖。');}};
$('ex-clear').onclick=()=>{if(busy)return;if(confirm('要清除此地圖的抽選紀錄並重新開始嗎？請先複製需要保留的行程。')){s.routes[routeKey()]=[];s.last=null;render();persist();setStatus('此地圖已重新開始。');}};
async function copyRoute(text){try{await navigator.clipboard.writeText(text);setStatus('已複製，可貼到 AI、LINE 或筆記。');}catch{$('ex-manual-copy').value=text;$('ex-manual-copy').hidden=false;$('ex-manual-label').hidden=false;$('ex-manual-copy').focus();$('ex-manual-copy').select();setStatus('請手動複製下方行程文字。');}}
$('ex-copy').onclick=()=>copyRoute(copyText());$('ex-copy-ai').onclick=()=>copyRoute(aiText());

function renderLottery(){
 $('lottery-values').value=s.lottery.text;$('lottery-count').value=s.lottery.count;
 $('lottery-results').replaceChildren(...s.lottery.result.map(x=>{const li=document.createElement('li');li.textContent=x;return li;}));
 $('lottery-copy').disabled=!s.lottery.result.length;$('lottery-fallback').hidden=true;$('lottery-copy-label').hidden=true;
}
$('lottery-values').addEventListener('input',()=>{s.lottery.text=$('lottery-values').value.slice(0,20000);s.lottery.result=[];$('lottery-results').replaceChildren();$('lottery-copy').disabled=true;$('lottery-fallback').hidden=true;$('lottery-copy-label').hidden=true;$('lottery-status').textContent='選項已更新，請開始新一輪抽籤。';persist();});
$('lottery-count').addEventListener('input',()=>{const n=Number($('lottery-count').value);if(Number.isInteger(n)&&n>=1&&n<=200){s.lottery.count=n;persist();}});
$('lottery-start').onclick=async()=>{
 if(busy)return;const raw=$('lottery-values').value;const list=[...new Set(raw.split('\n').map(x=>x.trim()).filter(Boolean))];const count=Number($('lottery-count').value);
 if(raw.length>20000||!list.length||list.length>200||list.some(x=>x.length>80)){$('lottery-status').textContent='請輸入 1～200 個選項，每行一個，每項最多 80 字。';return;}
 if(!Number.isInteger(count)||count<1||count>list.length){$('lottery-status').textContent=`請輸入 1～${list.length} 的整數；抽出數量不可超過不重複選項數。`;return;}
 busy=true;$('lottery-start').disabled=true;$('lottery-copy').disabled=true;$('lottery-status').textContent='抽籤中…';
 try{const pool=[...list],result=[];for(let i=0;i<count;i++){const n=randomIndex(pool.length);result.push(pool.splice(n,1)[0]);}await wait(new URLSearchParams(location.search).has('fast')?0:500);s.lottery={text:raw,count,result};renderLottery();$('lottery-status').textContent=`從 ${list.length} 個不重複選項中抽出 ${count} 個。`;persist();}
 finally{busy=false;$('lottery-start').disabled=false;}
};
$('lottery-copy').onclick=async()=>{const text='《島遊趣》抽籤結果\n'+s.lottery.result.map((x,i)=>`${i+1}. ${x}`).join('\n');try{await navigator.clipboard.writeText(text);$('lottery-status').textContent='抽籤結果已複製。';}catch{$('lottery-fallback').value=text;$('lottery-fallback').hidden=false;$('lottery-copy-label').hidden=false;$('lottery-fallback').focus();$('lottery-fallback').select();$('lottery-status').textContent='請手動複製下方結果。';}};

render();persist();
})();
