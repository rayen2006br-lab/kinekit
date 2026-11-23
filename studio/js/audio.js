/* ============================================================
   TextFX demo — Web Audio driver
   ────────────────────────────────────────────────────────────
   Ported from the Waveframe Live Studio so this studio has live
   sound cues. Web Audio only — no audio files.
   ============================================================ */

/* ---------------- sounds (Web Audio, no files) ---------------- */
let AC = null;
function audio() {
  if (!AC) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    AC = new Ctx();
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

function noise(c, seconds) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function env(c, peak, attack, decay, at = 0) {
  const g = c.createGain();
  const t = c.currentTime + at;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(c.destination);
  return { gain: g, start: t };
}

const SYNTHS = {
  whoosh(c) {
    const src = c.createBufferSource();
    src.buffer = noise(c, 1.2);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 1.1;
    const t = c.currentTime;
    bp.frequency.setValueAtTime(380, t);
    bp.frequency.exponentialRampToValueAtTime(4200, t + .35);
    bp.frequency.exponentialRampToValueAtTime(480, t + .9);
    const g = env(c, .5, .18, .7);
    src.connect(bp).connect(g.gain);
    src.start(t); src.stop(t + 1.1);
    return 1000;
  },
  swipe(c) {
    const src = c.createBufferSource();
    src.buffer = noise(c, .5);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 2;
    const t = c.currentTime;
    bp.frequency.setValueAtTime(1800, t);
    bp.frequency.exponentialRampToValueAtTime(5200, t + .18);
    const g = env(c, .34, .03, .26);
    src.connect(bp).connect(g.gain);
    src.start(t); src.stop(t + .4);
    return 380;
  },
  sub(c) {
    const o = c.createOscillator(); o.type = 'sine';
    const t = c.currentTime;
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(38, t + .42);
    const g = env(c, .95, .008, .62);
    o.connect(g.gain); o.start(t); o.stop(t + .8);
    return 700;
  },
  riser(c) {
    const o = c.createOscillator(); o.type = 'sawtooth';
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    const t = c.currentTime;
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(1400, t + 1.15);
    const g = env(c, .26, .5, .7);
    o.connect(lp).connect(g.gain); o.start(t); o.stop(t + 1.3);
    return 1250;
  },
  pop(c) {
    const o = c.createOscillator(); o.type = 'sine';
    const t = c.currentTime;
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(180, t + .09);
    const g = env(c, .6, .005, .13);
    o.connect(g.gain); o.start(t); o.stop(t + .2);
    return 200;
  },
  ding(c) {
    [1046, 1568].forEach((f, i) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = env(c, i ? .16 : .3, .004, .85, i * .02);
      o.connect(g.gain); o.start(g.start); o.stop(g.start + 1);
    });
    return 900;
  },
  sparkle(c) {
    [1318, 1760, 2093, 2637].forEach((f, i) => {
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = env(c, .16, .004, .3, i * .06);
      o.connect(g.gain); o.start(g.start); o.stop(g.start + .4);
    });
    return 650;
  },
  glitch(c) {
    const t = c.currentTime;
    for (let i = 0; i < 7; i++) {
      const src = c.createBufferSource();
      src.buffer = noise(c, .07);
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.Q.value = 6;
      bp.frequency.value = 600 + Math.random() * 5000;
      const g = env(c, .22, .002, .05, i * .055);
      src.connect(bp).connect(g.gain);
      src.start(g.start); src.stop(g.start + .08);
    }
    return 500;
  },
  scan(c) {
    const o = c.createOscillator(); o.type = 'square';
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 8;
    const t = c.currentTime;
    o.frequency.setValueAtTime(300, t);
    o.frequency.linearRampToValueAtTime(1600, t + .55);
    bp.frequency.setValueAtTime(700, t);
    bp.frequency.linearRampToValueAtTime(2400, t + .55);
    const g = env(c, .13, .05, .6);
    o.connect(bp).connect(g.gain); o.start(t); o.stop(t + .7);
    return 700;
  },
  coin(c) {
    [1046, 1568].forEach((f, i) => {
      const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f;
      const g = env(c, .12, .004, i ? .28 : .09, i * .08);
      o.connect(g.gain); o.start(g.start); o.stop(g.start + .35);
    });
    return 400;
  },
  boing(c) {
    const o = c.createOscillator(); o.type = 'sine';
    const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 16;
    const lfoGain = c.createGain(); lfoGain.gain.value = 90;
    const t = c.currentTime;
    o.frequency.setValueAtTime(340, t);
    o.frequency.exponentialRampToValueAtTime(120, t + .5);
    lfo.connect(lfoGain).connect(o.frequency);
    const g = env(c, .38, .01, .55);
    o.connect(g.gain); o.start(t); o.stop(t + .65);
    lfo.start(t); lfo.stop(t + .65);
    return 650;
  },
  tape(c) {
    const o = c.createOscillator(); o.type = 'sawtooth';
    const lp = c.createBiquadFilter(); lp.type = 'lowpass';
    const t = c.currentTime;
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(45, t + .85);
    lp.frequency.setValueAtTime(3200, t);
    lp.frequency.exponentialRampToValueAtTime(320, t + .85);
    const g = env(c, .3, .02, .95);
    o.connect(lp).connect(g.gain); o.start(t); o.stop(t + 1);
    return 900;
  }
};

/* Small public hook for the Kinetype studio: one cue, no UI.
   Returns the approximate length in ms, or 0 when Web Audio is
   unavailable. */
window.WF_AUDIO = {
  play(name) {
    const synth = SYNTHS[name];
    if (!synth) return 0;
    const c = audio();
    if (!c) return 0;
    try { return synth(c); } catch (e) { return 0; }
  }
};
