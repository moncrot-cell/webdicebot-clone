// == WebDiceBot UI Inject Final - BCH.GAMES Real BET ==
// By ChatGPT for moncrot-cell — Versi stabil jalan real

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
    #logbox { background: black; padding: 5px; height: 100px; overflow: auto; margin-top: 5px; }
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
    <pre id="logbox"></pre>
  `;
  document.body.appendChild(ui);

  let running = false;
  let basebet = 0.00000001;
  let chance = 50;
  let nextbet = basebet;
  let bethigh = true;
  const logbox = document.getElementById('logbox');

  function log(msg) {
    console.log(msg);
    logbox.textContent += msg + '\n';
    logbox.scrollTop = logbox.scrollHeight;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function clickBet() {
    const amtInput = document.querySelector('input[name="bet-amount"]');
    const chanceInput = document.querySelector('input[name="chance"]');
    const hiBtn = [...document.querySelectorAll('button')].find(btn => btn.innerText.trim().toUpperCase() === 'HIGH');
    const loBtn = [...document.querySelectorAll('button')].find(btn => btn.innerText.trim().toUpperCase() === 'LOW');

    if (!amtInput || !chanceInput || !hiBtn || !loBtn) {
      log("❌ Form atau tombol tidak ditemukan!");
      return;
    }

    amtInput.value = nextbet;
    amtInput.dispatchEvent(new Event("input", { bubbles: true }));

    chanceInput.value = chance;
    chanceInput.dispatchEvent(new Event("input", { bubbles: true }));

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });

    if (bethigh) {
      hiBtn.dispatchEvent(clickEvent);
      log("🎯 Klik HIGH");
    } else {
      loBtn.dispatchEvent(clickEvent);
      log("🎯 Klik LOW");
    }
  }

  async function runBot() {
    basebet = parseFloat(document.getElementById('basebet').value);
    chance = parseFloat(document.getElementById('chance').value);
    nextbet = basebet;
    bethigh = true;
    running = true;
    log("🚀 Bot dimulai");

    while (running) {
      clickBet();
      await sleep(2000); // tunggu hasil

      // Ambil hasil payout dari elemen hasil
      let resultText = document.querySelector('.sc-egnSlO')?.textContent || '';
      let payout = parseFloat(resultText.replace('x', '')) || 0;
      let win = payout >= 1.01;

      if (win) {
        nextbet = basebet;
        log("✅ WIN — Reset to base");
      } else {
        nextbet *= 2;
        log("❌ LOSE — Nextbet: " + nextbet.toFixed(8));
      }

      await sleep(500); // delay antar bet
    }

    log("⏹️ Bot dihentikan");
  }

  document.getElementById('startbot').onclick = () => {
    if (!running) runBot();
  };
  document.getElementById('stopbot').onclick = () => {
    running = false;
  };
})();
