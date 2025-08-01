// == INIT.JS V1.1 BCH.GAMES BOT UI INJECT ==
(function () {
  const style = document.createElement('style');
  style.innerHTML = `
    #wdb-ui {
      position: fixed;
      top: 20px; right: 20px;
      background: #111; color: white;
      z-index: 9999;
      box-shadow: 0 0 10px #0ff;
      padding: 15px;
      border-radius: 10px;
      font-family: sans-serif;
    }
    #wdb-ui input { width: 100px; margin-bottom: 5px; }
    #wdb-ui button { margin: 3px; }
    #wdb-log {
      max-height: 150px; overflow-y: auto;
      font-size: 11px;
      background: #000;
      color: #0f0;
      padding: 5px;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);

  const ui = document.createElement('div');
  ui.id = 'wdb-ui';
  ui.innerHTML = `
    <h3 style="margin-bottom:10px;">🎲 WebDiceBot</h3>
    <label>Base Bet: <input id="basebet" value="0.00000001" /></label><br/>
    <label>Chance: <input id="chance" value="50" /></label><br/>
    <button id="startBtn">START</button>
    <button id="stopBtn">STOP</button>
    <div id="wdb-log">Bot Siap.</div>
  `;
  document.body.appendChild(ui);

  let running = false;
  let interval;
  let previousBet = 0;

  function log(msg) {
    const box = document.getElementById('wdb-log');
    box.innerHTML = `🕹️ ${msg}<br/>` + box.innerHTML;
  }

  function getGameElements() {
    const amtInput = document.querySelector('input[type="number"]');
    const chanceInput = [...document.querySelectorAll('input')].find(el => el.placeholder?.includes('%') || el.value?.includes('.00'));
    const betBtn = [...document.querySelectorAll('button')].find(btn => btn.textContent.toLowerCase().includes('bet') || btn.textContent.toLowerCase().includes('roll'));
    const highBtn = [...document.querySelectorAll('button')].find(btn => btn.textContent.toLowerCase().includes('high') || btn.textContent.toLowerCase().includes('above'));

    if (!amtInput || !chanceInput || !highBtn || !betBtn) {
      log("❌ Form atau tombol tidak ditemukan!");
      return null;
    }

    return { amtInput, chanceInput, highBtn, betBtn };
  }

  async function clickButton(el) {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }

  async function startBot() {
    const elements = getGameElements();
    if (!elements) return;

    const basebet = parseFloat(document.getElementById('basebet').value);
    const baseChance = parseFloat(document.getElementById('chance').value);

    let nextbet = basebet;
    let lastPayout = 0;

    running = true;
    log("Bot dimulai...");

    interval = setInterval(async () => {
      if (!running) return;

      // Cek hasil bet terakhir
      const payoutDiv = [...document.querySelectorAll('div')]
        .find(el => el.textContent.startsWith('x') && el.textContent.includes('.'));

      const payout = payoutDiv ? parseFloat(payoutDiv.textContent.replace('x', '')) : null;

      if (payout && payout !== lastPayout) {
        const win = payout > 1;
        lastPayout = payout;
        log(`${win ? '✅ WIN' : '❌ LOSE'} - Reset to base`);
        nextbet = win ? basebet : previousBet * 2;
      }

      // Set input
      elements.amtInput.value = nextbet.toFixed(8);
      elements.chanceInput.value = baseChance.toFixed(2);

      // Klik tombol BET
      await clickButton(elements.betBtn);

      previousBet = nextbet;
    }, 2500); // jeda antar bet
  }

  function stopBot() {
    clearInterval(interval);
    running = false;
    log("🛑 Bot dihentikan");
  }

  document.getElementById('startBtn').onclick = startBot;
  document.getElementById('stopBtn').onclick = stopBot;
})();
