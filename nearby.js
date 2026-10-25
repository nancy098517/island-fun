/* 定位只在按鈕點擊後請求；排序在裝置內完成，不呼叫外部地理 API。 */
(()=>{'use strict';
function distance(a,b){const r=x=>x*Math.PI/180,dLat=r(b.lat-a.lat),dLng=r(b.lng-a.lng),h=Math.sin(dLat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLng/2)**2;return 6371*2*Math.asin(Math.min(1,Math.sqrt(h)));}
function rank(origin,places,maxKm){if(!Number.isFinite(origin?.lat)||!Number.isFinite(origin?.lng)||!Number.isFinite(maxKm)||maxKm<=0)return[];return places.filter(p=>Number.isFinite(p?.lat)&&Number.isFinite(p?.lng)).map(p=>({...p,distanceKm:distance(origin,p)})).filter(p=>p.distanceKm<=maxKm).sort((a,b)=>a.distanceKm-b.distanceKm);}
function locate(geo=navigator.geolocation){return new Promise((resolve,reject)=>{if(!geo){reject({code:0});return;}const timer=setTimeout(()=>reject({code:3}),15000);const fail=e=>{clearTimeout(timer);reject(e);};geo.getCurrentPosition(p=>{clearTimeout(timer);const c=p.coords;if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude)||!Number.isFinite(c.accuracy)||c.accuracy>3000){reject({code:4});return;}resolve({lat:c.latitude,lng:c.longitude,accuracy:c.accuracy});},fail,{enableHighAccuracy:false,maximumAge:60000,timeout:10000});});}
function errorText(e){return ({0:'此瀏覽器不支援定位，請手選縣市。',1:'未取得定位權限，仍可手選縣市抽行程。若要重試，請到瀏覽器的網站設定允許定位。',2:'暫時無法取得位置，請確認裝置已開啟定位，或手選縣市。',3:'定位逾時，請重試或手選縣市。',4:'定位誤差太大，無法可靠推薦附近地點，請手選縣市或再試一次。'})[e?.code]||'定位未成功，仍可手選縣市使用。';}
window.IslandNearby={distance,rank,locate,errorText};
})();
