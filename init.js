// BCH.games Bot Final INIT.JS // Versi lengkap: auto play, Lua, giveaway, chat, UI popup (async () => { const fengariURL = 'https://unpkg.com/fengari-web/dist/fengari-web.js'; const luaScriptDefault = ` -- Contoh Lua: Naikkan bet setelah kalah chance = 50 basebet = 0.00000001 nextbet = basebet bethigh = true

function dobet() if win then nextbet = basebet else nextbet = nextbet * 2 end end `;

// Inject Fengari (Lua engine) if (!window.fengariLoaded) { const fengariScript = document.createElement('script'); fengariScript.src = fengariURL; fengariScript.onload = () => (window.fengariLoaded = true); document.head.appendChild(fengariScript); while (!window.fengariLoaded) await new Promise(r => setTimeout(r, 100)); }

// Create UI const panel = document.createElement('div'); panel.innerHTML = <div id="bot-ui" style="position: fixed; top: 50px; right: 50px; background: #1c1c1c; color: white; padding: 20px; border-radius: 10px; z-index: 9999; width: 320px; font-family: sans-serif;"> <h3 style="margin-top: 0;">🎲 BCH Bot Panel</h3> <label>Base Bet: <input id="base-bet" type="number" value="0.00000001" step="any" style="width:100%;"></label><br><br> <label>Chance: <input id="chance" type="number" value="50" step="any" style="width:100%;"></label><br><br> <textarea id="lua-editor" style="width:100%; height:120px;">${luaScriptDefault}</textarea><br><br> <button id="start-bot">▶️ Start</button> <button id="stop-bot">⛔ Stop</button> <pre id="bot-log" style="background:#000; padding:10px; height:100px; overflow:auto;"></pre> </div>; document.body.appendChild(panel);

const log = msg => { const el = document.getElementById('bot-log'); el.textContent += > ${msg}\n; el.scrollTop = el.scrollHeight; };

let running = false, nextLuaRun = 0; const delay = ms => new Promise(r => setTimeout(r, ms));

async function clickGiveawayIfAvailable() { const joinBtn = [...document.querySelectorAll('div')].find(d => d.textContent.trim() === 'Join'); if (joinBtn) joinBtn.click(); }

async function sendChatMessage(text) { const input = document.querySelector('input[placeholder="Type your message"]'); const send = [...document.querySelectorAll('div')].find(d => d.textContent === 'SEND'); if (input && send) { input.value = text; input.dispatchEvent(new Event('input', { bubbles: true })); send.click(); } }

async function updateBetForm(bet, chance) { const betInput = document.querySelector('input[name="stake"]'); const chanceInput = document.querySelector('input[name="target"]'); if (betInput) betInput.value = bet; if (chanceInput) chanceInput.value = chance; }

async function clickBet() { const btn = [...document.querySelectorAll('div')].find(d => d.textContent === 'START AUTOPLAY'); if (btn) btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); }

async function getLastResult() { const payoutEl = document.querySelector('[title^="x"]'); if (!payoutEl) return null; const multiplier = parseFloat(payoutEl.textContent.replace('x', '')); return multiplier >= 1 ? 'win' : 'lose'; }

async function runBotLoop() { const luaCode = document.getElementById('lua-editor').value; const luaEnv = fengari.load(luaCode); let win = false;

window.chance = parseFloat(document.getElementById('chance').value);
window.basebet = parseFloat(document.getElementById('base-bet').value);
window.nextbet = window.basebet;
window.bethigh = true;

while (running) {
  await updateBetForm(window.nextbet, window.chance);
  await clickBet();
  await delay(3000);
  const result = await getLastResult();
  win = result === 'win';
  window.win = win;
  log(win ? 'WIN' : 'LOSE');
  luaEnv(); // run dobet()

  await clickGiveawayIfAvailable();
  if (Math.random() < 0.1) await sendChatMessage('yohohohhohoho');
}

}

document.getElementById('start-bot').onclick = () => { if (!running) { running = true; runBotLoop(); } };

document.getElementById('stop-bot').onclick = () => { running = false; log('Stopped.'); }; })();

