/* ==========================================================
   島遊趣 game.js（Vanilla JavaScript，無任何外部套件）

   檔案結構：
   1. 設定 CONFIG
   2. 資料：棋盤格子、旅途奇遇、突發事件、旅行稱號
   3. 遊戲狀態與畫面更新
   4. 骰子、移動、事件處理
   5. 結算與重新開始
   ========================================================== */
(() => {
  "use strict";

  /* ---------- 1. 設定 ---------- */

  // 網址加上 ?fast 可關閉動畫延遲（自動測試用）
  const FAST = new URLSearchParams(location.search).has("fast");

  const CONFIG = {
    laps: 1,                          // 環島圈數（想玩久一點可改成 2）
    startMoney: 3000,                 // 起始旅費
    stepDelay: FAST ? 0 : 320,        // 棋子每走一格的間隔（毫秒）
    diceRollMs: FAST ? 0 : 800,       // 骰子滾動時間（毫秒）
    logLines: 6,                      // 旅途紀錄保留幾行
  };

  /* ---------- 2. 資料 ---------- */

  // 建立「景點格」的小工具
  // theme：sea 海 / green 山林田野 / city 都會 / culture 人文（決定色帶顏色）
  function spot(name, short, icon, theme, region, text, effect) {
    return { type: "spot", name, short, icon, theme, region, text, effect };
  }
  const CHANCE = { type: "chance", name: "旅途奇遇", short: "奇遇", icon: "🎒" };
  const EVENT  = { type: "event",  name: "突發事件", short: "突發", icon: "🌦️" };

  // 棋盤共 24 格，順時針繞一圈。effect 可用欄位：
  //   travel 旅遊值、culture 文化值、money 旅費（負數＝花費）
  const BOARD = [
    { type: "start", name: "出發！環遊台灣", short: "出發", icon: "🚆" },                              // 0
    spot("淡水", "淡水", "🌅", "sea", "北部", "漫步老街、吃阿給，坐在河岸等夕陽落下。", { travel: 15, culture: 5, money: -80 }),
    spot("台北 101", "101", "🏙️", "city", "北部", "搭高速電梯登上觀景台，整座台北盆地都在腳下。", { travel: 20, culture: 5, money: -150 }),
    spot("九份", "九份", "🏮", "green", "北部", "紅燈籠、石階與山海景色，來碗熱呼呼的芋圓吧。", { travel: 25, money: -100 }),
    CHANCE,                                                                                          // 4
    spot("宜蘭", "宜蘭", "♨️", "sea", "東部", "泡個溫泉、吃蔥油餅，再到蘭陽平原騎單車。", { travel: 20, culture: 5, money: -100 }),
    spot("太魯閣", "太魯閣", "⛰️", "green", "東部", "走進大理石峽谷，抬頭只見一線天。", { travel: 30, culture: 10, money: -80 }),
    spot("花蓮", "花蓮", "🌊", "sea", "東部", "七星潭的礫石海灘，聽浪聲把煩惱帶走。", { travel: 25, money: -100 }),
    CHANCE,                                                                                          // 8
    spot("池上", "池上", "🌾", "green", "東部", "騎單車穿過金黃稻浪，再吃一個熱騰騰的池上便當。", { travel: 20, culture: 10, money: -80 }),
    spot("台東", "台東", "🚃", "sea", "東部", "搭上復古的藍皮解憂號，在東海岸悠悠晃晃。", { travel: 20, culture: 10, money: -100 }),
    EVENT,                                                                                           // 11
    spot("墾丁", "墾丁", "🏖️", "sea", "南部", "白沙灣的海風、鵝鑾鼻的燈塔，南國陽光滿分。", { travel: 30, money: -150 }),
    spot("高雄", "高雄", "🎡", "city", "南部", "駁二藝術特區與愛河，港都的海風帶點藝術味。", { travel: 10, culture: 20, money: -100 }),
    spot("台南", "台南", "🏯", "culture", "南部", "古都慢走：赤崁樓、安平老街，還有數不完的小吃。", { travel: 10, culture: 30, money: -100 }),
    EVENT,                                                                                           // 15
    spot("澎湖", "澎湖", "⛵", "sea", "離島", "搭船出海跳島，玄武岩與湛藍海水一次收藏。", { travel: 25, culture: 5, money: -200 }),
    spot("阿里山", "阿里山", "🌲", "green", "南部", "搭上森林小火車，欣賞山林與日出。", { travel: 30, money: -150 }),
    spot("日月潭", "日月潭", "🚲", "sea", "中部", "沿著湖畔騎單車，欣賞山色與湖光倒影。", { travel: 25, culture: 5, money: -100 }),
    EVENT,                                                                                           // 19
    spot("國立臺灣美術館", "國美館", "🖼️", "culture", "中部", "今天來欣賞展覽！在綠園道旁，讓藝術慢慢充電。", { culture: 20, money: -50 }),
    spot("鹿港", "鹿港", "🏛️", "culture", "中部", "老街巷弄、天后宮與蚵仔煎，處處都是歷史的味道。", { travel: 5, culture: 25, money: -80 }),
    CHANCE,                                                                                          // 22
    spot("新竹", "新竹", "🌬️", "city", "北部", "九降風吹過，來碗貢丸湯、逛逛城隍廟。", { travel: 15, culture: 10, money: -80 }),
  ];

  // 旅途奇遇：move 正數＝前進、負數＝退後；skip＝停止幾回合
  const CHANCE_CARDS = [
    { icon: "🧑‍🤝‍🧑", title: "熱心旅人", text: "遇到熱心旅人推薦私房景點，帶你抄了近路。", effect: { move: 2 } },
    { icon: "🚌", title: "免費接駁車", text: "剛好搭到免費接駁車，一路睡到下一站。", effect: { move: 3 } },
    { icon: "🚆", title: "搭上鳴日號", text: "搭上觀光列車鳴日號，窗外風景一幕幕飛逝。", effect: { move: 3, travel: 10 } },
    { icon: "🌇", title: "海風號夕陽", text: "搭上海線列車海風號，沿途看海也看夕陽。", effect: { move: 2, travel: 10 } },
    { icon: "🍢", title: "特色小吃", text: "巷口發現一攤排隊的特色小吃，值得！", effect: { travel: 10 } },
    { icon: "🛍️", title: "在地市集", text: "逛到在地市集，買了伴手禮帶回家。", effect: { culture: 10, money: -50 } },
    { icon: "🎫", title: "旅宿折價券", text: "抽中旅宿折價券，荷包輕鬆一點。", effect: { money: 200 } },
    { icon: "🎙️", title: "導覽志工", text: "遇到熱情的導覽志工，聽了一段精彩的在地故事。", effect: { culture: 15 } },
    { icon: "🌈", title: "雨後彩虹", text: "一場小雨過後，天空掛上一道彩虹。", effect: { travel: 15 } },
  ];

  // 突發事件
  const EVENT_CARDS = [
    { icon: "🌧️", title: "下大雨", text: "下大雨，行程延誤，先找個地方躲雨。", effect: { skip: 1 } },
    { icon: "🚏", title: "錯過公車", text: "眼睜睜看著公車開走，只好退後兩格。", effect: { move: -2 } },
    { icon: "🎟️", title: "優惠車票", text: "買到優惠車票，省下一筆旅費！", effect: { money: 300 } },
    { icon: "🧭", title: "走錯路了", text: "跟著地圖走錯路，原地停留一回合，卻意外發現一間小廟。", effect: { skip: 1, culture: 5 } },
    { icon: "🧳", title: "行李超重", text: "行李超重，加付了一筆行李費。", effect: { money: -150 } },
    { icon: "🔋", title: "手機沒電", text: "手機沒電，只好叫車，多花了一點錢。", effect: { money: -200 } },
    { icon: "🏮", title: "巧遇廟會", text: "巧遇在地廟會，鑼鼓喧天，熱鬧極了。", effect: { culture: 15 } },
  ];

  // 旅行稱號：由上而下檢查，第一個符合的就是你的稱號
  const TITLES = [
    { name: "環島傳奇旅人", note: "景點、文化、旅費樣樣兼顧，簡直是島上活地圖。",
      test: (s) => s.visited.size >= 6 && s.travel + s.culture >= 180 },
    { name: "島嶼策展人", note: "你把旅行走成了一場展覽，處處是文化的細節。",
      test: (s) => s.culture >= 60 && s.culture >= s.travel * 0.6 },
    { name: "山海探險家", note: "山、海、稻浪都被你收進行程，旅遊值滿滿。",
      test: (s) => s.travel >= 110 },
    { name: "精打細算背包客", note: "花得少、玩得巧，連優惠車票都被你找到了。",
      test: (s) => s.money >= 2700 },
    { name: "隨興漫遊旅人", note: "沒有固定路線也很好，風吹到哪就走到哪。",
      test: (s) => s.visited.size <= 3 },
    { name: "快樂小旅人", note: "一路吃吃逛逛，帶著好心情完成環島！",
      test: () => true },
  ];

  /* ---------- 3. 狀態與畫面 ---------- */

  const TOTAL_CELLS = BOARD.length;                        // 24
  const TOTAL_SPOTS = BOARD.filter((c) => c.type === "spot").length;
  const MAX_STEPS = TOTAL_CELLS * CONFIG.laps;             // 走到這裡就完成環島

  const $ = (sel) => document.querySelector(sel);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

  const els = {};          // 常用 DOM 元素
  const cellEls = [];      // 24 個格子的 DOM
  let state;               // 目前的遊戲狀態
  let lastCardTitle = "";  // 避免連續抽到同一張事件卡

  function newState() {
    return {
      totalSteps: 0,            // 累計走過的格數（0 ～ MAX_STEPS）
      money: CONFIG.startMoney,
      travel: 0,
      culture: 0,
      visited: new Set(),       // 已蓋章的格子編號
      skip: 0,                  // 還要停幾回合
      turn: 0,
      busy: false,              // 回合進行中（避免重複點擊）
      over: false,
      log: [],
      itinerary: [],
    };
  }

  const position = () => state.totalSteps % TOTAL_CELLS;

  // 第 i 格在 7×7 外框上的 [列, 欄]（從左上角出發，順時針）
  function gridPos(i) {
    if (i <= 6) return [1, i + 1];
    if (i <= 12) return [i - 5, 7];
    if (i <= 18) return [7, 7 - (i - 12)];
    return [7 - (i - 18), 1];
  }

  function buildBoard() {
    BOARD.forEach((cell, i) => {
      const el = document.createElement("div");
      el.className = "cell";
      el.dataset.type = cell.type;
      if (cell.theme) el.dataset.theme = cell.theme;
      el.title = cell.name;
      const [row, col] = gridPos(i);
      el.style.gridRow = row;
      el.style.gridColumn = col;

      const icon = document.createElement("span");
      icon.className = "cell-icon";
      icon.textContent = cell.icon;
      const name = document.createElement("span");
      name.className = "cell-name";
      name.textContent = cell.short;
      el.append(icon, name);

      els.board.appendChild(el);
      cellEls.push(el);
    });
  }

  function buildDie() {
    for (let i = 0; i < 9; i++) {
      const pip = document.createElement("span");
      pip.className = "pip";
      els.die.appendChild(pip);
    }
  }

  // 骰子點數對應要亮起的點位（九宮格 0～8）
  const DIE_FACES = {
    1: [4], 2: [0, 8], 3: [0, 4, 8],
    4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
  };
  function showFace(n) {
    [...els.die.children].forEach((pip, i) => pip.classList.toggle("on", DIE_FACES[n].includes(i)));
    els.die.setAttribute("aria-label", `骰子：${n} 點`);
  }

  // 把棋子移到目前所在格子的中心
  function placeToken(animate = true) {
    const el = cellEls[position()];
    els.token.classList.toggle("no-anim", !animate);
    els.token.style.left = `${el.offsetLeft + el.offsetWidth / 2}px`;
    // 棋子停在格子偏上方（約 36% 處），讓下方的景點名稱仍然看得到
    els.token.style.top = `${el.offsetTop + el.offsetHeight * 0.36}px`;
    if (animate) {
      els.token.classList.remove("hop");
      void els.token.offsetWidth;          // 強制重排，讓動畫可以重播
      els.token.classList.add("hop");
    }
  }

  function renderStats(changed = []) {
    const cell = BOARD[position()];
    els.statPos.textContent = `${cell.icon} ${cell.name}`;
    els.statMoney.textContent = `NT$ ${state.money}`;
    els.statTravel.textContent = state.travel;
    els.statCulture.textContent = state.culture;
    els.statVisited.textContent = `${state.visited.size} / ${TOTAL_SPOTS}`;

    const pct = Math.round((state.totalSteps / MAX_STEPS) * 100);
    els.progressFill.style.width = `${pct}%`;
    els.progressText.textContent = `環島進度 ${state.totalSteps} / ${MAX_STEPS} 格・第 ${state.turn} 回合`;

    // 有變動的數字閃一下
    const map = { money: els.statMoney, travel: els.statTravel, culture: els.statCulture, visited: els.statVisited };
    changed.forEach((key) => {
      const dd = map[key];
      if (!dd) return;
      dd.classList.remove("bump");
      void dd.offsetWidth;
      dd.classList.add("bump");
    });
  }

  // 寫入旅途紀錄，同時顯示在棋盤中央的提示
  function say(msg) {
    state.log.unshift(msg);
    state.log = state.log.slice(0, CONFIG.logLines);
    els.log.replaceChildren(...state.log.map((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      return li;
    }));
    els.hint.textContent = msg;
  }

  // 把 effect 轉成卡片下方的小標籤
  function effectChips(e) {
    const chips = [];
    if (e.travel) chips.push({ text: `旅遊值 ${signed(e.travel)}`, kind: e.travel > 0 ? "good" : "bad" });
    if (e.culture) chips.push({ text: `文化值 ${signed(e.culture)}`, kind: e.culture > 0 ? "good" : "bad" });
    if (e.money) chips.push({ text: `旅費 ${signed(e.money)}`, kind: e.money > 0 ? "good" : "bad" });
    if (e.move) chips.push({ text: e.move > 0 ? `前進 ${e.move} 格` : `退後 ${-e.move} 格`, kind: e.move > 0 ? "good" : "bad" });
    if (e.skip) chips.push({ text: `停止 ${e.skip} 回合`, kind: "bad" });
    return chips;
  }

  // 顯示卡片，等玩家按下按鈕才繼續（回傳 Promise）
  function showCard({ icon, tag, theme = "city", title, body, chips = [], button = "繼續" }) {
    return new Promise((resolve) => {
      els.card.dataset.theme = theme;
      els.cardTag.textContent = tag;
      els.cardIcon.textContent = icon;
      els.cardTitle.textContent = title;
      els.cardBody.textContent = body;
      els.cardChips.replaceChildren(...chips.map((c) => {
        const li = document.createElement("li");
        li.className = `chip ${c.kind}`;
        li.textContent = c.text;
        return li;
      }));
      els.cardBtn.textContent = button;
      els.modal.hidden = false;
      els.cardBtn.focus();
      els.cardBtn.onclick = () => {
        els.modal.hidden = true;
        resolve();
      };
    });
  }

  /* ---------- 4. 骰子、移動、事件 ---------- */

  async function rollDice() {
    els.die.classList.add("rolling");
    const end = performance.now() + CONFIG.diceRollMs;
    while (performance.now() < end) {
      showFace(randInt(1, 6));
      await sleep(80);
    }
    const value = randInt(1, 6);
    showFace(value);
    els.die.classList.remove("rolling");
    await sleep(CONFIG.stepDelay);
    return value;
  }

  // 逐格移動。n 為正＝前進、負＝退後；不會退到起點之前，走到終點就停
  async function moveBy(n) {
    const dir = Math.sign(n);
    for (let i = 0; i < Math.abs(n); i++) {
      const next = state.totalSteps + dir;
      if (next < 0 || next > MAX_STEPS) break;
      state.totalSteps = next;
      placeToken(true);
      renderStats();
      await sleep(CONFIG.stepDelay);
      if (state.totalSteps >= MAX_STEPS) break;
    }
  }

  const isFinished = () => state.totalSteps >= MAX_STEPS;

  // 套用數值變化（旅費不會低於 0）
  function applyStats(e) {
    const changed = [];
    if (e.travel) { state.travel = Math.max(0, state.travel + e.travel); changed.push("travel"); }
    if (e.culture) { state.culture = Math.max(0, state.culture + e.culture); changed.push("culture"); }
    if (e.money) { state.money = Math.max(0, state.money + e.money); changed.push("money"); }
    renderStats(changed);
  }

  // 停在某一格時觸發的內容。fromEvent＝是被事件卡推過來的（避免連環抽卡）
  async function resolveCell(fromEvent = false) {
    const idx = position();
    const cell = BOARD[idx];

    if (cell.type === "spot") {
      await visitSpot(cell, idx);
    } else if (cell.type === "chance" || cell.type === "event") {
      if (fromEvent) say(`停在「${cell.name}」格，這次不再抽卡。`);
      else await drawCard(cell.type);
    } else if (fromEvent) {
      say("回到起點了！");
    }
  }

  async function visitSpot(cell, idx) {
    const first = !state.visited.has(idx);
    // 重複造訪（例如被退後推回來）只給一點散步的旅遊值
    const effect = first ? cell.effect : { travel: 5 };

    await showCard({
      icon: cell.icon,
      tag: `${cell.region}景點${first ? "" : "・舊地重遊"}`,
      theme: cell.theme,
      title: cell.name,
      body: first ? cell.text : "已經蓋過章了，這次悠閒散步，看看上次沒注意到的細節。",
      chips: effectChips(effect),
      button: "蓋章，繼續",
    });

    if (first) {
      state.visited.add(idx);
      state.itinerary.push({ name: cell.name, source: "stamp" });
      renderPlan();
      cellEls[idx].classList.add("visited");
    }
    applyStats(effect);
    renderStats(first ? ["visited"] : []);
    say(`在「${cell.name}」${first ? "蓋章留念" : "舊地重遊"}。`);
  }

  async function drawCard(type) {
    const pool = type === "chance" ? CHANCE_CARDS : EVENT_CARDS;
    let card;
    do { card = pool[randInt(0, pool.length - 1)]; } while (card.title === lastCardTitle && pool.length > 1);
    lastCardTitle = card.title;

    const e = card.effect;
    await showCard({
      icon: card.icon,
      tag: type === "chance" ? "🎒 旅途奇遇" : "🌦️ 突發事件",
      theme: type,
      title: card.title,
      body: card.text,
      chips: effectChips(e),
    });

    applyStats(e);
    if (e.skip) state.skip += e.skip;
    say(`${card.title}：${card.text}`);

    if (e.move) {
      await moveBy(e.move);
      if (!isFinished()) await resolveCell(true);
    }
  }

  // 一個完整回合
  async function takeTurn() {
    if (state.busy || state.over) return;
    state.busy = true;
    els.roll.disabled = true;
    state.turn += 1;

    try {
      // 上回合被耽誤：這回合不擲骰子
      if (state.skip > 0) {
        state.skip -= 1;
        renderStats();
        say("行程延誤，這回合原地休息。");
        await showCard({
          icon: "⏸️", tag: "休息中", theme: "city",
          title: "這回合休息",
          body: "上次的小插曲耽誤了行程，先喘口氣，下回合再出發。",
          chips: [{ text: "本回合不移動", kind: "info" }],
          button: "好，下回合出發",
        });
        return;
      }

      const roll = await rollDice();
      say(`擲出 ${roll} 點！`);
      await moveBy(roll);
      if (!isFinished()) await resolveCell();
      if (isFinished()) finishGame();
    } finally {
      state.busy = false;
      els.roll.disabled = state.over;
      saveGame();
    }
  }

  /* ---------- 5. 結算與重新開始 ---------- */

  function pickTitle() {
    return TITLES.find((t) => t.test(state));
  }

  function shareText(title) {
    return `我在《島遊趣》完成台灣環島旅行！走訪 ${state.visited.size} 個景點，` +
           `旅遊值 ${state.travel}、文化值 ${state.culture}、剩餘旅費 NT$ ${state.money}，` +
           `獲得稱號「${title.name}」！`;
  }

  function finishGame() {
    state.over = true;
    const title = pickTitle();
    $("#res-visited").textContent = `${state.visited.size} / ${TOTAL_SPOTS}`;
    $("#res-travel").textContent = state.travel;
    $("#res-culture").textContent = state.culture;
    $("#res-money").textContent = `NT$ ${state.money}`;
    $("#res-title-name").textContent = title.name;
    $("#res-title-note").textContent = title.note;
    $("#copy-status").textContent = "";
    $("#btn-copy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(shareText(title));
        $("#copy-status").textContent = "已複製，貼給朋友吧！";
      } catch {
        $("#copy-status").textContent = "這個瀏覽器無法自動複製，請手動截圖分享。";
      }
    };
    say("🎉 完成環島！");
    els.result.hidden = false;
    $("#btn-restart").focus();
  }

  function startGame() {
    state = newState();
    lastCardTitle = "";
    cellEls.forEach((el) => el.classList.remove("visited"));
    els.result.hidden = true;
    els.roll.disabled = false;
    showFace(1);
    renderStats();
    placeToken(false);
    els.log.replaceChildren();
    els.hint.textContent = "按下「擲骰子」出發吧！";
    renderPlan();
    saveGame();
  }

  /* ---------- 存檔與旅行行程 ---------- */
  const SAVE_KEY = "island-fun-save-v1";
  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state: {
        ...state, busy: false, visited: [...state.visited]
      }, lastCardTitle }));
      $("#save-status").textContent = "已自動儲存完成的回合與行程。";
    } catch {
      $("#save-status").textContent = "目前無法儲存，關閉後可能遺失進度。請先複製行程。";
    }
  }
  function restoreGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw), s = saved.state;
      if (saved.version !== 1 || !s || !["totalSteps", "money", "travel", "culture", "skip", "turn"].every(k => Number.isSafeInteger(s[k]) && s[k] >= 0)
        || s.totalSteps > MAX_STEPS || typeof s.over !== "boolean" || s.over !== (s.totalSteps === MAX_STEPS)
        || !Array.isArray(s.visited) || !s.visited.every(i => Number.isInteger(i) && BOARD[i]?.type === "spot")
        || !Array.isArray(s.log) || !s.log.every(t => typeof t === "string")
        || !Array.isArray(s.itinerary) || s.itinerary.length > 200 || !s.itinerary.every(t => typeof t.name === "string" && t.name.trim() && t.name.length <= 80 && ["stamp", "custom"].includes(t.source))) return false;
      state = { ...s, visited: new Set(s.visited), busy: false };
      lastCardTitle = typeof saved.lastCardTitle === "string" ? saved.lastCardTitle : "";
      state.visited.forEach(i => cellEls[i].classList.add("visited"));
      renderStats(); renderPlan(); showFace(1); placeToken(false);
      els.log.replaceChildren(...state.log.slice(0, CONFIG.logLines).map(t => {
        const li = document.createElement("li"); li.textContent = t; return li;
      }));
      els.hint.textContent = "已接續上次完成的回合。";
      els.roll.disabled = state.over;
      $("#save-status").textContent = "已讀取上次進度與行程。";
      return true;
    } catch { return false; }
  }
  const mapLink = name => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(name + " 台灣");
  const transitLink = (from, to) => "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(from + " 台灣") + "&destination=" + encodeURIComponent(to + " 台灣") + "&travelmode=transit";
  function renderPlan() {
    $("#itinerary").replaceChildren(...state.itinerary.map((item, i) => {
      const li = document.createElement("li");
      const name = document.createElement("span"); name.textContent = item.name + (item.source === "stamp" ? " · 已蓋章" : " · 自訂"); li.append(name);
      const actions = document.createElement("div"); actions.className = "plan-links";
      function link(label, url) { const a = document.createElement("a"); a.textContent = label; a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; actions.append(a); }
      link("查看地點", mapLink(item.name));
      if (i) link("從上一站查大眾運輸", transitLink(state.itinerary[i-1].name, item.name));
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "移除"; remove.setAttribute("aria-label", "從行程移除" + item.name);
      remove.onclick = () => { state.itinerary.splice(i, 1); renderPlan(); if (!state.busy) saveGame(); };
      actions.append(remove); li.append(actions); return li;
    }));
    if (!state.itinerary.length) $("#itinerary").textContent = "還沒有地點，蓋章或加入自訂地點開始規劃。";
    $("#copy-plan").disabled = !state.itinerary.length;
    $("#plan-fallback").hidden = true; $("#fallback-label").hidden = true;
    $("#plan-status").textContent = "交通連結提供查詢；實際班次、營業與開放狀況請出發前確認。";
  }
  function itineraryText() {
    return "《島遊趣》我的旅行行程\n" + state.itinerary.map((item, i) =>
      `${i+1}. ${item.name}\n地點：${mapLink(item.name)}` + (i ? `\n從上一站查大眾運輸：${transitLink(state.itinerary[i-1].name, item.name)}` : "")
    ).join("\n\n") + "\n\n這是依加入順序整理的旅行靈感，並非已驗證的可行路線。跨縣市或離島請分天安排；班次、轉乘、營業與開放狀況請出發前確認。";
  }
  function setupPlanner() {
    $("#place-form").addEventListener("submit", e => {
      e.preventDefault(); const input = $("#place-name"), name = input.value.trim();
      if (!name) { input.setCustomValidity("請輸入地點名稱"); input.reportValidity(); return; }
      if (state.itinerary.length >= 180) { $("#plan-status").textContent = "行程地點已達上限，請先移除部分地點。"; return; }
      state.itinerary.push({ name: name.slice(0,80), source: "custom" }); input.value = "";
      renderPlan(); if (!state.busy) saveGame(); input.focus();
    });
    $("#place-name").addEventListener("input", e => e.target.setCustomValidity(""));
    $("#copy-plan").onclick = async () => {
      const text = itineraryText();
      try { await navigator.clipboard.writeText(text); $("#plan-status").textContent = "已複製行程，可貼到 LINE 或筆記。"; }
      catch { const box = $("#plan-fallback"); box.value = text; box.hidden = false; $("#fallback-label").hidden = false; box.focus(); box.select(); $("#plan-status").textContent = "無法自動複製，請手動複製下方文字。"; }
    };
    $("#reset-game").onclick = () => {
      if (state.busy) { $("#save-status").textContent = "請先完成目前回合，再重新開始。"; return; }
      if (confirm("要重新開始嗎？目前的遊戲進度與行程都會清除，建議先複製行程。")) startGame();
    };
    $("#result-plan").onclick = () => { els.result.hidden = true; $("#copy-plan").focus(); };
  }

  /* ---------- 啟動 ---------- */

  let started = false;
  async function init() {
    if (started) return;
    started = true;

    Object.assign(els, {
      board: $("#board"), token: $("#token"), die: $("#die"), roll: $("#btn-roll"), hint: $("#hint"),
      statPos: $("#stat-pos"), statMoney: $("#stat-money"), statTravel: $("#stat-travel"),
      statCulture: $("#stat-culture"), statVisited: $("#stat-visited"),
      progressFill: $("#progress-fill"), progressText: $("#progress-text"), log: $("#log"),
      modal: $("#modal"), card: $("#card"), cardTag: $("#card-tag"), cardIcon: $("#card-icon"),
      cardTitle: $("#card-title"), cardBody: $("#card-body"), cardChips: $("#card-chips"), cardBtn: $("#card-btn"),
      result: $("#result"),
    });

    buildBoard();
    buildDie();
    setupPlanner();
    const restored = restoreGame();
    if (!restored) startGame();

    els.roll.addEventListener("click", takeTurn);
    $("#btn-restart").addEventListener("click", startGame);

    // 視窗大小改變時，棋子要重新對齊格子（不播放動畫）
    const realign = () => placeToken(false);
    if ("ResizeObserver" in window) new ResizeObserver(realign).observe(els.board);
    else window.addEventListener("resize", realign);

    if (restored) {
      if (state.over) finishGame();
      return;
    }

    // 開場說明卡
    await showCard({
      icon: "🚆", tag: "歡迎登車", theme: "culture",
      title: "島遊趣",
      body: "擲骰子、走訪景點，繞台灣一圈回到起點就完成旅程。留意旅費，也別錯過旅途中的奇遇！",
      chips: [{ text: `共 ${TOTAL_SPOTS} 個景點可以蓋章`, kind: "info" }],
      button: "出發！",
    });
    placeToken(false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
