# 島遊趣

擲骰子、走訪台灣各地景點的環島旅行棋盤小遊戲。
純 HTML／CSS／JavaScript，沒有任何套件、資料庫或 API Key，可直接部署到 GitHub Pages。

## 玩法

1. 按「擲骰子」，棋子依點數逐格前進。
2. 停在景點：蓋章並獲得旅遊值、文化值，同時花一點旅費。
3. 停在 🎒「旅途奇遇」：多半是好事，例如搭上鳴日號、海風號前進幾格。
4. 停在 🌦️「突發事件」：可能下大雨停一回合、錯過公車退後，也可能買到優惠車票。
5. 繞完一圈回到起點，顯示結算畫面與你的旅行稱號。

## 檔案結構

```
index.html      頁面骨架
style.css       外觀（配色變數在最上方 :root）
game.js         遊戲邏輯與資料
assets/
  scenery.svg   頁首的山、海與觀光列車
  taiwan.svg    棋盤中央的台灣輪廓
  favicon.svg   分頁小圖示
```

## 在本機試玩

直接用瀏覽器開啟 `index.html` 即可。
（網址後面加上 `?fast` 會關閉動畫延遲，方便快速測試。）

## 發布到 GitHub Pages

1. 登入 GitHub，建立新的 repository，例如 `island-fun`，設為 Public。
   - 注意：名稱不要取成 `你的帳號.github.io`，那是個人主頁專用的特殊名稱。
2. 把本資料夾內的所有檔案（含 `assets/` 資料夾）上傳到 repository 的根目錄。
   - 網頁操作：repository 頁面 → Add file → Upload files，把檔案拖進去後按 Commit changes。
   - 或使用指令：
     ```bash
     git init
     git add .
     git commit -m "島遊趣 第一版"
     git branch -M main
     git remote add origin https://github.com/你的帳號/island-fun.git
     git push -u origin main
     ```
3. 進入 repository 的 Settings → Pages。
4. Build and deployment 的 Source 選 Deploy from a branch，Branch 選 `main`、資料夾選 `/ (root)`，按 Save。
5. 等待約 1～2 分鐘，頁面上方會出現網址：
   `https://你的帳號.github.io/island-fun/`

之後每次更新檔案並 push，網站會自動重新部署。

## 想改內容？

都在 `game.js` 上半部：

| 想改什麼 | 找哪裡 |
| --- | --- |
| 景點、介紹、數值 | `BOARD` |
| 旅途奇遇（好事） | `CHANCE_CARDS` |
| 突發事件 | `EVENT_CARDS` |
| 旅行稱號與門檻 | `TITLES` |
| 起始旅費、環島圈數、動畫速度 | `CONFIG` |

事件可用的效果：`move`（正數前進、負數退後）、`skip`（停止幾回合）、`money`、`travel`、`culture`。

棋盤固定為 7×7 外框共 24 格。若要改格數，需一併調整 `gridPos()` 與 `style.css` 的格線設定。

## 字體與素材

- 標題字體 Huninn（粉圓）與內文字體 Noto Sans TC 透過 Google Fonts 載入；離線或載入失敗時會自動改用系統字體。
- 圖示使用 Emoji，頁首與地圖為自製 SVG。


## 2026-10-24 更新
- 完成回合後以 localStorage 儲存，重新整理自動接續；回合中離開回復上一個完成的回合。
- 景點首次蓋章依序加入行程；可加入與移除自訂地點，移除行程不會取消蓋章或分數。
- 複製行程包含 Google Maps 地點與逐站大眾運輸查詢連結；複製失敗提供手動選取文字。
- 交通連結為查詢入口，未驗證實際路線與班次。請自行分天、查班次與景點開放狀況。
- 重新開始會經確認後清除進度與行程。

### 更新 GitHub Pages
解壓縮後，將 island-fun 資料夾內所有檔案覆蓋到原專案的對應位置（避免多套一層 island-fun）。保留 assets 資料夾。提交變更後等待 GitHub Pages 發布，再重新整理。也可直接以瀏覽器開啟 index.html 試玩；正式使用建議透過 GitHub Pages，以獲得穩定的儲存與複製支援。
