(async () => {
  if (document.querySelector("#webdicebot-clone")) return;

  // Load Lua engine (Fengari)
  const fengariLoader = document.createElement("script");
  fengariLoader.src = "https://unpkg.com/fengari-web@0.1.4/dist/fengari-web.js";
  document.head.appendChild(fengariLoader);
  await new Promise(res => fengariLoader.onload = res);

  // UI
  const ui = document.createElement("div");
  ui.id = "webdicebot-clone";
  ui.style = `
    position: fixed; top: 60px; right: 20px; width: 360px; height: 600px;
    background: #111; color: white; z-index: 9999; border-radius: 12px;
    box-shadow: 0 0 10px #0ff; padding: 14px; font-family: monospace; display: flex; flex-direction: column;
  `;

  ui.innerHTML = `
    <h3 style="margin-bottom:10px;">WebDiceBot Clone 🎲</h3>
    <label>Base Bet: <input id="base-bet" type="number" value="0.00000001" step="0.00000001"></label>
    <label>Chance: <input id="chance" type="number" value="49.5" step="0.01"></label>
    <textarea id="lua-script" style="flex:1; margin:10px 0;" placeholder="-- Lua script here"></textarea>
    <div style="margin-bottom:10px;">
      <button id="start-btn">▶️ Start</button>
      <button id="stop-btn" disabled>⏹ Stop</button>
      <button id="export-btn">💾 Export</button>
      <button id="clear-history">🗑 Clear</button>
    </div>
    <pre id="log-box" style="height:80px; overflow:auto; background:#000; color:#0f0; padding:5px;"></pre>
    <div id="history-box" style="height:120px; overflow:auto; background:#222; color:#fff; padding:5px; font-size:12px; margin-top:10px;"></div>
  `;
  document.body.appendChild(ui);

  let running = false;
  const logBox = document.querySelector("#log-box");
  let profit = 0;
  let history = [];

  const log = msg => {
    logBox.textContent += msg + "\n";
    logBox.scrollTop = logBox.scrollHeight;
  };

  const updateHistoryBox = () => {
    const box = document.querySelector("#history-box");
    box.innerHTML = history.map((h, i) =>
      `${i + 1}. ${h.result} | Bet: ${h.bet} | Payout: ${h.payout} | Profit: ${h.profit}`
    ).join("<br>");
  };

  const addHistory = (result, bet, payout, profitChange) => {
    history.push({
      result,
      bet: bet.toFixed(8),
      payout,
      profit: profitChange.toFixed(8)
    });
    updateHistoryBox();
  };

  document.querySelector("#clear-history").onclick = () => {
    history = [];
    updateHistoryBox();
    log("🧹 Histori dibersihkan");
  };

  document.querySelector("#export-btn").onclick = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webdicebot-history.json";
    a.click();
    log("💾 Histori diekspor");
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const getInput = selector => document.querySelector(selector);
  const setInputValue = (input, value) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const clickBetButton = () => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.includes("BET"));
    if (btn) btn.click();
  };

  // Lua Runtime
  const runLua = (script, context) => {
    const L = fengari.lauxlib.luaL_newstate();
    fengari.lualib.luaL_openlibs(L);

    fengari.lua.lua_pushnumber(L, context.nextbet);
    fengari.lua.lua_setglobal(L, "nextbet");

    fengari.lua.lua_pushnumber(L, context.chance);
    fengari.lua.lua_setglobal(L, "chance");

    fengari.lua.lua_pushnumber(L, context.profit);
    fengari.lua.lua_setglobal(L, "profit");

    fengari.lauxlib.luaL_dostring(L, script);
    fengari.lua.lua_getglobal(L, "dobet");
    if (fengari.lua.lua_isfunction(L, -1)) {
      fengari.lua.lua_pcall(L, 0, 0, 0);
    }

    fengari.lua.lua_getglobal(L, "nextbet");
    const nextbet = fengari.lua.lua_tonumber(L, -1);
    fengari.lua.lua_pop(L, 1);

    fengari.lua.lua_getglobal(L, "chance");
    const chance = fengari.lua.lua_tonumber(L, -1);
    fengari.lua.lua_pop(L, 1);

    return { nextbet, chance };
  };

  document.querySelector("#start-btn").onclick = async () => {
    running = true;
    document.querySelector("#start-btn").disabled = true;
    document.querySelector("#stop-btn").disabled = false;

    profit = 0;
    log("▶️ Bot started...");

    while (running) {
      const luaCode = getInput("#lua-script").value;
      let { nextbet, chance } = runLua(luaCode, {
        profit,
        nextbet: parseFloat(getInput("#base-bet").value),
        chance: parseFloat(getInput("#chance").value)
      });

      const betInput = document.querySelector('input[type="number"][min]');
      const chanceInput = document.querySelector('input[type="number"][max]');
      setInputValue(betInput, nextbet.toFixed(8));
      setInputValue(chanceInput, chance.toFixed(2));
      clickBetButton();
      log(`🎯 Bet ${nextbet.toFixed(8)} @ ${chance.toFixed(2)}%`);

      await sleep(3000);

      const resultText = document.querySelector(".text-xxs")?.textContent || "";
      if (resultText.includes("Profit")) {
        const match = resultText.match(/Profit\s+([-\d.]+)/);
        const delta = match ? parseFloat(match[1]) : 0;
        profit += delta;

        const payoutText = resultText.match(/Payout\s+([\d.]+)/);
        const payout = payoutText ? parseFloat(payoutText[1]) : 0;
        const betValue = parseFloat(betInput.value);

        addHistory(delta >= 0 ? "WIN" : "LOSE", betValue, payout, delta);
        log(`✅ Profit ${delta.toFixed(8)} (Total: ${profit.toFixed(8)})`);
      } else {
        log(`⏳ Menunggu hasil...`);
      }

      await sleep(1000);
    }
  };

  document.querySelector("#stop-btn").onclick = () => {
    running = false;
    document.querySelector("#start-btn").disabled = false;
    document.querySelector("#stop-btn").disabled = true;
    log("⏹ Bot stopped.");
  };
})();
