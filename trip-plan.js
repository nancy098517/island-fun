/* AI 行程交接：只傳地點與使用者設定，不把遊戲交通當成真實班次。 */
(() => {
'use strict';
const $=id=>document.getElementById(id);
function build({origin,destination,places}){
 const list=places.filter(p=>typeof p.name==='string');
 return `請幫我把以下「Travel Plan」整理成可實際出遊的行程與地理路線圖。\n\n【行程條件】\n出發地：${origin||'待確認，請先詢問我'}\n目的地：${destination||'依景點清單判斷'}\n天數：請依地點距離建議\n每日預計出發時間：請依開放時間建議\n交通偏好：請先詢問我，或比較適合的方式\n景點由遊戲抽選產生，原編號不是已規劃的順路順序。請忽略任何列車遊戲卡、遊戲旅費與加成。\n\n【想去的地點】\n`+list.map((p,i)=>`${i+1}. ${p.name}`+(Number.isFinite(p.lat)&&Number.isFinite(p.lng)?`\n   參考座標：${p.lat}, ${p.lng}`:'')+`\n   地點查詢：https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query||((destination||'')+' '+p.name))}`).join('\n')+`\n\n【請完成】\n1. 核對同名地點、實際位置及營業／開放狀況，再依距離重新排序，盡量減少折返；不要照原抽選順序照抄。\n2. 規劃每日時間表，列出出發、各站建議停留、移動時間及午餐安排。若景點過遠或天數不足，明確指出並提出刪減或分天方案。\n3. 用編號在同一張真實地理底圖標出各站，呈現建議走訪順序；遊覽順序線與實際道路路線請清楚區分。若你無法產生地圖，請提供可匯入 Google My Maps 的 CSV，欄位為：順序、地點、地址、緯度、經度、建議到訪時間。\n4. 不要虛構座標、營業時間、公車班次或車程。無法查證的資料請標示待確認，缺少必要條件時先問我。\n\n請先給最佳排序與每日行程，再提供路線圖或地圖匯入資料。`;
}
async function copy({text,statusId,fallbackId,labelId,gemini=false}){
 const status=$(statusId),fallback=$(fallbackId);if(labelId)$(labelId).hidden=true;fallback.hidden=true;
 try{await navigator.clipboard.writeText(text);}catch{fallback.value=text;fallback.hidden=false;if(labelId)$(labelId).hidden=false;fallback.focus();fallback.select();status.textContent='請先手動複製下方文字，再用頁面下方的「開啟 Google Gemini」連結貼上送出。';return false;}
 if(gemini){window.open('https://gemini.google.com/app?hl=zh-TW','_blank','noopener,noreferrer');status.textContent='行程提示已複製。下一步：在 Gemini 輸入框長按「貼上」（電腦按 Ctrl／⌘ + V），再按送出。若未開啟，請按下方連結。';}
 else status.textContent='已複製 AI 行程提示，可貼到 Gemini 或其他 AI。';
 return true;
}
window.IslandAIPlan={build,copy};
})();
