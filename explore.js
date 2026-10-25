/* 島遊趣：三種決策模式。所有預設景點是候選靈感，非已驗證行程。 */
(() => {
'use strict';
if(!window.IslandFoodAudit)return;
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
// 補充具名景點供抽選；沒有座標的候選只提供搜尋，不變更城市冒險地圖。
const spotAliases={'正濱漁港彩色屋':'正濱漁港','基隆廟口夜市':'基隆廟口','新竹城隍廟口商圈':'新竹都城隍廟','八卦山大佛風景區':'八卦山大佛','日月潭國家風景區':'日月潭','伯朗大道':'池上伯朗大道','鵝鑾鼻燈塔':'鵝鑾鼻公園','芹壁聚落':'北竿芹壁聚落','北海坑道':'南竿北海坑道'};
for(const [county,names]of Object.entries(IslandLunch.extraSpots)){for(const raw of names){const name=spotAliases[raw]||raw;if(!COUNTY[county].includes(name))COUNTY[county].push(name);}}
const cultureMeta={};
for(const [county,groups]of Object.entries(IslandLunch.culture)){groups.forEach((names,i)=>names.forEach(raw=>{const name=({'三義木雕老街':'三義木雕街','芹壁聚落老街':'北竿芹壁聚落','聖母山莊國家步道（抹茶山）':'抹茶山（聖母山莊）'})[raw]||raw;if(!COUNTY[county].includes(name))COUNTY[county].push(name);const key=county+' '+name;const meta=cultureMeta[key]||(cultureMeta[key]={categories:[],provided:true});meta.categories.push(['museum','art','library','trail','street'][i]);}));}
const KEY='island-fun-explore-v2';
const $=id=>document.getElementById(id);
const MODES=['short','adventure','taiwan','county','lunch','lottery','classic'];
const DEFAULT_LUNCH=['礁溪柯家蔥油餅', '熹湯鋪子【台中中華店】', '好家木瓜牛奶', '縱卝公滷', '京燉滷味', '健身舒肥水煮餐盒', '泓維便當店', 'cama', '露易莎', '星巴克', '蓮尾一鳴 豚骨拉麵專門店', '春水堂', '童話樹簡餐廳', '麥當勞', 'Subway', 'Sukiya'];
let s={mode:'short',county:'',campus:'三民校區',routes:{},origins:{},custom:{},lunch:DEFAULT_LUNCH, lunchRevision:2, lottery:{text:'',count:1,result:[]},last:null};
let busy=false;
try {
 const v=JSON.parse(localStorage.getItem(KEY));
 if(v && MODES.includes(v.mode) && (v.county==='' || Object.hasOwn(COUNTY,v.county)) && Object.hasOwn(IslandLunch.campuses,v.campus) && Array.isArray(v.lunch) && v.lunch.length>0 && v.lunch.length<=40 && v.lunch.every(x=>typeof x==='string'&&x.length>0&&x.length<=60) && v.routes && typeof v.routes==='object'&&!Array.isArray(v.routes) && Object.values(v.routes).every(r=>Array.isArray(r)&&r.length<=150&&r.every(x=>typeof x?.name==='string'&&x.name.length<=150&&typeof x?.query==='string'&&x.query.length<=250))) s={...s,...v,last:null};
} catch {}
if (!s.custom || typeof s.custom !== 'object' || Array.isArray(s.custom) || !Object.values(s.custom).every(a=>Array.isArray(a)&&a.length>0&&a.length<=150&&a.every(n=>typeof n==='string'&&n.trim()&&n.length<=60))) s.custom={};
if(s.lunchRevision!==2){s.lunch=DEFAULT_LUNCH;s.lunchRevision=2;}
if(!s.lottery || typeof s.lottery.text!=='string'||s.lottery.text.length>20000||!Number.isInteger(s.lottery.count)||s.lottery.count<1||s.lottery.count>200||!Array.isArray(s.lottery.result)||s.lottery.result.length>200||!s.lottery.result.every(x=>typeof x==='string'&&x.length<=80))s.lottery={text:'',count:1,result:[]};
if(!s.origins||typeof s.origins!=='object'||Array.isArray(s.origins)||!Object.values(s.origins).every(x=>IslandTransport.COUNTIES.includes(x)))s.origins={};
if(!['all','museum','art','library','trail','street'].includes(s.category))s.category='all';
if(!s.finished||typeof s.finished!=='object'||Array.isArray(s.finished))s.finished={};
if(!s.adventureIntro){s.mode='short';s.adventureIntro=true;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(s));$('ex-save').textContent='選擇與各地圖行程已儲存在此瀏覽器。';$('lottery-save').textContent='抽籤設定與上次結果已儲存。';}catch{$('ex-save').textContent='目前無法儲存，離開前請先複製行程。';$('lottery-save').textContent='目前無法儲存，請先複製抽籤結果。';}}
const routeKey=()=>s.mode==='county'?'county:'+s.county:s.mode==='lunch'?'lunch:'+s.campus:'taiwan';
const route=()=>s.routes[routeKey()] || [];
const lunchCampus=()=>IslandLunch.campuses[s.campus];
const lunchLabel=()=>lunchCampus().label;
const lunchQuery=()=>lunchCampus().city+' '+lunchCampus().query;
const lunchDefaults=()=>[...new Set((IslandLunch.shops[s.campus]||[]).filter(p=>p.scope!=='extended'||s.includeExtended===true).map(p=>p.name))];
const lunchPlaceQuery=name=>{const p=IslandLunch.findShop(s.campus,name);if(p)return [p.address||p.area,p.name].filter(Boolean).join(' ');return IslandLunch.addresses[name]?IslandLunch.addresses[name]+' '+name:lunchQuery()+' 附近 '+name;};
// 依提供的店家截圖更正舊名稱，保留既有選項與抽選紀錄。
const correctName=n=>['熹湯舖子','熹湯鋪子'].includes(n)?'熹湯鋪子【台中中華店】':n;
s.lunch=s.lunch.map(correctName);for(const k of ['lunch:三民校區','lunch:民生校區']){if(s.custom[k])s.custom[k]=s.custom[k].map(correctName);if(s.routes[k])s.routes[k]=s.routes[k].map(p=>correctName(p.name)!==p.name?{...p,name:correctName(p.name),query:IslandLunch.addresses[correctName(p.name)]+' '+correctName(p.name)}:p);}

