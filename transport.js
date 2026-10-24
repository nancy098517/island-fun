/* 交通卡為遊戲事件，非已查證班次或指定停靠站。 */
(() => {
'use strict';
const HSR={ '臺北市':'台北站','新北市':'板橋站','桃園市':'桃園站','新竹縣':'新竹站','苗栗縣':'苗栗站','臺中市':'台中站','彰化縣':'彰化站','雲林縣':'雲林站','嘉義縣':'嘉義站','臺南市':'台南站','高雄市':'左營站' };
const ISLANDS=['澎湖縣','金門縣','連江縣'];
const COUNTIES=['臺北市','新北市','基隆市','桃園市','新竹市','新竹縣','苗栗縣','臺中市','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','臺南市','高雄市','屏東縣','宜蘭縣','花蓮縣','臺東縣',...ISLANDS];
function countyOf(query){const q=query.replaceAll('台','臺');return COUNTIES.find(c=>q.startsWith(c))||'';}
function choices(from,to){
 if(!from||!to)return[{name:'在地接駁',icon:'🚌',note:'自訂地點未確認縣市，請另查實際交通。',travel:5}];
 if(from===to)return[{name:'在地公車／步行',icon:'🚶',note:'同一縣市內的下一站，請依距離查詢接駁。',travel:5}];
 if(ISLANDS.includes(from)||ISLANDS.includes(to))return[{name:'海空交通＋在地接駁',icon:'⛴️',note:'離島需另查實際航線、船班與接駁；本卡不代表有直達班次。',travel:10}];
 const pool=[];
 if(from!=='南投縣'&&to!=='南投縣'){
  pool.push({name:'新自強號 EMU3000',icon:'🚆',note:'遊戲抽中新自強號！幹線車站下車後，再轉乘到景點。實際班次與停靠站需另查。',travel:10});
  pool.push({name:'鳴日號',icon:'🚂',note:'遊戲抽中觀光列車體驗！旅遊值加成；現實須配合另行預約的套裝行程，非隨到隨搭。',travel:20});
 }
 if(HSR[from]&&HSR[to])pool.push({name:'台灣高鐵',icon:'🚄',note:`西部高鐵區間：${HSR[from]} → ${HSR[to]}，下車後另查景點接駁。高雄端為左營站。`,travel:15});
 if(!pool.length)pool.push({name:'公路接駁',icon:'🚌',note:'此區間不抽高鐵直達卡，請另查公車或台鐵轉乘。',travel:5});
 return pool;
}
function draw(from,to){const pool=choices(from,to),a=new Uint32Array(1),limit=Math.floor(4294967296/pool.length)*pool.length;do{crypto.getRandomValues(a);}while(a[0]>=limit);return {...pool[a[0]%pool.length],from,to};}
function text(t){return `${t.icon} ${t.name}｜${t.from||'自訂出發地'} → ${t.to||'自訂地點'}\n${t.note}`;}
window.IslandTransport={COUNTIES,choices,draw,countyOf,text};
})();
