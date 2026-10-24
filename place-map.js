/* 共用一張 Google Maps：每次抽選或點選地點，切換目前標示。 */
(() => {
'use strict';
let current='', currentName='', trip={title:'我的島遊趣旅行',places:[]};
const box=document.getElementById('google-place-map'),frame=document.getElementById('google-place-frame'),label=document.getElementById('google-place-label'),external=document.getElementById('google-place-external');
function show(query,name=query){
 if(typeof query!=='string'||!query.trim())query='台灣';
 query=query.trim();currentName=String(name);label.textContent='目前標示：'+name;box.hidden=false;
 external.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
 if(current!==query){frame.src='https://www.google.com/maps?q='+encodeURIComponent(query)+'&output=embed&hl=zh-TW';frame.title='Google Maps：'+name;current=query;}
}
function setTrip(title,places){trip={title:String(title),places:places.filter(x=>typeof x?.name==='string'&&typeof x?.query==='string').map(x=>({name:x.name,query:x.query}))};}
const status=document.getElementById('map-share-status');
const link=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
function invite(){const places=trip.places.length?trip.places:[{name:currentName,query:current}];return '一起出發吧！🎒\n'+trip.title+'\n'+places.map((x,i)=>`${i+1}. ${x.name}\n${link(x.query)}`).join('\n\n')+'\n\n想找朋友一起走走、吃點好吃的！有空一起嗎？\n#島遊趣 #一起去旅行';}
async function copy(text){try{await navigator.clipboard.writeText(text);status.textContent='已複製，可以貼給朋友，或放進 FB／IG 貼文。';}catch{const t=document.getElementById('map-copy-fallback');t.value=text;t.hidden=false;document.getElementById('map-copy-fallback-label').hidden=false;t.focus();t.select();status.textContent='請手動複製下方文字。';}}
document.getElementById('map-copy-link').onclick=()=>copy(link(current));
document.getElementById('map-copy-invite').onclick=()=>copy(invite());
document.getElementById('map-share').onclick=async()=>{if(!navigator.share){await copy(invite());return;}try{await navigator.share({title:trip.title,text:invite(),url:link(current)});status.textContent='已交給裝置分享選單。';}catch(e){if(e.name==='AbortError')status.textContent='已取消分享。';else await copy(invite());}};
function wrap(ctx,text,maxWidth){const lines=[];let line='';for(const ch of text){if(ctx.measureText(line+ch).width>maxWidth&&line){lines.push(line);line='';}line+=ch;}if(line)lines.push(line);return lines;}
document.getElementById('map-download-image').onclick=async()=>{
 try{
 if(document.fonts) await Promise.race([document.fonts.load('bold 30px "Island Trip TC"', '島遊趣一起出發臺南孔廟'),new Promise(resolve=>setTimeout(resolve,2000))]);
 const story=document.getElementById('share-image-format').value==='story',canvas=document.createElement('canvas');canvas.width=1080;canvas.height=story?1920:1080;const c=canvas.getContext('2d');if(!c)throw Error('canvas');const H=canvas.height;
 c.fillStyle='#e8f1ee';c.fillRect(0,0,1080,H);c.fillStyle='#14304a';c.fillRect(0,0,1080,16);c.fillStyle='#f1b72b';c.fillRect(64,64,190,48);c.fillStyle='#14304a';c.font='bold 25px "Island Trip TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';c.fillText('ISLAND FUN',78,98);c.font='bold 68px "Island Trip TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';c.fillText('島遊趣 · 一起出發',64,207);
 c.font='32px "Island Trip TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';let y=265;for(const line of wrap(c,trip.title,940).slice(0,2)){c.fillText(line,64,y);y+=42;}y+=36;
 const places=trip.places.length?trip.places:[{name:currentName,query:current}],max=story?12:5,shown=places.slice(0,max),available=H-y-205,step=Math.min(110,available/Math.max(1,shown.length));
 shown.forEach((x,i)=>{const top=y+i*step;c.fillStyle='#fbfdfc';c.fillRect(64,top,952,step-12);c.fillStyle='#2b8aa0';c.font='bold 28px "Island Trip TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';c.fillText(String(i+1).padStart(2,'0'),86,top+39);c.fillStyle='#14304a';c.font='bold 30px "Island Trip TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';const lines=wrap(c,x.name,810);c.fillText(lines[0]||'',150,top+39);if(lines.length>1&&step>78)c.fillText(lines.length>2||lines[1].length>25?lines[1].slice(0,24)+'…':lines[1],150,top+77);else if(lines.length>1){const clipped=wrap(c,x.name,775)[0]+'…';c.fillStyle='#fbfdfc';c.fillRect(146,top+8,850,45);c.fillStyle='#14304a';c.fillText(clipped,150,top+39);}});
 c.fillStyle='#14304a';c.font='27px "Island Trip TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';if(places.length>max)c.fillText(`另有 ${places.length-max} 個地點，完整行程見貼文文字。`,64,H-151);c.fillText('有空一起走走、吃點好吃的嗎？',64,H-103);c.font='23px "Island Trip TC", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';c.fillText('#島遊趣  ·  地點地圖請看分享文字中的連結',64,H-53);
 canvas.toBlob(blob=>{if(!blob){status.textContent='無法產生圖片，請先複製邀約文字。';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=story?'island-fun-ig-story.png':'island-fun-social-post.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='已產生分享圖。發文前可再按「複製邀約文字」取得完整地點與地圖連結。';},'image/png');
 }catch{status.textContent='此瀏覽器無法產生圖片，請先複製邀約文字。';}
};
window.IslandMap={show,setTrip,hide:()=>{box.hidden=true;}};
})();