// 舊版預設的餐點種類不再混入真實店家抽選；保留自行編輯的清單。
if(s.realFoodRevision!==1){for(const campus of Object.keys(IslandLunch.shops)){const key='lunch:'+campus,a=s.custom[key];if(a&&a.length===IslandLunch.starter.length&&a.every((n,i)=>n===IslandLunch.starter[i]))delete s.custom[key];if(!s.custom[key]&&s.routes[key])s.routes[key]=s.routes[key].filter(p=>!IslandLunch.starter.includes(p.name));}s.realFoodRevision=1;}
function lunchPlace(name){const p=IslandLunch.findShop(s.campus,name);return {name,query:lunchPlaceQuery(name),...(p?{dish:p.dish,area:p.area,address:p.address,scope:p.scope,note:p.note,source:p.source,provided:!!p.provided}:{})};}
function shopInfo(x){const p=document.createElement('p');p.className='shop-info';p.textContent=[x.dish,x.area,x.note].filter(Boolean).join(' · ');if(x.scope==='extended')p.append(' · 市區延伸，另查交通');if(x.source){const a=makeLink('資料來源',x.source);p.append(' ',a);}return p;}
function options(ignoreFilter=false){
 if(s.mode==='county'&&!s.county)return Object.keys(COUNTY).map(name=>({name,query:name}));
 if(s.custom[routeKey()])return s.custom[routeKey()].map(name=>s.mode==='lunch'?lunchPlace(name):{name,query:(s.mode==='county'?s.county+' ':'')+name});
 if(s.mode==='lunch')return lunchDefaults().map(lunchPlace);
 const counties=s.mode==='county'?[s.county]:Object.keys(COUNTY);
 return counties.flatMap(c=>COUNTY[c].map(name=>{const query=c+' '+name,m=cultureMeta[query];return {name:s.mode==='taiwan'?c+'・'+name:name,query,...(m?{categories:m.categories,provided:true,area:m.categories.map(k=>IslandLunch.categoryLabels[k]).join('／'),note:m.categories.includes('trail')?'使用者提供，名稱與路線待確認；出發前請查開放、天候與申請資訊。':'使用者提供，地點名稱、類別、地址及開放狀況待確認。'}:{})};})).filter(p=>ignoreFilter||s.category==='all'||p.categories?.includes(s.category));
}
const candidates=()=>options().filter(x=>!route().some(r=>r.query===x.query));
const mapURL=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q+' 台灣');
function setStatus(t){$('ex-status').textContent=t;if($('ex-custom-status'))$('ex-custom-status').textContent=t;}
function markPlace(x){const b=document.createElement('button');b.type='button';b.textContent='在地圖標示';b.onclick=()=>IslandMap.show(x.query,x.name,true);return b;}
function makeLink(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function render(){
 if(window.IslandPlanActions)IslandPlanActions.setMode(s.mode);
 document.querySelectorAll('[data-ex-mode]').forEach(b=>{const on=b.dataset.exMode===s.mode;b.setAttribute('aria-pressed',String(on));});
 $('classic-game').hidden=s.mode!=='classic';$('ex-play').hidden=['short','adventure','classic','lottery'].includes(s.mode);$('ex-lottery').hidden=s.mode!=='lottery';
 $('short-trip').hidden=s.mode!=='short';if(s.mode==='short'){$('adventure-game').hidden=true;IslandAdventure.deactivate();IslandMap.hide();IslandQuickTrip.activate();return;}
 $('adventure-game').hidden=s.mode!=='adventure';if(s.mode==='adventure'){IslandMap.hide();IslandAdventure.activate();return;}IslandAdventure.deactivate();
 if(s.mode==='lottery'){IslandMap.hide();renderLottery();return;}
 if(s.mode==='classic'){document.dispatchEvent(new Event('island:classic'));return;}
 const countyPick=s.mode==='county'&&!s.county;
 $('ex-county-controls').hidden=s.mode!=='county';$('ex-lunch-controls').hidden=s.mode!=='lunch';
 $('ex-county').value=s.county;$('ex-category-controls').hidden=!['taiwan','county'].includes(s.mode)||countyPick;$('ex-category').value=s.custom[routeKey()]?'all':s.category;$('ex-category').disabled=busy||!!s.custom[routeKey()];$('ex-category-note').textContent=s.custom[routeKey()]?'目前使用自訂清單，類別篩選暫停；自訂內容完整保留。':'新增名單為使用者提供的候選，並非已查核場館清冊。步道請先確認開放、天候與申請資訊。';
 $('ex-departure').hidden=s.mode==='lunch'||countyPick;$('ex-origin').value=s.origins[routeKey()]||'臺北市';$('ex-origin').disabled=busy;
 $('ex-campus').value=s.campus;$('ex-reset-foods').textContent='恢復此校區預設 '+lunchDefaults().length+' 家／選項';if($('lunch-custom-title'))$('lunch-custom-title').textContent=lunchLabel()+'・自訂午餐';$('ex-include-extended').checked=s.includeExtended===true;$('ex-include-extended').disabled=busy||!!s.custom[routeKey()];$('ex-lunch-note').textContent=s.custom[routeKey()]?'目前使用你儲存的自訂名單，未自動刪除舊項目。可自行編輯，或先保存行程後恢復校區預設。':'目前預設只使用有店名／地址來源的候選，並非即時營業確認；含小吃、飲料及甜點，午餐供餐時段請另查。市區延伸選項預設不納入。';$('ex-foods').value=(s.custom[routeKey()]||lunchDefaults()).join('\n');
 $('ex-custom-editor').hidden=countyPick||s.mode==='lunch';$('ex-map-places').value=options(true).map(x=>x.name).join('\n');
 $('ex-title').textContent=s.mode==='lunch'?'午餐吃什麼？':countyPick?'突然放假，去哪個縣市？':s.mode==='county'?s.county+'探索地圖':'今天，遊台灣';
 $('ex-description').textContent=s.mode==='lunch'?'以'+lunchLabel()+'為搜尋範圍。'+'先從有地址來源的名單抽選，看看今天去哪家吃。'+' 各校區的清單與紀錄分開保留。':countyPick?'選一種玩法抽縣市，或直接選擇縣市；抽到後就進入當地景點地圖。':s.mode==='county'?'每抽一次決定下一個當地景點或美食，加入你的旅行路線。':'直接從全台候選景點抽下一站；想集中玩同一縣市，請切換「選縣市玩」。';
 const mapPoint=s.last||route().at(-1);IslandMap.show(mapPoint?mapPoint.query:s.mode==='lunch'?lunchQuery():s.mode==='county'&&s.county?s.county:'台灣',mapPoint?mapPoint.name:s.mode==='lunch'?lunchLabel():s.mode==='county'&&s.county?s.county:'台灣');
 const list=candidates();$('ex-count').textContent=`本次候選 ${list.length} 個`;
 $('ex-candidate-list').replaceChildren(...options().map(x=>{const li=document.createElement('li');const i=list.findIndex(v=>v.query===x.query);const b=document.createElement('button');b.type='button';b.textContent=(i<0?'✓ 已加入 · ':`${i+1}. `)+x.name;b.onclick=()=>IslandMap.show(x.query,x.name,true);li.append(b);if(x.dish||x.provided)li.append(shopInfo(x));li.append(makeLink('Google 地圖檢視 ↗',mapURL(x.query)));li.classList.toggle('ex-visited',i<0);return li;}));
 $('ex-next-label').textContent=countyPick?'先抽縣市':s.mode==='lunch'?'抽今天午餐':'抽下一站';
 $('ex-result').hidden=!s.last;
 if(s.last){$('ex-result-name').textContent=s.last.name;$('ex-result-transport').textContent=s.last.transport?IslandTransport.text(s.last.transport):'';$('ex-result-map').replaceChildren(...((s.mode==='lunch'||s.last.provided)?[shopInfo(s.last)]:[]),markPlace(s.last));}
 const r=route();IslandMap.setTrip(s.mode==='lunch'?lunchLabel()+'午餐邀約':s.mode==='county'&&s.county?s.county+'出遊邀約':'我的台灣旅行邀約',r);$('ex-route-title').textContent=s.mode==='lunch'?lunchLabel()+'午餐抽選紀錄':s.mode==='county'&&s.county?s.county+'旅行路線':'我的台灣旅行路線';
 $('ex-route').replaceChildren(...r.map((x,i)=>{const li=document.createElement('li');const title=document.createElement('strong');title.textContent=x.name;li.append(title);if(x.dish||x.provided)li.append(shopInfo(x));if(x.transport){const note=document.createElement('p');note.className='ex-train-note';note.textContent=IslandTransport.text(x.transport);li.append(note);}const links=document.createElement('div');links.className='ex-route-links';links.append(markPlace(x),makeLink('Google 地圖檢視 ↗',mapURL(x.query)));const del=document.createElement('button');del.type='button';del.textContent='移除';del.setAttribute('aria-label','移除'+x.name);del.onclick=()=>{if(busy)return;s.routes[routeKey()].splice(i,1);s.last=null;render();persist();};links.append(del);li.append(links);return li;}));
 $('ex-empty').hidden=!!r.length;$('ex-copy').disabled=!r.length;$('ex-copy-ai').disabled=!r.length;$('ex-gemini').disabled=!r.length;$('ex-clear').disabled=!r.length&&!s.finished[routeKey()];
 $('ex-manual-copy').hidden=true;$('ex-manual-label').hidden=true;
 document.querySelectorAll('[data-draw]').forEach(b=>b.disabled=busy||!!s.finished[routeKey()]||!list.length);
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
 if(busy||s.finished[routeKey()])return;const list=candidates();if(!list.length)return;
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
 } finally {busy=false;document.querySelectorAll('[data-draw]').forEach(b=>b.disabled=!!s.finished[routeKey()]||!candidates().length);}
}
function copyText(){return `Travel Plan｜${$('ex-route-title').textContent}\n出發地：${s.mode==='lunch'?lunchQuery():(s.origins[routeKey()]||'臺北市')}\n\n`+route().map((x,i)=>`${i+1}. ${x.name}\n地圖：${mapURL(x.query)}`).join('\n\n')+'\n\n這是想去的地點清單，尚未依距離排序。可按「複製給 AI 排行程」交給 AI 規劃。';}
function aiText(){return IslandAIPlan.build({origin:s.mode==='lunch'?lunchQuery():(s.origins[routeKey()]||'臺北市'),destination:s.mode==='lunch'?lunchQuery()+'周邊午餐':s.mode==='county'?s.county:'臺灣',places:route()});}
document.querySelectorAll('[data-ex-mode]').forEach(b=>b.onclick=()=>{if(busy)return;s.mode=b.dataset.exMode;s.last=null;render();persist();setStatus('已切換模式。各模式的行程分開保留。');});
document.querySelectorAll('[data-draw]').forEach(b=>b.onclick=()=>draw(b.dataset.draw));
$('ex-origin').replaceChildren(...IslandTransport.COUNTIES.map(x=>new Option(x,x)));$('ex-origin').onchange=e=>{if(busy){e.target.value=s.origins[routeKey()]||'臺北市';return;}const origin=e.target.value;s.origins[routeKey()]=origin;const first=route()[0];if(first){const to=IslandTransport.countyOf(first.query),pool=IslandTransport.choices(origin,to),old=first.transport;first.transport={...(pool.find(t=>t.name===old?.name)||pool[0]),from:origin,to};}s.last=null;render();persist();setStatus('出發地已更新，行程清單保留。');};
$('ex-county').replaceChildren(new Option('讓遊戲決定縣市',''),...Object.keys(COUNTY).map(x=>new Option(x,x)));$('ex-county').onchange=e=>{if(busy){e.target.value=s.county;return;}s.county=e.target.value;s.last=null;render();persist();setStatus(s.county?'已進入'+s.county+'，選一種玩法抽下一站。':'選一種玩法抽縣市。');};
$('ex-reroll-county').onclick=()=>{if(busy)return;s.county='';s.last=null;render();persist();setStatus('選骰子、飛鏢或輪盤，重新決定縣市。');};
$('ex-campus').replaceChildren(...Object.entries(IslandLunch.campuses).map(([key,c])=>new Option(c.label,key)));
$('ex-category').onchange=e=>{if(busy){e.target.value=s.category;return;}s.category=e.target.value;s.last=null;render();persist();setStatus('已切換抽選類型，既有行程保留。');};
$('ex-campus').onchange=e=>{if(busy){e.target.value=s.campus;return;}s.campus=e.target.value;s.last=null;render();persist();};
$('ex-include-extended').onchange=()=>{s.includeExtended=$('ex-include-extended').checked;render();persist();setStatus('預設候選已更新，既有行程保留。');};
$('ex-reset-foods').onclick=()=>{if(busy)return;if(confirm('恢復此校區預設午餐選項，並清除此校區抽選紀錄？')){delete s.custom[routeKey()];if(['三民校區','民生校區'].includes(s.campus))s.lunch=DEFAULT_LUNCH;s.routes[routeKey()]=[];delete s.finished[routeKey()];s.last=null;render();persist();setStatus('已恢復此校區的 '+lunchDefaults().length+' 個午餐選項。');}};
$('ex-merge-foods').onclick=()=>{if(busy)return;const old=$('ex-foods').value.split('\n').map(x=>x.trim()).filter(Boolean),merged=[...new Set([...old,...lunchDefaults()])];if(merged.length>40){setStatus('合併後超過 40 個選項，請先刪減清單。');return;}$('ex-foods').value=merged.join('\n');setStatus('已把目前可用的預設店家加入輸入框；按「儲存午餐選項」才會套用。');IslandPlanActions.refresh();};
$('ex-save-foods').onclick=()=>{if(busy)return;const list=[...new Set($('ex-foods').value.split('\n').map(x=>x.trim()).filter(Boolean))];if(!list.length||list.length>40||list.some(x=>x.length>60)){setStatus('請輸入 1～40 個午餐選項，每行一個，每項最多 60 字。');return;}if(route().length&&!confirm('更新午餐地圖會清除這個校區目前的抽選紀錄，是否套用？'))return;s.custom[routeKey()]=list;s.routes[routeKey()]=[];delete s.finished[routeKey()];s.last=null;render();persist();setStatus('午餐選項已更新，地圖會抽你輸入的餐點或店家。');};
$('ex-apply-map').onclick=()=>{if(busy)return;const list=[...new Set($('ex-map-places').value.split('\n').map(x=>x.trim()).filter(Boolean))];if(!list.length||list.length>150||list.some(n=>n.length>60)){setStatus('請輸入 1～150 個地點，每行一個，每項最多 60 字。');return;}if(route().length&&!confirm('替換地圖會清除這張地圖的抽選紀錄，是否套用？'))return;s.custom[routeKey()]=list;s.routes[routeKey()]=[];delete s.finished[routeKey()];s.last=null;render();persist();setStatus('地圖已替換。接下來只會抽到你輸入的地點。');};
$('ex-default-map').onclick=()=>{if(busy)return;if(confirm('恢復預設地點並清除此地圖抽選紀錄？')){delete s.custom[routeKey()];s.routes[routeKey()]=[];delete s.finished[routeKey()];s.last=null;render();persist();setStatus('已恢復預設地圖。');}};
$('ex-clear').onclick=()=>{if(busy)return;if(confirm('要清除此地圖的抽選紀錄並重新開始嗎？請先複製需要保留的行程。')){s.routes[routeKey()]=[];delete s.finished[routeKey()];s.last=null;render();persist();setStatus('此地圖已重新開始。');}};
async function copyRoute(text){try{await navigator.clipboard.writeText(text);setStatus('已複製，可貼到 AI、LINE 或筆記。');}catch{$('ex-manual-copy').value=text;$('ex-manual-copy').hidden=false;$('ex-manual-label').hidden=false;$('ex-manual-copy').focus();$('ex-manual-copy').select();setStatus('請手動複製下方行程文字。');}}
$('ex-copy').onclick=()=>copyRoute(copyText());$('ex-copy-ai').onclick=()=>copyRoute(aiText());$('ex-gemini').onclick=()=>IslandAIPlan.copy({text:aiText(),gemini:true,statusId:'ex-status',fallbackId:'ex-manual-copy',labelId:'ex-manual-label'});

