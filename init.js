// == INIT.JS v1 BCH.GAMES BOT UI INJECT ==
// Versi ringan WebDiceBot pribadi kamu - by ChatGPT

(async () => {
  const css = `
    #dicebot-ui {
      position: fixed; top: 10px; left: 10px; z-index: 9999;
      background: #111; color: white; padding: 15px;
      border-radius: 8px; box-shadow: 0 0 10px #0f0;
      font-family: monospace;
    }
    #dicebot-ui input { width: 100px; margin-bottom: 5px; }
    #dicebot-ui button { margin-top: 5px; width: 100%; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const ui = document.createElement('div');
  ui.id = 'dicebot-ui';
  ui.innerHTML = `
    <label>🎲 Basebet: <input id="basebet" value="0.00000001" /></label><br/>
    <label>🎯 Chance: <input id="chance" value="50" /></label><br/>
    <button id="startbot">▶️ Start</button>
    <button id="stopbot">⏹️ Stop</button>
    <pre id="logbox" style="height:100px; overflow:auto; margin-top:5px; background:#000; padding:5px;"></pre>
  `;
  document.body.appendChild(ui);

  let running = false;
  let basebet = 0.00000001;
  let chance = 50;
  let nextbet = basebet;
  let bethigh = true;
  let logbox = document.getElementById('logbox');

  function log(msg) {
    console.log(msg);
    logbox.textContent += msg + '\n';
    logbox.scrollTop = logbox.scrollHeight;
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function clickBet() {
    const amtInput = document.querySelector('input[name="bet-amount"]');
    const chanceInput = document.querySelector('input[name="chance"]');
    const hiBtn = document.querySelector('button.sc-bcXHqe'); // HI
    const loBtn = document.querySelector('button.sc-kgoBCf'); // LO

    if (!amtInput || !chanceInput || !hiBtn || !loBtn) {
      log("❌ Form element not found!");
      return;
    }

    amtInput.value = nextbet;
    chanceInput.value = chance;
    (bethigh ? hiBtn : loBtn).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  async function runBot() {
    basebet = parseFloat(document.getElementById('basebet').value);
    chance = parseFloat(document.getElementById('chance').value);
    nextbet = basebet;
    running = true;
    log("🚀 Bot started");

    while (running) {
      clickBet();
      await sleep(2000); // tunggu 2 detik result

      // Ambil result win/lose dari DOM
      let resultText = document.querySelector('.sc-egnSlO')?.textContent || '';
      let payout = parseFloat(resultText.replace('x', '')) || 0;
      let win = payout > 1;

      if (win) {
        nextbet = basebet;
        log("✅ WIN → Reset to base");
      } else {
        nextbet *= 2;
        log("❌ LOSE → Nextbet: " + nextbet.toFixed(8));
      }

      await sleep(500); // delay antar bet
    }

    log("⏹️ Bot stopped");
  }

  document.getElementById('startbot').onclick = () => {
    if (!running) runBot();
  };
  document.getElementById('stopbot').onclick = () => running = false;
})();
