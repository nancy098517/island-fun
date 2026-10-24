/* AI 行程交接：只傳地點與使用者設定，不把遊戲交通當成真實班次。 */
(() => {
'use strict';
const $=id=>document.getElementById(id),KEY='island-fun-ai-plan-settings-v1';
let settings={start:'',days:1,time:'09:00',transport:'大眾運輸'};
try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&typeof v.start==='string'&&v.start.length<=120&&Number.isInteger(v.days)&&v.days>=1&&v.days<=14&&/^\d{2}:\d{2}$/.test(v.time)&&['大眾運輸','自行開車','步行為主','請 AI 建議'].includes(v.transport))settings=v;}catch{}
$('ai-plan-start').value=settings.start;$('ai-plan-days').value=settings.days;$('ai-plan-time').value=settings.time;$('ai-plan-transport').value=settings.transport;
function read(){return {start:$('ai-plan-start').value.trim().slice(0,120),days:Math.max(1,Math.min(14,Math.floor(Number($('ai-plan-days').value)||1))),time:$('ai-plan-time').value||'09:00',transport:$('ai-plan-transport').value};}
for(const id of ['ai-plan-start','ai-plan-days','ai-plan-time','ai-plan-transport'])$(id).addEventListener('change',()=>{settings=read();try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}});
function build({origin,destination,places}){
 const a=read(),list=places.filter(p=>typeof p.name==='string');
 return `請幫我把以下「Travel Plan」整理成可實際出遊的行程與地理路線圖。\n\n【行程條件】\n出發地：${a.start||origin||'待確認，請先詢問我'}\n目的地：${destination||'依景點清單判斷'}\n天數：${a.days} 天\n每日預計出發時間：${a.time}\n交通偏好：${a.transport}\n景點由遊戲抽選產生，原編號不是已規劃的順路順序。請忽略任何列車遊戲卡、遊戲旅費與加成。\n\n【想去的地點】\n`+list.map((p,i)=>`${i+1}. ${p.name}`+(Number.isFinite(p.lat)&&Number.isFinite(p.lng)?`\n   參考座標：${p.lat}, ${p.lng}`:'')+`\n   地點查詢：https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query||((destination||'')+' '+p.name))}`).join('\n')+`\n\n【請完成】\n1. 核對同名地點、實際位置及營業／開放狀況，再依距離重新排序，盡量減少折返；不要照原抽選順序照抄。\n2. 規劃每日時間表，列出出發、各站建議停留、移動時間及午餐安排。若景點過遠或天數不足，明確指出並提出刪減或分天方案。\n3. 用編號在同一張真實地理底圖標出各站，呈現建議走訪順序；遊覽順序線與實際道路路線請清楚區分。若你無法產生地圖，請提供可匯入 Google My Maps 的 CSV，欄位為：順序、地點、地址、緯度、經度、建議到訪時間。\n4. 不要虛構座標、營業時間、公車班次或車程。無法查證的資料請標示待確認，缺少必要條件時先問我。\n\n請先給最佳排序與每日行程，再提供路線圖或地圖匯入資料。`;
}
window.IslandAIPlan={build};
})();
