// === FULLBOT.JS ===
(function() {
  // Inject UI
  const css = document.createElement('style');
  css.textContent = `
    #bot-ui {
      position: fixed; top: 80px; right: 20px; z-index: 9999;
      background: #111; color: white; padding: 15px; border-radius: 10px;
      width: 300px; font-family: monospace; box-shadow: 0 0 10px #0f0;
    }
    #bot-ui textarea { width: 100%; height: 100px; margin-top: 5px; background: #222; color: #0f0; }
    #bot-ui button { margin-top: 10px; width: 100%; background: #0f0; color: black; font-weight: bold; }
    #bot-log { height: 80px; overflow-y: auto; font-size: 12px; margin-top: 10px; background: #000; padding: 5px; }
  `;
  document.head.appendChild(css);

  const ui = document.createElement('div');
  ui.id = 'bot-ui';
  ui.innerHTML = `
    <div><b>💠 BCH Bot Dice</b></div>
    <textarea id="lua-code">nextbet = 0.00000001\nchance = 50\nfunction dobet()\n  if win then\n    nextbet = 0.00000001\n  else\n    nextbet *= 2\n  end\nend</textarea>
    <button id="start-bot">▶️ Start Bot</button>
    <button id="stop-bot">⛔ Stop Bot</button>
    <div id="bot-log"></div>
  `;
  document.body.appendChild(ui);

  const log = (msg) => {
    const box = document.getElementById('bot-log');
    box.innerHTML += `<div>${msg}</div>`;
    box.scrollTop = box.scrollHeight;
  };

  // === Lua Setup
  const L = fengari.lauxlib.luaL_newstate();
  fengari.lualib.luaL_openlibs(L);

  const loadLua = () => {
    const code = document.getElementById('lua-code').value;
    fengari.lauxlib.luaL_dostring(L, fengari.to_luastring(code));
  };

  // === Auto Play Dice
  let playing = false;
  let interval;
  const playDice = () => {
    if (!playing) return;
    const nextbet = document.querySelector('input[name="amount"]');
    const chance = document.querySelector('input[name="chance"]');
    const high = document.querySelector('input[name="betHigh"]');

    try {
      fengari.lauxlib.luaL_dostring(L, fengari.to_luastring("dobet()"));
    } catch (e) {
      log("Lua Error: " + e.message);
      return;
    }

    const _nextbet = fengari.lua.lua_tojsstring(L, fengari.lua.lua_getglobal(L, "nextbet"));
    const _chance = fengari.lua.lua_tojsstring(L, fengari.lua.lua_getglobal(L, "chance"));
    const _high = fengari.lua.lua_tojsstring(L, fengari.lua.lua_getglobal(L, "bethigh"));

    if (nextbet) nextbet.value = _nextbet || "0.00000001";
    if (chance) chance.value = _chance || "50";
    if (high && _high !== null) high.checked = (_high === "true");

    // Click bet
    const btn = document.querySelector('button[data-bet-button]');
    if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };

  // Start / Stop
  document.getElementById("start-bot").onclick = () => {
    loadLua();
    playing = true;
    interval = setInterval(playDice, 3000);
    log("▶️ Bot Started");
  };
  document.getElementById("stop-bot").onclick = () => {
    clearInterval(interval);
    playing = false;
    log("⛔ Bot Stopped");
  };

  // === Auto Giveaway Claim
  setInterval(() => {
    const joinBtn = [...document.querySelectorAll('div')].find(el => el.textContent.trim() === "Join");
    if (joinBtn && joinBtn.offsetParent !== null) {
      joinBtn.click();
      log("🎁 Auto-claimed giveaway");
    }
  }, 5000);

  // === Auto Chat (anti-spam)
  setInterval(() => {
    const input = document.querySelector('input[placeholder="Type your message"]');
    const sendBtn = [...document.querySelectorAll("button")].find(el => el.textContent.trim() === "SEND");
    if (input && sendBtn && input.value === "") {
      input.value = "yohohohhohoho";
      sendBtn.click();
      log("💬 Sent chat");
    }
  }, 90000); // 90 detik biar aman anti spam

})();