function lotteryPlaces(){return $('lottery-ai-source').value==='all'?[...new Set($('lottery-values').value.split('\n').map(x=>x.trim()).filter(Boolean))]:s.lottery.result;}
function updateLotteryAI(){const list=lotteryPlaces(),valid=list.length>0&&list.length<=200&&list.every(x=>x.length<=80);$('lottery-copy-ai').disabled=!valid;$('lottery-gemini').disabled=!valid;}
function lotteryAI(gemini){const names=lotteryPlaces();if(!names.length)return;return IslandAIPlan.copy({text:IslandAIPlan.build({origin:'待確認，請先詢問我',destination:'依自訂地點確認，可能跨縣市',places:names.map(name=>({name,query:name+' 台灣'}))}),gemini,statusId:'lottery-status',fallbackId:'lottery-fallback',labelId:'lottery-copy-label'});}
$('lottery-ai-source').onchange=updateLotteryAI;$('lottery-copy-ai').onclick=()=>lotteryAI(false);$('lottery-gemini').onclick=()=>lotteryAI(true);
function customAI(gemini){const names=[...new Set($('ex-map-places').value.split('\n').map(x=>x.trim()).filter(Boolean))];if(!names.length||names.length>150||names.some(x=>x.length>60)){setStatus('請先輸入 1～150 個自訂地點，每行一個，每項最多 60 字。');return;}return IslandAIPlan.copy({text:IslandAIPlan.build({origin:s.origins[routeKey()]||'臺北市',destination:s.mode==='county'?s.county:'臺灣',places:names.map(name=>({name,query:(s.mode==='county'?s.county+' ':'')+name}))}),gemini,statusId:'ex-status',fallbackId:'ex-manual-copy',labelId:'ex-manual-label'});}
$('custom-copy-ai').onclick=()=>customAI(false);$('custom-gemini').onclick=()=>customAI(true);
function renderLottery(){
 $('lottery-start').disabled=busy||!!s.lottery.finished;$('lottery-values').value=s.lottery.text;$('lottery-count').value=s.lottery.count;
 $('lottery-results').replaceChildren(...s.lottery.result.map(x=>{const li=document.createElement('li');li.textContent=x;return li;}));
 $('lottery-copy').disabled=!s.lottery.result.length;updateLotteryAI();$('lottery-fallback').hidden=true;$('lottery-copy-label').hidden=true;
}
$('lottery-values').addEventListener('input',()=>{s.lottery.text=$('lottery-values').value.slice(0,20000);s.lottery.result=[];s.lottery.finished=false;$('lottery-start').disabled=false;$('lottery-results').replaceChildren();$('lottery-copy').disabled=true;$('lottery-fallback').hidden=true;$('lottery-copy-label').hidden=true;$('lottery-status').textContent='選項已更新，請開始新一輪抽籤。';updateLotteryAI();persist();});
$('lottery-count').addEventListener('input',()=>{const n=Number($('lottery-count').value);if(Number.isInteger(n)&&n>=1&&n<=200){s.lottery.count=n;persist();}});
$('lottery-start').onclick=async()=>{
 if(busy||s.lottery.finished)return;const raw=$('lottery-values').value;const list=[...new Set(raw.split('\n').map(x=>x.trim()).filter(Boolean))];const count=Number($('lottery-count').value);
 if(raw.length>20000||!list.length||list.length>200||list.some(x=>x.length>80)){$('lottery-status').textContent='請輸入 1～200 個選項，每行一個，每項最多 80 字。';return;}
 if(!Number.isInteger(count)||count<1||count>list.length){$('lottery-status').textContent=`請輸入 1～${list.length} 的整數；抽出數量不可超過不重複選項數。`;return;}
 busy=true;$('lottery-start').disabled=true;$('lottery-copy').disabled=true;$('lottery-status').textContent='抽籤中…';
 try{const pool=[...list],result=[];for(let i=0;i<count;i++){const n=randomIndex(pool.length);result.push(pool.splice(n,1)[0]);}await wait(new URLSearchParams(location.search).has('fast')?0:500);s.lottery={text:raw,count,result};renderLottery();$('lottery-status').textContent=`從 ${list.length} 個不重複選項中抽出 ${count} 個。`;persist();}
 finally{busy=false;$('lottery-start').disabled=!!s.lottery.finished;IslandPlanActions.refresh();}
};
$('lottery-copy').onclick=async()=>{const text='《島遊趣》抽籤結果\n'+s.lottery.result.map((x,i)=>`${i+1}. ${x}`).join('\n');try{await navigator.clipboard.writeText(text);$('lottery-status').textContent='抽籤結果已複製。';}catch{$('lottery-fallback').value=text;$('lottery-fallback').hidden=false;$('lottery-copy-label').hidden=false;$('lottery-fallback').focus();$('lottery-fallback').select();$('lottery-status').textContent='請手動複製下方結果。';}};

