// === INIT.JS v1 — BCH.GAMES BOT UI INJECT ===
// Versi ringan WebDiceBot pribadi kamu (UI + Lua editor + kontrol asli)

(async function () {
  // 1. Inject Tailwind CSS
  const style = document.createElement("link");
  style.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
  style.rel = "stylesheet";
  document.head.appendChild(style);

  // 2. Create UI Wrapper
  const wrapper = document.createElement("div");
  wrapper.className =
    "fixed bottom-4 right-4 z-50 bg-yellow-200 shadow-xl rounded-2xl p-4 w-96 text-sm text-black font-mono";
  wrapper.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h2 class="font-bold text-lg">🎲 BCH DiceBot v1</h2>
      <button id="closeBot" class="text-red-600 hover:text-red-800">✖</button>
    </div>
    <div class="mb-2">
      <label class="block">Base Bet</label>
      <input id="basebet" class="w-full px-2 py-1 rounded bg-white border" value="0.00000001">
    </div>
    <div class="mb-2">
      <label class="block">Chance</label>
      <input id="chance" class="w-full px-2 py-1 rounded bg-white border" value="50">
    </div>
    <div class="mb-2">
      <label class="block">Lua Strategy</label>
      <textarea id="luaScript" class="w-full h-32 p-2 bg-white border rounded"></textarea>
    </div>
    <div class="flex justify-between gap-2">
      <button id="startBtn" class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">Start</button>
      <button id="stopBtn" class="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-600">Stop</button>
    </div>
    <div class="mt-3">
      <label class="block font-bold">Log:</label>
      <pre id="botLog" class="bg-black text-green-300 p-2 rounded h-32 overflow-auto"></pre>
    </div>
  `;
  document.body.appendChild(wrapper);

  document.getElementById("closeBot").onclick = () => wrapper.remove();

  // 3. Load Fengari (Lua engine in JS)
  const fengariScript = document.createElement("script");
  fengariScript.src = "https://unpkg.com/fengari-web/dist/fengari-web.js";
  document.head.appendChild(fengariScript);
  await new Promise((r) => (fengariScript.onload = r));

  // 4. Basic Lua → JavaScript bridge (simulasi dobet loop manual)
  let running = false;

  document.getElementById("startBtn").onclick = () => {
    const basebet = parseFloat(document.getElementById("basebet").value);
    const chance = parseFloat(document.getElementById("chance").value);
    const luaCode = document.getElementById("luaScript").value;
    running = true;
    log(`▶️ Start bot @ ${basebet} / ${chance}%`);

    // Set nilai basebet & chance ke form BCH.games asli
    const betInput = document.querySelector('input[name="amount"]');
    const chanceInput = document.querySelector('input[name="chance"]');
    if (betInput) betInput.value = basebet;
    if (chanceInput) chanceInput.value = chance;

    runLuaScript(luaCode);
  };

  document.getElementById("stopBtn").onclick = () => {
    running = false;
    log("⏹️ Bot dihentikan");
  };

  function log(msg) {
    const logBox = document.getElementById("botLog");
    logBox.textContent += `\n${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }

  function runLuaScript(luaCode) {
    try {
      fengari.load(luaCode)();
    } catch (e) {
      log("❌ Lua Error: " + e.message);
    }
  }
})();
