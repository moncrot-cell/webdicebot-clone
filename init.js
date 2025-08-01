""// === INIT.JS v2 — BCH.GAMES BOT UI + Lua + Real BET === // Versi lengkap WebDiceBot Clone (UI, Lua Editor, Auto BET)

(async function () { // 1. Inject Tailwind CSS const style = document.createElement("link"); style.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"; style.rel = "stylesheet"; document.head.appendChild(style);

// 2. Create UI const wrapper = document.createElement("div"); wrapper.className = "fixed bottom-4 right-4 z-50 bg-yellow-200 shadow-xl rounded-2xl p-4 w-96 text-sm text-black font-mono"; wrapper.innerHTML = <div class="flex justify-between items-center mb-2"> <h2 class="font-bold text-lg">🎲 BCH DiceBot v2</h2> <button id="closeBot" class="text-red-600 hover:text-red-800">✖</button> </div> <div class="mb-2"> <label class="block">Base Bet</label> <input id="basebet" class="w-full px-2 py-1 rounded bg-white border" value="0.00000001"> </div> <div class="mb-2"> <label class="block">Chance</label> <input id="chance" class="w-full px-2 py-1 rounded bg-white border" value="50"> </div> <div class="mb-2"> <label class="block">Lua Strategy</label> <textarea id="luaScript" class="w-full h-32 p-2 bg-white border rounded"></textarea> </div> <div class="flex justify-between gap-2"> <button id="startBtn" class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">Start</button> <button id="stopBtn" class="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-600">Stop</button> </div> <div class="mt-3"> <label class="block font-bold">Log:</label> <pre id="botLog" class="bg-black text-green-300 p-2 rounded h-32 overflow-auto"></pre> </div>; document.body.appendChild(wrapper);

document.getElementById("closeBot").onclick = () => wrapper.remove();

// 3. Load Fengari (Lua engine) const fengariScript = document.createElement("script"); fengariScript.src = "https://unpkg.com/fengari-web/dist/fengari-web.js"; document.head.appendChild(fengariScript); await new Promise((r) => (fengariScript.onload = r));

let running = false; let L;

const log = (msg) => { const logBox = document.getElementById("botLog"); logBox.textContent += \n${msg}; logBox.scrollTop = logBox.scrollHeight; };

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const executeBet = async () => { const betInput = document.querySelector('input[name="amount"]'); const chanceInput = document.querySelector('input[name="chance"]'); const hiBtn = document.querySelector("button.sc-bcXHqe"); const loBtn = document.querySelector("button.sc-kpDqfm");

const nextbet = fengari.tojs(L, fengari.lua.getglobal(L, "nextbet"));
const chance = fengari.tojs(L, fengari.lua.getglobal(L, "chance"));
const bethigh = fengari.tojs(L, fengari.lua.getglobal(L, "bethigh"));

betInput.value = nextbet.toFixed(8);
chanceInput.value = chance.toFixed(2);

(bethigh ? hiBtn : loBtn).dispatchEvent(new MouseEvent("click", { bubbles: true }));

};

const getWinLose = async () => { let tries = 0; while (tries < 50) { await wait(200); const payoutDiv = [...document.querySelectorAll("div[title^='x']")].pop(); if (!payoutDiv) continue; const payout = parseFloat(payoutDiv.textContent.replace("x", "")); return payout >= 1.01; } return null; };

document.getElementById("startBtn").onclick = async () => { const basebet = parseFloat(document.getElementById("basebet").value); const chance = parseFloat(document.getElementById("chance").value); const luaCode = document.getElementById("luaScript").value;

running = true;
L = fengari.lauxlib.luaL_newstate();
fengari.lualib.luaL_openlibs(L);
fengari.lauxlib.luaL_dostring(L, fengari.to_luastring(`
  basebet = ${basebet}
  nextbet = basebet
  chance = ${chance}
  bethigh = true
  ${luaCode}
`));

log(`▶️ Bot started with base ${basebet}, chance ${chance}`);

while (running) {
  await executeBet();
  const win = await getWinLose();

  fengari.lua.pushboolean(L, win);
  fengari.lua.setglobal(L, "win");
  fengari.lauxlib.luaL_dostring(L, fengari.to_luastring(`dobet()`));
}

};

document.getElementById("stopBtn").onclick = () => { running = false; log("⏹️ Bot stopped."); }; })();

