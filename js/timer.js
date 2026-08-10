```javascript
/* ==========================================================================
   FitForAll — Cronômetro de descanso
   ========================================================================== */

const RestTimer = (function () {
  let remaining = 0;
  let total = 0;
  let intervalId = null;
  let onTick = null;
  let onDone = null;

  // Emite três sons ao finalizar o descanso
  function beep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) return;

      const ctx = new AudioContext();

      [0, 0.18, 0.36].forEach((time, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = index === 2 ? 880 : 660;

        gain.gain.setValueAtTime(
          0.0001,
          ctx.currentTime + time
        );

        gain.gain.exponentialRampToValueAtTime(
          0.25,
          ctx.currentTime + time + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + time + 0.16
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(ctx.currentTime + time);
        oscillator.stop(ctx.currentTime + time + 0.18);
      });

      // Libera o contexto de áudio depois dos sons
      setTimeout(() => {
        ctx.close();
      }, 1000);

    } catch (error) {
      // Áudio indisponível — não interrompe o cronômetro
    }
  }

  // Executa cada segundo enquanto o cronômetro estiver ativo
  function tick() {
    remaining--;

    if (remaining < 0) {
      remaining = 0;
    }

    if (onTick) {
      onTick(remaining, total);
    }

    if (remaining === 0) {
      clearTimer();
      beep();

      if (onDone) {
        onDone();
      }
    }
  }

  // Inicia o intervalo
  function startTimer() {
    if (intervalId !== null) return;

    intervalId = setInterval(tick, 1000);
  }

  // Limpa apenas o intervalo, preservando o tempo restante
  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function start(seconds, tickCb, doneCb) {
    clearTimer();

    remaining = Math.max(0, Number(seconds) || 0);
    total = remaining;

    onTick = typeof tickCb === "function" ? tickCb : null;
    onDone = typeof doneCb === "function" ? doneCb : null;

    if (onTick) {
      onTick(remaining, total);
    }

    if (remaining > 0) {
      startTimer();
    }
  }

  // Para completamente o cronômetro e zera o tempo
  function stop() {
    clearTimer();
    remaining = 0;
    total = 0;
  }

  // Pausa sem perder o tempo restante
  function pause() {
    clearTimer();
  }

  // Continua de onde parou
  function resume() {
    if (intervalId !== null || remaining <= 0) {
      return;
    }

    startTimer();
  }

  function isRunning() {
    return intervalId !== null;
  }

  function getRemaining() {
    return remaining;
  }

  function getTotal() {
    return total;
  }

  return {
    start,
    stop,
    pause,
    resume,
    isRunning,
    getRemaining,
    getTotal
  };
})();
```
