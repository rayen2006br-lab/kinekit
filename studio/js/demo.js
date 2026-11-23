/* ============================================================
   WAVEFRAME — Kinetype Live Studio
   ------------------------------------------------------------
   A browser sketch of the Kinetype preset library.

   • Library → editor, 40 presets across 5 families.
   • Every control is shared: change one and it carries into
     every other style (dots mark the values that follow you).
   • Preview runs on the Web Animations API so In / Out / Both,
     stagger, blur, colour, glow and sweep can all be retimed
     live without a single keyframe in the DOM.
   • Settings persist in localStorage. Reset restores factory
     values for the whole library.

   The shipping panel is the source of truth for preset, phase,
   direction, duration and amount. Unit, easing, delay, blur,
   glow, sweep, colour, align, anchor, size, weight and sound
   are playground extras — labelled as such in the UI.
   ============================================================ */

(function () {
  'use strict';

  var DATA = window.WF_DEMO;
  if (!DATA) return;

  var PRESETS = DATA.presets;
  var CATS = DATA.cats;
  var COLOURS = DATA.colours;
  var GRAD = DATA.grad;
  var SFX = DATA.sfx;

  var BY_ID = {};
  PRESETS.forEach(function (p) { BY_ID[p.id] = p; });
  var CAT_BY_ID = {};
  CATS.forEach(function (c) { CAT_BY_ID[c.id] = c; });

  var STORE_KEY = 'waveframe.kinetype.studio.v1';
  var VERSION = '2.5';
  var CARRY_KEYS = ['unit', 'feel', 'dir', 'amount', 'delay', 'dur', 'blur', 'glow', 'sweep', 'colour', 'align', 'anchor', 'size', 'weight', 'sfx'];
  var UNITS = ['letter', 'word', 'line'];
  var FEELS = ['bounce', 'smooth'];
  var DIRS = ['up', 'down', 'left', 'right'];
  var ALIGNS = ['left', 'center', 'right'];
  var ANCHORS = ['0,0', '0.5,0', '1,0', '0,0.5', '0.5,0.5', '1,0.5', '0,1', '0.5,1', '1,1'];
  var PHASES = ['in', 'out', 'both'];
  var SFX_IDS = SFX.map(function (s) { return s.id; });
  var COLOUR_IDS = COLOURS.map(function (c) { return c.id; });

  var EASE_BOUNCE = 'cubic-bezier(.34,1.56,.64,1)';
  var EASE_SMOOTH = 'cubic-bezier(.2,.9,.25,1)';
  var DIRV = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };
  var SCRAMBLE = '!<>-_\\/[]{}=+*^?#ABCDEFX0123456789';
  var MAX_TEXT = 60;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clamp = function (n, lo, hi) { return Math.min(hi, Math.max(lo, n)); };
  var round = function (n) { return Math.round(n * 100) / 100; };

  /* ---------------- state ---------------- */

  var state = {
    current: 'slide-right',
    text: 'Move fast.',
    phase: 'in',
    loop: true,
    sfxOn: true,
    libOpen: null,
    carry: {}
  };

  function loadState() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object') return;

    if (raw.current && BY_ID[raw.current]) state.current = raw.current;
    if (typeof raw.text === 'string') state.text = raw.text.slice(0, MAX_TEXT);
    if (PHASES.indexOf(raw.phase) >= 0) state.phase = raw.phase;
    if (typeof raw.loop === 'boolean') state.loop = raw.loop;
    if (typeof raw.sfxOn === 'boolean') state.sfxOn = raw.sfxOn;
    if (typeof raw.libOpen === 'boolean') state.libOpen = raw.libOpen;

    if (raw.carry && typeof raw.carry === 'object') {
      Object.keys(raw.carry).forEach(function (key) {
        if (CARRY_KEYS.indexOf(key) < 0) return;
        var clean = sanitize(key, raw.carry[key]);
        if (clean !== null) state.carry[key] = clean;
      });
    }
  }

  function sanitize(key, value) {
    switch (key) {
      case 'unit':   return UNITS.indexOf(value) >= 0 ? value : null;
      case 'feel':   return FEELS.indexOf(value) >= 0 ? value : null;
      case 'dir':    return DIRS.indexOf(value) >= 0 ? value : null;
      case 'align':  return ALIGNS.indexOf(value) >= 0 ? value : null;
      case 'anchor': return ANCHORS.indexOf(value) >= 0 ? value : null;
      case 'colour': return COLOUR_IDS.indexOf(value) >= 0 ? value : null;
      case 'sfx':    return SFX_IDS.indexOf(value) >= 0 ? value : null;
      case 'glow':
      case 'sweep':  return typeof value === 'boolean' ? value : null;
      case 'amount': return isFinite(value) ? clamp(Math.round(value), 0, 200) : null;
      case 'delay':  return isFinite(value) ? clamp(Math.round(value * 1000) / 1000, 0, .3) : null;
      case 'dur':    return isFinite(value) ? clamp(Math.round(value * 20) / 20, .1, 2.4) : null;
      case 'blur':   return isFinite(value) ? clamp(Math.round(value), 0, 60) : null;
      case 'size':   return isFinite(value) ? clamp(Math.round(value), 22, 64) : null;
      case 'weight': return isFinite(value) ? clamp(Math.round(value / 100) * 100, 300, 900) : null;
      default:       return null;
    }
  }

  function settingsFor(preset) {
    var base = {
      unit: preset.unit,
      feel: preset.feel || 'smooth',
      dir: preset.dir || 'up',
      amount: 100,
      delay: preset.delay,
      dur: preset.dur,
      blur: preset.blur || 0,
      glow: !!preset.glow,
      sweep: !!preset.sweep,
      colour: preset.colour || 'keep',
      align: 'center',
      anchor: '',
      size: 50,
      weight: 800,
      sfx: preset.sfx || 'whoosh'
    };
    Object.keys(state.carry).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(base, key)) base[key] = state.carry[key];
    });
    return base;
  }

  var saveTimer = 0;
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
  }
  function saveNow() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        current: state.current,
        text: state.text,
        phase: state.phase,
        loop: state.loop,
        sfxOn: state.sfxOn,
        carry: state.carry
      }));
    } catch (e) { /* private mode — the demo still works */ }
  }

  function setCarry(key, value) {
    state.carry[key] = value;
    saveSoon();
  }

  function hasCarry() {
    return Object.keys(state.carry).length > 0;
  }

  /* ---------------- DOM ---------------- */

  var studio = $('#demoStudio');
  if (!studio) return;

  var editor = $('#editor');
  var library = $('#library');
  var styleList = $('#styleList');
  var styleChips = $('#styleChips');
  var styleSearch = $('#styleSearch');
  var searchClear = $('#searchClear');
  var libEmpty = $('#libEmpty');
  var libCount = $('#libCount');
  var libFootNote = $('#libFootNote');
  var browseBtn = $('#browseBtn');
  var backToLib = $('#backToLib');
  var edGlyph = $('#edGlyph');
  var edName = $('#edName');
  var edCat = $('#edCat');
  var resetStyle = $('#resetStyle');
  var resetAll = $('#resetAll');
  var stage = $('#stage');
  var stageText = $('#stageText');
  var stageSweep = $('#stageSweep');
  var stageStatus = $('#stageStatus');
  var loopBtn = $('#loopBtn');
  var replayBtn = $('#replayBtn');
  var demoText = $('#demoText');
  var charCount = $('#charCount');
  var phaseSeg = $('#phaseSeg');
  var unitSeg = $('#unitSeg');
  var feelSeg = $('#feelSeg');
  var dirSeg = $('#dirSeg');
  var dirField = $('[data-key="dir"]');
  var alignSeg = $('#alignSeg');
  var anchorGrid = $('#anchorGrid');
  var colorRow = $('#colorRow');
  var glowToggle = $('#glowToggle');
  var sweepToggle = $('#sweepToggle');
  var sfxToggle = $('#sfxToggle');
  var sfxSel = $('#sfxSel');
  var amountEl = $('#amount');
  var delayEl = $('#delay');
  var durEl = $('#dur');
  var blurEl = $('#blur');
  var sizeEl = $('#size');
  var weightEl = $('#weight');
  var vAmount = $('#vAmount');
  var vDelay = $('#vDelay');
  var vDur = $('#vDur');
  var vBlur = $('#vBlur');
  var vSize = $('#vSize');
  var vWeight = $('#vWeight');

  var prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQuery = window.matchMedia('(max-width: 980px)');

  var activeCat = 'all';
  var visible = false;
  var anims = [];
  var timers = [];
  var intervals = [];
  var debounce = 0;

  /* ---------------- library ---------------- */

  function renderChips() {
    var html = chipHTML('all', 'All', PRESETS.length, '#ffffff');
    CATS.forEach(function (cat) {
      var count = PRESETS.filter(function (p) { return p.cat === cat.id; }).length;
      html += chipHTML(cat.id, cat.label, count, cat.colour);
    });
    styleChips.innerHTML = html;
  }

  function chipHTML(id, label, count, colour) {
    return '<button class="chip' + (activeCat === id ? ' is-on' : '') + '" type="button" data-cat="' + id + '"' +
      ' aria-pressed="' + (activeCat === id) + '" style="--chip:' + colour + '">' +
      '<i class="chip-dot"></i>' + label + '<span class="chip-n">' + count + '</span></button>';
  }

  function filteredPresets() {
    var q = (styleSearch.value || '').trim().toLowerCase();
    return PRESETS.filter(function (p) {
      if (activeCat !== 'all' && p.cat !== activeCat) return false;
      if (!q) return true;
      return p.name.toLowerCase().indexOf(q) >= 0 ||
        p.cat.toLowerCase().indexOf(q) >= 0 ||
        (p.blurb || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  function renderLibrary() {
    var list = filteredPresets();
    var html = '';

    CATS.forEach(function (cat) {
      var items = list.filter(function (p) { return p.cat === cat.id; });
      if (!items.length) return;
      html += '<div class="lib-group" style="--cat:' + cat.colour + '"><i></i>' + cat.label +
        '<em>' + items.length + '</em><span></span></div>';
      html += items.map(function (p) {
        var on = p.id === state.current;
        return '<button class="tile' + (on ? ' is-on' : '') + '" type="button"' +
          ' data-id="' + p.id + '" aria-pressed="' + on + '" title="' + p.name + ' — ' + p.blurb + '">' +
          '<span class="tile-glyph" style="--cat:' + cat.colour + '">' + p.glyph + '</span>' +
          '<span class="tile-name">' + p.name + '</span>' +
          '</button>';
      }).join('');
    });

    styleList.innerHTML = html;

    libEmpty.hidden = list.length > 0;
    styleList.hidden = list.length === 0;

    if (list.length === PRESETS.length) {
      libCount.textContent = PRESETS.length + ' styles';
    } else {
      libCount.textContent = list.length + ' of ' + PRESETS.length;
    }
    libFootNote.textContent = activeCat === 'all' && !styleSearch.value.trim()
      ? 'The same ' + PRESETS.length + ' presets, demos for each one — these ship as TextFX 50.'
      : 'Showing ' + list.length + ' matching ' + (list.length === 1 ? 'style' : 'styles') + '.';
    searchClear.classList.toggle('is-visible', !!styleSearch.value);
  }

  function selectStyle(id, fromClick) {
    if (!BY_ID[id]) return;
    if (id === state.current) {
      play();
      if (fromClick && mobileQuery.matches) {
        closeLibrary();
      }
      return;
    }
    state.current = id;
    syncControls();
    renderLibrary();
    play();
    saveSoon();

    if (fromClick && mobileQuery.matches) {
      closeLibrary();
      setTimeout(function () {
        editor.scrollIntoView({ behavior: prefersReduce.matches ? 'auto' : 'smooth', block: 'start' });
      }, 50);
    }
  }

  function closeLibrary() {
    studio.dataset.lib = 'closed';
    state.libOpen = false;
    updateBrowse();
    saveSoon();
  }

  /* ---------------- editor chrome ---------------- */

  function updateEditorHead(preset) {
    var cat = CAT_BY_ID[preset.cat];
    edName.textContent = preset.name;
    edCat.textContent = preset.cat + ' · ' + preset.blurb;
    edGlyph.textContent = preset.glyph;
    edGlyph.style.color = cat.colour;
    edGlyph.style.background = cat.colour + '1f';
    edGlyph.style.borderColor = cat.colour + '55';
  }

  function setSeg(seg, value) {
    if (!seg) return;
    $$('button[data-v]', seg).forEach(function (btn) {
      var on = btn.dataset.v === String(value);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function setRange(el, value) {
    if (!el) return;
    var min = parseFloat(el.min);
    var max = parseFloat(el.max);
    el.value = value;
    el.style.setProperty('--p', ((value - min) / (max - min) * 100).toFixed(2) + '%');
  }

  function syncControls() {
    var preset = BY_ID[state.current];
    var s = settingsFor(preset);

    updateEditorHead(preset);
    setSeg(phaseSeg, state.phase);
    setSeg(unitSeg, s.unit);
    setSeg(feelSeg, s.feel);
    setSeg(dirSeg, s.dir);
    setSeg(alignSeg, s.align);

    $$('button', anchorGrid).forEach(function (btn) {
      var on = s.anchor ? btn.dataset.v === s.anchor : btn.dataset.v === '0.5,0.5';
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    glowToggle.classList.toggle('is-on', !!s.glow);
    glowToggle.setAttribute('aria-pressed', String(!!s.glow));
    sweepToggle.classList.toggle('is-on', !!s.sweep);
    sweepToggle.setAttribute('aria-pressed', String(!!s.sweep));
    sfxToggle.classList.toggle('is-on', state.sfxOn);
    sfxToggle.setAttribute('aria-pressed', String(state.sfxOn));

    colorRow.innerHTML = COLOURS.map(function (c) {
      var on = c.id === s.colour;
      var style = c.id === 'grad'
        ? 'background:linear-gradient(120deg,' + GRAD[0] + ',' + GRAD[1] + ')'
        : c.id === 'keep'
          ? ''
          : 'background:' + c.css;
      return '<button class="color' + (c.id === 'keep' ? ' is-keep' : '') + (on ? ' is-on' : '') + '"' +
        ' type="button" data-c="' + c.id + '" style="' + style + '"' +
        ' title="' + c.label + '" aria-label="' + c.label + '" aria-pressed="' + on + '"></button>';
    }).join('');

    setRange(amountEl, s.amount);
    setRange(delayEl, Math.round(s.delay * 1000));
    setRange(durEl, s.dur);
    setRange(blurEl, s.blur);
    setRange(sizeEl, s.size);
    setRange(weightEl, s.weight);

    vAmount.textContent = Math.round(s.amount) + '%';
    vDelay.textContent = Math.round(s.delay * 1000) + ' ms';
    vDur.textContent = Number(s.dur).toFixed(2) + 's';
    vBlur.textContent = Math.round(s.blur) + ' px';
    vSize.textContent = Math.round(s.size) + ' px';
    vWeight.textContent = String(s.weight);

    sfxSel.value = s.sfx;
    sfxSel.disabled = !state.sfxOn;

    var canDir = !!preset.dist && preset.special !== 'shake';
    dirField.classList.toggle('is-off', !canDir);
    dirField.title = canDir ? '' : 'This style has no travel. Try Rise, Slide or Cascade to use direction.';

    $$('[data-key]', editor).forEach(function (field) {
      var key = field.dataset.key;
      if (key === 'phase') return;
      field.classList.toggle('is-custom', Object.prototype.hasOwnProperty.call(state.carry, key));
    });

    var has = hasCarry();
    resetStyle.disabled = !has;
    resetAll.disabled = !has;
    resetStyle.title = has
      ? 'Back to factory settings for every style'
      : 'No carried tweaks yet';

    if (loopBtn) {
      loopBtn.classList.toggle('is-on', state.loop);
      loopBtn.setAttribute('aria-pressed', String(state.loop));
    }
  }

  function updateBrowse() {
    if (!browseBtn) return;
    var open = studio.dataset.lib === 'open';
    browseBtn.textContent = open ? 'Hide styles' : 'Browse styles';
    browseBtn.setAttribute('aria-expanded', String(open));
  }

  /* ---------------- stage ---------------- */

  function unitColour(s, index, count) {
    if (s.colour === 'grad') {
      return mixHex(GRAD[0], GRAD[1], count > 1 ? index / (count - 1) : 0);
    }
    if (s.colour === 'keep') return '#ffffff';
    return s.colour;
  }

  function resolveBase(s) {
    if (s.colour === 'grad') return GRAD[0];
    if (s.colour === 'keep') return '#ffffff';
    return s.colour;
  }

  function glowShadow(colour) {
    return '0 0 10px ' + withAlpha(colour, .7) +
      ', 0 0 30px ' + withAlpha(colour, .38) +
      ', 0 0 64px ' + withAlpha(colour, .2);
  }

  function withAlpha(colour, a) {
    if (!colour) return 'rgba(255,255,255,' + a + ')';
    if (colour.charAt(0) === '#') {
      var h = colour.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')';
    }
    return colour.replace('rgb(', 'rgba(').replace(')', ',' + a + ')');
  }

  function mixHex(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); });
    var pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return 'rgb(' + pa.map(function (v, i) { return Math.round(v + (pb[i] - v) * t); }).join(',') + ')';
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildMarkup(text, unit) {
    var lines = text.split('\n');

    if (unit === 'line') {
      return lines.map(function (line) {
        return '<span class="u line">' + (line ? esc(line) : '&nbsp;') + '</span>';
      }).join('');
    }

    if (unit === 'word') {
      return lines.map(function (line) {
        return line.split(/(\s+)/).map(function (tok) {
          if (!tok) return '';
          if (/^\s+$/.test(tok)) return ' ';
          return '<span class="u">' + esc(tok) + '</span>';
        }).join('');
      }).join('<br>');
    }

    return lines.map(function (line) {
      return line.split(/(\s+)/).map(function (tok) {
        if (!tok) return '';
        if (/^\s+$/.test(tok)) return ' ';
        return '<span class="w">' + Array.from(tok).map(function (ch) {
          return '<span class="u">' + esc(ch) + '</span>';
        }).join('') + '</span>';
      }).join('');
    }).join('<br>');
  }

  function renderStage(preset, s) {
    var raw = (state.text || '').trim();
    var text = raw || 'Your text';
    var base = resolveBase(s);

    stageText.style.textAlign = s.align;
    stageText.style.fontWeight = s.weight;
    stageText.style.color = base;
    stageText.style.textShadow = s.glow ? glowShadow(base) : 'none';

    stageText.innerHTML = buildMarkup(text, s.unit);

    if (preset.special === 'type' && state.phase !== 'out') {
      stageText.insertAdjacentHTML('beforeend', '<span class="caret" aria-hidden="true"></span>');
    }

    var units = $$('.u', stageText);
    var origin = anchorOrigin(s.anchor);
    units.forEach(function (el, i) {
      el.style.transformOrigin = origin;
      var target = unitColour(s, i, units.length);
      if (s.colour === 'grad') el.style.color = target;
      if (preset.special === 'tint') el.style.color = '#ffffff';
      if (s.glow) el.style.textShadow = glowShadow(target);
      /* TextFX specials: static treatments applied once per preview */
      if (preset.special === 'neon') {
        el.style.color = preset.shadowColor || '#ffffff';
        el.style.textShadow = glowShadow(preset.shadowColor || '#ffffff');
      }
      if (preset.special === 'outline') {
        el.style.webkitTextStroke = (preset.strokePx || 2.5) + 'px ' + base;
      }
      if (preset.special === 'hard' || preset.special === 'long') {
        var sc = preset.shadowColor || base;
        var sd = (preset.shadowDist || 9) + 'px';
        el.style.textShadow = (preset.special === 'hard'
          ? sc + ' ' + sd + ' ' + sd
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (n) {
              var d = n * (sd.replace('px', '') / 12) + 'px';
              return sc + ' ' + d + ' ' + d;
            }).join(', '));
      }
    });

    fitText(s.size);
  }

  function anchorOrigin(anchor) {
    if (!anchor) return '50% 50%';
    var p = anchor.split(',');
    return (parseFloat(p[0]) * 100) + '% ' + (parseFloat(p[1]) * 100) + '%';
  }

  function fitText(size) {
    if (!stage) return;
    var max = stage.clientHeight - 74;
    var fs = size;
    stageText.style.fontSize = fs + 'px';
    var guard = 0;
    while (fs > 18 && stageText.scrollHeight > max && guard < 30) {
      fs -= 2;
      stageText.style.fontSize = fs + 'px';
      guard++;
    }
  }

  function updateStatus(looping) {
    var label = state.phase === 'both' ? 'In → Out' : state.phase === 'in' ? 'In' : 'Out';
    var note = prefersReduce.matches ? 'Plays once · reduced motion' : looping ? 'Looping' : 'Plays once';
    stageStatus.innerHTML = '<i></i>' + note + ' · ' + label;
    stageStatus.classList.toggle('is-paused', !looping);
  }

  /* ---------------- preview engine ---------------- */

  function tf(tx, ty, rot, rotX, scale, rotY, scaleX) {
    var sx = scaleX == null ? 1 : scaleX;
    if (!tx && !ty && !rot && !rotX && !rotY && scale === 1 && sx === 1) return 'none';
    var out = [];
    if (rotX || rotY) out.push('perspective(700px)');
    out.push('translate3d(' + round(tx) + 'px,' + round(ty) + 'px,0)');
    if (rot) out.push('rotate(' + round(rot) + 'deg)');
    if (rotX) out.push('rotateX(' + round(rotX) + 'deg)');
    if (rotY) out.push('rotateY(' + round(rotY) + 'deg)');
    if (scale !== 1) out.push('scale(' + round(scale) + ')');
    if (sx !== 1) out.push('scaleX(' + round(sx) + ')');
    return out.join(' ');
  }

  function reverseFrames(frames) {
    return frames.slice().reverse().map(function (f) {
      var out = {};
      for (var k in f) if (Object.prototype.hasOwnProperty.call(f, k)) out[k] = f[k];
      if (typeof out.offset === 'number') out.offset = 1 - out.offset;
      return out;
    }).sort(function (a, b) { return (a.offset || 0) - (b.offset || 0); });
  }

  function phaseFor(kind, preset, s, ctx) {
    var special = preset.special;

    if (special === 'tint') {
      var target = ctx.target;
      return {
        frames: kind === 'out'
          ? [{ color: target }, { color: '#ffffff' }]
          : [{ color: '#ffffff' }, { color: target }],
        easing: 'ease'
      };
    }

    if (special === 'type') {
      return {
        frames: kind === 'out' ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }],
        duration: Math.max(30, Math.min(110, ctx.D * .1)),
        easing: 'steps(1,end)'
      };
    }

    if (special === 'blink') {
      var blink = [
        { opacity: 0 },
        { opacity: 1, offset: .12 },
        { opacity: 0, offset: .24 },
        { opacity: 1, offset: .36 },
        { opacity: 0, offset: .48 },
        { opacity: 1, offset: .6 },
        { opacity: 1, offset: 1 }
      ];
      return { frames: kind === 'out' ? reverseFrames(blink) : blink, easing: 'steps(1,end)' };
    }

    if (special === 'shake') {
      var A = Math.abs(ctx.tx) || Math.abs(ctx.ty) || 12;
      var shake = [
        { transform: 'none' },
        { transform: tf(A * .8, 0, ctx.rot * .8, 0, 1), offset: .12 },
        { transform: tf(-A * .6, 0, -ctx.rot * .6, 0, 1), offset: .26 },
        { transform: tf(A * .35, 0, ctx.rot * .35, 0, 1), offset: .42 },
        { transform: tf(-A * .15, 0, -ctx.rot * .15, 0, 1), offset: .58 },
        { transform: 'none' }
      ];
      return {
        frames: kind === 'out' ? reverseFrames(shake) : shake,
        easing: 'cubic-bezier(.36,.07,.19,.97)'
      };
    }

    if (special === 'glitch' || special === 'glitchV') {
      var g = Math.max(4, Math.abs(ctx.tx) || 10);
      var gb = ctx.blurFrom || 6;
      var glitch = special === 'glitchV'
        ? [
            { transform: 'none', filter: 'blur(0px)', textShadow: 'none' },
            { transform: tf(0, g, 0, 0, 1, 0, .45), filter: 'blur(' + gb + 'px)', textShadow: '0 3px #ff4655, 0 -3px #3ec7ff', offset: .12 },
            { transform: tf(0, -g * .7, 0, 0, 1, 0, -.3), textShadow: '0 -3px #ff4655, 0 3px #3ec7ff', offset: .24 },
            { transform: tf(0, g * .45), filter: 'blur(0px)', textShadow: 'none', offset: .36 },
            { transform: tf(0, -g * .3), offset: .48 },
            { transform: 'none', filter: 'blur(0px)', textShadow: 'none' }
          ]
        : [
            { transform: 'none', filter: 'blur(0px)', textShadow: 'none' },
            { transform: 'translate3d(' + g + 'px,0,0) skewX(-9deg)', filter: 'blur(' + gb + 'px)', textShadow: '2px 0 #ff4655, -2px 0 #3ec7ff', offset: .12 },
            { transform: 'translate3d(' + (-g * .7) + 'px,0,0) skewX(6deg)', textShadow: '-2px 0 #ff4655, 2px 0 #3ec7ff', offset: .24 },
            { transform: 'translate3d(' + (g * .45) + 'px,0,0)', filter: 'blur(0px)', textShadow: 'none', offset: .36 },
            { transform: 'translate3d(' + (-g * .3) + 'px,0,0)', offset: .48 },
            { transform: 'none', filter: 'blur(0px)', textShadow: 'none' }
          ];
      return { frames: kind === 'out' ? reverseFrames(glitch) : glitch, easing: 'steps(1,end)' };
    }

    /* TextFX engine-only specials. */
    if (special === 'neon') {
      return { frames: [{ opacity: 1 }, { opacity: 1 }], duration: 950, easing: 'linear' };
    }
    if (special === 'outline' || special === 'hard' || special === 'long') {
      return { frames: [{ opacity: 1 }, { opacity: 1 }], duration: 950, easing: 'linear' };
    }
    if (special === 'static') {
      return {
        frames: [
          { transform: tf(3, 1, 0, 0, 1), filter: 'blur(0px)', offset: 0 },
          { transform: tf(-3, -1, 0, 0, 1), filter: 'blur(3px)', offset: .2 },
          { transform: tf(3, -1, 0, 0, 1), filter: 'blur(0px)', offset: .45 },
          { transform: tf(-3, 2, 0, 0, 1), filter: 'blur(2px)', offset: .7 },
          { transform: tf(2, 2, 0, 0, 1), filter: 'blur(0px)', offset: 1 }
        ],
        duration: 900, easing: 'steps(4,end)'
      };
    }
    if (special === 'rgbflash') {
      return {
        frames: [
          { filter: 'invert(0)' },
          { filter: 'invert(0)', offset: .4 },
          { filter: 'invert(1)', offset: .42 },
          { filter: 'invert(0)', offset: .5 },
          { filter: 'invert(0)', offset: .9 },
          { filter: 'invert(1)', offset: .92 },
          { filter: 'invert(0)', offset: 1 }
        ],
        duration: 1100, easing: 'steps(4,end)'
      };
    }
    if (special === 'flicker') {
      return {
        frames: [
          { opacity: 1, offset: 0 },
          { opacity: .25, offset: .1 },
          { opacity: 1, offset: .2 },
          { opacity: .35, offset: .32 },
          { opacity: 1, offset: .5 },
          { opacity: .6, offset: .68 },
          { opacity: 1, offset: 1 }
        ],
        duration: 1900, easing: 'steps(5,end)'
      };
    }
    if (special === 'float') {
      return {
        frames: [
          { transform: tf(0, 10, 0, 0, 1) },
          { transform: tf(0, -8, 0, 0, 1) },
          { transform: tf(0, 5, 0, 0, 1) },
          { transform: tf(0, 0, 0, 0, 1) }
        ],
        duration: 4600, easing: 'ease-in-out'
      };
    }
    if (special === 'zoomPunch') {
      return {
        frames: [
          { transform: 'scale(1)', offset: 0 },
          { transform: 'scale(1.28)', offset: .32 },
          { transform: 'scale(1)', offset: .72 },
          { transform: 'scale(1.14)', offset: 1 }
        ],
        duration: 1800, easing: 'cubic-bezier(.35,1.5,.5,1)'
      };
    }
    if (special === 'mirrorSweep') {
      return {
        frames: [
          { transform: tf(0, 0, 0, 0, 1, 0, 1), offset: 0 },
          { transform: tf(0, 0, 0, 0, 1, 55, 1), offset: .4 },
          { transform: tf(0, 0, 0, 0, 1, 0, 1), offset: .8 },
          { transform: tf(0, 0, 0, 0, 1, -30, 1), offset: 1 }
        ],
        duration: 4000, easing: 'ease-in-out'
      };
    }

    var from = {
      opacity: ctx.opFrom,
      filter: 'blur(' + ctx.blurFrom + 'px)',
      letterSpacing: ctx.trackFrom + 'em',
      transform: ctx.fromTf
    };
    var to = {
      opacity: 1,
      filter: 'blur(0px)',
      letterSpacing: '0em',
      transform: 'none'
    };

    return { frames: kind === 'out' ? [to, from] : [from, to], easing: ctx.ease };
  }

  function animatePhase(kind, preset, s, units, ctx, baseDelay) {
    var step = ctx.step;
    var longest = 0;
    var count = units.length;

    units.forEach(function (el, i) {
      ctx.target = unitColour(s, i, count);
      var spec = phaseFor(kind, preset, s, ctx);
      var duration = spec.duration != null ? spec.duration : ctx.D;
      var delay = baseDelay + i * step;

      var anim = el.animate(spec.frames, {
        duration: duration,
        delay: delay,
        easing: spec.easing || ctx.ease,
        fill: 'both'
      });
      anims.push(anim);
      longest = Math.max(longest, delay + duration);

      if ((preset.special === 'decode' || preset.special === 'scramble') && kind === 'in') {
        startScramble(el, delay, ctx.D);
      }
    });

    if (s.sweep && kind !== 'out' && stageSweep) {
      var sweep = stageSweep.animate(
        [{ transform: 'translateX(-130%) skewX(-12deg)' }, { transform: 'translateX(130%) skewX(-12deg)' }],
        { duration: 900, delay: baseDelay + longest * .55, easing: 'ease-in-out', fill: 'both' }
      );
      anims.push(sweep);
    }

    return longest;
  }

  function startScramble(el, delay, duration) {
    var real = el.textContent;
    if (!real.trim()) return;
    var length = real.length;

    var iv = setInterval(function () {
      var out = '';
      for (var i = 0; i < length; i++) {
        out += /\s/.test(real[i]) ? real[i] : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }
      el.textContent = out;
    }, 42);
    intervals.push(iv);

    timers.push(setTimeout(function () {
      clearInterval(iv);
      el.textContent = real;
    }, delay + duration * .72));
  }

  function clearRun() {
    anims.forEach(function (a) {
      try { a.cancel(); } catch (e) { /* already gone */ }
    });
    anims = [];
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
    intervals.forEach(function (t) { clearInterval(t); });
    intervals = [];
  }

  function playSound(name, delay) {
    if (!state.sfxOn || !window.WF_AUDIO) return;
    if (delay) {
      timers.push(setTimeout(function () { window.WF_AUDIO.play(name); }, delay));
    } else {
      window.WF_AUDIO.play(name);
    }
  }

  function hideCaret() {
    var caret = $('.caret', stageText);
    if (caret) caret.classList.add('is-off');
  }

  function play() {
    clearRun();

    var preset = BY_ID[state.current];
    if (!preset) return;
    var s = settingsFor(preset);

    renderStage(preset, s);

    var units = $$('.u', stageText);
    if (!units.length) return;

    var D = Math.max(1, s.dur * 1000);
    var step = Math.max(0, s.delay * 1000);
    var factor = clamp(s.amount / 100, 0, 2);
    var dirv = DIRV[s.dir] || DIRV.up;
    var dist = (preset.dist || 0) * factor;

    var ctx = {
      D: D,
      step: step,
      ease: s.feel === 'bounce' ? EASE_BOUNCE : EASE_SMOOTH,
      tx: preset.distX != null ? preset.distX * factor : (preset.dist ? dirv[0] * dist : 0),
      ty: preset.distY != null ? preset.distY * factor : (preset.dist ? dirv[1] * dist : 0),
      rot: (preset.rotate || 0) * factor,
      rotX: (preset.rotateX || 0) * factor,
      rotY: (preset.rotateY || 0) * factor,
      scaleFrom: 1 - (1 - (preset.scale != null ? preset.scale : 1)) * factor,
      scaleXFrom: 1 - (1 - (preset.scaleX != null ? preset.scaleX : 1)) * factor,
      opFrom: 1 - (1 - (preset.opacity != null ? preset.opacity : 1)) * factor,
      blurFrom: Math.max(0, s.blur * factor),
      trackFrom: (preset.tracking || 0) * factor,
      target: '#ffffff'
    };
    ctx.fromTf = tf(ctx.tx, ctx.ty, ctx.rot, ctx.rotX, ctx.scaleFrom, ctx.rotY, ctx.scaleXFrom);

    var looping = state.loop && !prefersReduce.matches;
    updateStatus(looping);

    if (state.phase !== 'out') playSound(s.sfx, 0);

    if (state.phase === 'out') {
      var outTotal = animatePhase('out', preset, s, units, ctx, 0);
      scheduleNext(outTotal + 1200, looping);
      return;
    }

    var inTotal = animatePhase('in', preset, s, units, ctx, 0);
    if (state.phase === 'in') {
      scheduleNext(inTotal + 1500, looping);
      return;
    }

    timers.push(setTimeout(function () {
      hideCaret();
      var bothOut = animatePhase('out', preset, s, units, ctx, 0);
      scheduleNext(bothOut + 950, looping);
    }, inTotal + 650));
  }

  function scheduleNext(delay, looping) {
    if (!looping) return;
    timers.push(setTimeout(function () {
      if (visible && !document.hidden) play();
    }, delay));
  }

  function schedulePlay() {
    clearTimeout(debounce);
    debounce = setTimeout(play, 45);
  }

  /* ---------------- bindings ---------------- */

  function bindSeg(seg, handler) {
    if (!seg) return;
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-v]');
      if (!btn) return;
      handler(btn.dataset.v);
    });
  }

  function bindRange(el, handler) {
    if (!el) return;
    el.addEventListener('input', function () {
      handler(parseFloat(el.value));
    });
  }

  function bindToggle(el, key) {
    if (!el) return;
    el.addEventListener('click', function () {
      var preset = BY_ID[state.current];
      var current = settingsFor(preset)[key];
      setCarry(key, !current);
      syncControls();
      schedulePlay();
    });
  }

  function init() {
    loadState();

    demoText.value = state.text;
    autoGrow();
    charCount.textContent = state.text.length + '/' + MAX_TEXT;

    sfxSel.innerHTML = SFX.map(function (cue) {
      return '<option value="' + cue.id + '">' + cue.label + '</option>';
    }).join('');

    renderChips();
    renderLibrary();

    if (state.libOpen === null) state.libOpen = !mobileQuery.matches;
    studio.dataset.lib = state.libOpen ? 'open' : 'closed';

    updateBrowse();
    syncControls();

    var preset = BY_ID[state.current];
    renderStage(preset, settingsFor(preset));

    styleSearch.placeholder = 'Search ' + PRESETS.length + ' styles…';

    /* library */
    styleChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      activeCat = chip.dataset.cat;
      renderChips();
      renderLibrary();
    });

    styleSearch.addEventListener('input', renderLibrary);
    styleSearch.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        styleSearch.value = '';
        renderLibrary();
        styleSearch.blur();
      }
    });
    searchClear.addEventListener('click', function () {
      styleSearch.value = '';
      renderLibrary();
      styleSearch.focus();
    });

    styleList.addEventListener('click', function (e) {
      var tile = e.target.closest('.tile');
      if (!tile) return;
      selectStyle(tile.dataset.id, true);
    });

    browseBtn.addEventListener('click', function () {
      var open = studio.dataset.lib === 'open';
      studio.dataset.lib = open ? 'closed' : 'open';
      state.libOpen = !open;
      updateBrowse();
      saveSoon();
      if (!open) {
        library.scrollIntoView({ behavior: prefersReduce.matches ? 'auto' : 'smooth', block: 'start' });
      }
    });

    backToLib.addEventListener('click', function () {
      studio.dataset.lib = 'open';
      state.libOpen = true;
      updateBrowse();
      saveSoon();
      library.scrollIntoView({ behavior: prefersReduce.matches ? 'auto' : 'smooth', block: 'start' });
    });

    /* text */
    demoText.addEventListener('input', function () {
      state.text = demoText.value.slice(0, MAX_TEXT);
      autoGrow();
      charCount.textContent = state.text.length + '/' + MAX_TEXT;
      saveSoon();
      schedulePlay();
    });

    /* phase is global: it is how you are watching the library */
    bindSeg(phaseSeg, function (v) {
      state.phase = v;
      syncControls();
      play();
      saveSoon();
    });

    bindSeg(unitSeg, function (v) { setCarry('unit', v); syncControls(); play(); });
    bindSeg(feelSeg, function (v) { setCarry('feel', v); syncControls(); play(); });
    bindSeg(dirSeg, function (v) {
      if (!BY_ID[state.current].dist) return;
      setCarry('dir', v);
      syncControls();
      play();
    });
    bindSeg(alignSeg, function (v) { setCarry('align', v); syncControls(); play(); });

    anchorGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-v]');
      if (!btn) return;
      var value = btn.dataset.v;
      var current = settingsFor(BY_ID[state.current]).anchor;
      setCarry('anchor', current === value ? '' : value);
      syncControls();
      play();
    });

    colorRow.addEventListener('click', function (e) {
      var btn = e.target.closest('.color');
      if (!btn) return;
      setCarry('colour', btn.dataset.c);
      syncControls();
      play();
    });

    bindToggle(glowToggle, 'glow');
    bindToggle(sweepToggle, 'sweep');

    sfxToggle.addEventListener('click', function () {
      state.sfxOn = !state.sfxOn;
      syncControls();
      saveSoon();
      if (state.sfxOn) playSound(settingsFor(BY_ID[state.current]).sfx, 0);
    });

    sfxSel.addEventListener('change', function () {
      setCarry('sfx', sfxSel.value);
      syncControls();
      if (state.sfxOn) playSound(sfxSel.value, 0);
      saveSoon();
    });

    bindRange(amountEl, function (v) { setCarry('amount', v); syncControls(); schedulePlay(); });
    bindRange(delayEl, function (v) { setCarry('delay', v / 1000); syncControls(); schedulePlay(); });
    bindRange(durEl, function (v) { setCarry('dur', v); syncControls(); schedulePlay(); });
    bindRange(blurEl, function (v) { setCarry('blur', v); syncControls(); schedulePlay(); });
    bindRange(sizeEl, function (v) { setCarry('size', v); syncControls(); schedulePlay(); });
    bindRange(weightEl, function (v) { setCarry('weight', v); syncControls(); schedulePlay(); });

    loopBtn.addEventListener('click', function () {
      state.loop = !state.loop;
      syncControls();
      saveSoon();
      if (state.loop) play();
      else updateStatus(false);
    });

    replayBtn.addEventListener('click', play);

    function doReset() {
      if (!hasCarry()) return;
      state.carry = {};
      syncControls();
      play();
      saveNow();
      if (typeof toast === 'function') {
        toast('Factory settings restored — carried tweaks cleared for every style.');
      }
    }
    resetStyle.addEventListener('click', doReset);
    resetAll.addEventListener('click', doReset);

    /* keep the preview honest about motion preferences */
    if (prefersReduce.addEventListener) {
      prefersReduce.addEventListener('change', function () {
        updateStatus(state.loop && !prefersReduce.matches);
        if (visible) play();
      });
    }

    /* only animate while the studio is on screen */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!visible) {
              visible = true;
              play();
            }
          } else {
            visible = false;
            clearRun();
          }
        });
      }, { threshold: .12 });
      io.observe(studio);
    } else {
      visible = true;
      play();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearRun();
      } else if (visible) {
        play();
      }
    });

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        fitText(settingsFor(BY_ID[state.current]).size);
      }, 150);
    });

    window.addEventListener('pagehide', saveNow);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!anims.length) fitText(settingsFor(BY_ID[state.current]).size);
      });
    }
  }

  function autoGrow() {
    demoText.style.height = 'auto';
    demoText.style.height = Math.min(96, Math.max(26, demoText.scrollHeight)) + 'px';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