for(const mode of ['taiwan','county','lunch'])IslandPlanActions.register(mode,{sources:mode==='lunch'?['selected','all','custom']:['selected','all','custom'],snapshot(source){let list=source==='selected'?route():options();if(source==='custom'){const text=mode==='lunch'?$('ex-foods').value:$('ex-map-places').value;list=[...new Set(text.split('\n').map(x=>x.trim()).filter(Boolean))].map(name=>({name,query:mode==='lunch'?lunchPlaceQuery(name):(s.county&&mode==='county'?s.county+' ':'')+name}));}return{title:mode==='lunch'?lunchLabel()+'午餐':mode==='county'?s.county+'旅行':'台灣旅行',origin:mode==='lunch'?lunchQuery():(s.origins[routeKey()]||'臺北市'),destination:mode==='county'?s.county:mode==='lunch'?lunchLabel()+'周邊':'臺灣',places:list,busy,finished:!!s.finished[routeKey()]};},finish(){if(busy||!route().length)return false;s.finished[routeKey()]=true;render();persist();setStatus('本次行程已結束，已選地點保留。按重玩可開始新行程。');return true;},replay(){ $('ex-clear').click();}});
IslandPlanActions.register('lottery',{sources:['selected','all'],snapshot(source){const names=source==='all'?[...new Set($('lottery-values').value.split('\n').map(x=>x.trim()).filter(Boolean))]:s.lottery.result;return{title:'自訂清單',origin:'待確認，請先詢問我',destination:'依自訂地點確認',places:names.map(name=>({name,query:name+' 台灣'})),busy,finished:!!s.lottery.finished};},finish(){if(busy||!s.lottery.result.length)return false;s.lottery.finished=true;renderLottery();persist();return true;},replay(){if(busy)return;s.lottery.result=[];s.lottery.finished=false;renderLottery();persist();$('lottery-status').textContent='已重玩，輸入選項保留，可再次開始抽籤。';}});
for(const id of ['ex-map-places','ex-foods','lottery-values'])$(id).addEventListener('input',()=>IslandPlanActions.refresh());
const refreshPlan=()=>IslandPlanActions.refresh();document.addEventListener('click',()=>setTimeout(refreshPlan,0));
render();persist();
})();
