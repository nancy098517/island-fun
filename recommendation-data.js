/* 個人推薦清單資料格式；驗證不依賴 DOM 或外部服務。 */
(()=>{'use strict';
const counties=['臺北市','新北市','基隆市','桃園市','新竹市','新竹縣','苗栗縣','臺中市','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','臺南市','高雄市','屏東縣','宜蘭縣','花蓮縣','臺東縣','澎湖縣','金門縣','連江縣'];
const types=['景點','美食','手作體驗'];
const headers=['縣市','行政區','地點名稱','類型','推薦原因','地址或地圖關鍵字','緯度','經度','來源備註'];
const fields=['city','district','name','type','reason','query','lat','lng','source'];
const clean=v=>String(v??'').replace(/^\uFEFF/,'').trim();
function validate(o){const r={};for(const f of fields)r[f]=clean(o?.[f]);r.city=r.city.replace(/^台/,'臺').replace(/（馬祖）|\(馬祖\)/g,'');if(!counties.includes(r.city))throw Error('縣市請選擇臺灣 22 縣市之一');if(!r.name||r.name.length>80)throw Error('地點名稱必填，最多 80 字');if(!r.type)r.type='景點';if(r.type==='手作')r.type='手作體驗';if(!types.includes(r.type))throw Error('類型請填景點、美食或手作體驗');for(const [f,n]of [['district',30],['reason',500],['query',200],['source',250]])if(r[f].length>n)throw Error(headers[fields.indexOf(f)]+'超過 '+n+' 字');if(r.lat===''&&r.lng===''){r.lat=null;r.lng=null;}else{r.lat=Number(r.lat);r.lng=Number(r.lng);if(clean(o?.lat)===''||clean(o?.lng)===''||!Number.isFinite(r.lat)||!Number.isFinite(r.lng)||r.lat<21||r.lat>27||r.lng<118||r.lng>123)throw Error('座標需成對填寫，並位於臺灣周邊範圍；不確定可留空');}return r;}
function key(r){return[r.city,r.district,r.name,r.type,r.query].map(x=>clean(x).toLowerCase().replace(/\s+/g,' ')).join('\u001f');}
function parseMatrix(matrix){if(!Array.isArray(matrix)||!matrix.length)throw Error('Excel 沒有資料');if(matrix.length>1001)throw Error('每份清單最多 1000 個地點');const names=matrix[0].map(clean),alias={'地點':'地點名稱','景點名稱':'地點名稱','推薦理由':'推薦原因','地址':'地址或地圖關鍵字'};const hs=names.map(x=>alias[x]||x);for(const n of ['縣市','地點名稱'])if(!hs.includes(n))throw Error('Excel 第一列需包含「縣市」與「地點名稱」欄位');for(const n of headers)if(hs.filter(x=>x===n).length>1)throw Error('Excel 欄位重複：'+n);const rows=[],errors=[];for(let i=1;i<matrix.length;i++){const a=matrix[i];if(!a?.some(v=>clean(v)!==''))continue;const o={};fields.forEach((f,j)=>{const c=hs.indexOf(headers[j]);o[f]=c<0?'':a[c];});try{rows.push(validate(o));}catch(e){errors.push('第 '+(i+1)+' 列：'+e.message);}}return{rows,errors};}
function matrix(rows){return[headers,...rows.map(r=>fields.map(f=>r[f]??''))];}
function merge(existing,incoming,id){const keys=new Set(existing.map(key)),added=[];let duplicates=0;for(const r of incoming){const k=key(r);if(keys.has(k)){duplicates++;continue;}keys.add(k);added.push({...r,id:id()});}if(existing.length+added.length>1000)throw Error('合併後超過 1000 個地點，請先刪減或分檔保存');return{rows:[...existing,...added],added:added.length,duplicates};}
window.IslandListData={counties,types,headers,fields,validate,key,parseMatrix,matrix,merge};
})();
