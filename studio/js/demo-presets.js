/* ============================================================
   TextFX 50 — Live Studio preset catalogue
   ────────────────────────────────────────────────────────────
   The 30 presets that ship in TextFX 50, retuned for a browser
   studio: 15 transitions (In / Out pairs) + 15 effects.

   Transition presets use the engine's entrance-model fields:
   distX / distY / dist (signed offsets, negative = from the
   trailing side), scale, scaleX, rotate, rotateX, rotateY —
   Play In for the transition, or flip the Phase toggle to Out.

   Effect presets use engine-only specials:
     neon        static glow, colour = preset.shadowColor
     outline     stroke width = preset.strokePx
     hard/long   offset shadows, shadowColor / shadowDist
     static      jitter frames
     rgbflash    instant invert flash
     flicker     opacity strobe
     float       gentle translate bob
     zoomPunch   scale snap to 1.28 then back
     mirrorSweep rotateY sweep
   ================================================================== */

window.WF_DEMO = (function () {
  'use strict';

  var CATS = [
    { id: 'Transitions', label: 'Transitions', glyph: '⇅', colour: '#ff6228', note: 'In + Out, timed with the preset' },
    { id: 'Effects', label: 'Effects', glyph: '✦', colour: '#a48bff', note: 'Static treatments, keep while it plays' }
  ];

  var PRESETS = [
    /* ---------------- Transitions (entrance fields) ---------------- */
    { id: 'slide-right', name: 'Slide Right', cat: 'Transitions', glyph: '→', blurb: 'Enters from the left, settling in the centre.',
      unit: 'letter', delay: .035, dur: .75, blur: 0, feel: 'smooth', distX: -80, sfx: 'swipe' },
    { id: 'slide-left', name: 'Slide Left', cat: 'Transitions', glyph: '←', blurb: 'Enters from the right, settling in the centre.',
      unit: 'letter', delay: .035, dur: .75, blur: 0, feel: 'smooth', distX: 80, sfx: 'swipe' },
    { id: 'slide-up', name: 'Slide Up', cat: 'Transitions', glyph: '↑', blurb: 'Starts below, slides up into place.',
      unit: 'letter', delay: .035, dur: .8, blur: 0, feel: 'smooth', distY: 80, sfx: 'whoosh' },
    { id: 'slide-down', name: 'Slide Down', cat: 'Transitions', glyph: '↓', blurb: 'Starts above, slides down into place.',
      unit: 'letter', delay: .035, dur: .8, blur: 0, feel: 'smooth', distY: -80, sfx: 'whoosh' },
    { id: 'scale-up', name: 'Scale Up', cat: 'Transitions', glyph: '↑', blurb: 'Smaller at the edge, grows into place.',
      unit: 'letter', delay: .035, dur: .8, blur: 0, feel: 'smooth', scale: 0.05, sfx: 'riser' },
    { id: 'scale-down', name: 'Scale Down', cat: 'Transitions', glyph: '↓', blurb: 'Larger, settles down into place.',
      unit: 'letter', delay: .035, dur: .85, blur: 0, feel: 'smooth', scale: 1.45, sfx: 'riser' },
    { id: 'stretch', name: 'Stretch', cat: 'Transitions', glyph: '≡', blurb: 'Animated letter spacing squashes into place.',
      unit: 'letter', delay: .04, dur: .85, blur: 0, feel: 'smooth', scaleX: 1.35, sfx: 'riser' },
    { id: 'blur-h', name: 'Blur Horizontal', cat: 'Transitions', glyph: '⟷', blurb: 'Focus pulls in as it appears.',
      unit: 'letter', delay: .03, dur: .85, blur: 24, feel: 'smooth', opacity: 0, sfx: 'swipe' },
    { id: 'blur-v', name: 'Blur Vertical', cat: 'Transitions', glyph: '⟨⟩', blurb: 'A taller blur cuts into view.',
      unit: 'letter', delay: .03, dur: .85, blur: 24, rotate: 90, feel: 'smooth', opacity: 0, sfx: 'swipe' },
    { id: 'flip-bw', name: 'Flip Backward', cat: 'Transitions', glyph: '⇆', blurb: 'Tips in from behind the text.',
      unit: 'letter', delay: .035, dur: .8, blur: 0, feel: 'smooth', rotateX: -95, sfx: 'pop' },
    { id: 'flip-fw', name: 'Flip Forward', cat: 'Transitions', glyph: '⇆', blurb: 'Tips in from in front of the text.',
      unit: 'letter', delay: .035, dur: .8, blur: 0, feel: 'smooth', rotateX: 95, sfx: 'pop' },
    { id: 'swivel-l', name: 'Swivel Left', cat: 'Transitions', glyph: '⟳', blurb: 'A door-like half-turn on the Y axis.',
      unit: 'letter', delay: .035, dur: .85, blur: 0, feel: 'smooth', rotateY: -95, sfx: 'whoosh' },
    { id: 'swivel-r', name: 'Swivel Right', cat: 'Transitions', glyph: '⟳', blurb: 'A door-like half-turn, the other way.',
      unit: 'letter', delay: .035, dur: .85, blur: 0, feel: 'smooth', rotateY: 95, sfx: 'whoosh' },
    { id: 'twist', name: 'Twist', cat: 'Transitions', glyph: '↻', blurb: 'Twists and scales into place.',
      unit: 'letter', delay: .035, dur: .85, blur: 0, feel: 'smooth', rotate: -140, scale: .65, sfx: 'boing' },
    { id: 'fisheye', name: 'Fisheye', cat: 'Transitions', glyph: '◉', blurb: 'Zooms in from slightly off-centre, plus blur.',
      unit: 'letter', delay: .035, dur: .85, blur: 8, feel: 'smooth', scale: 1.45, sfx: 'riser' },

    /* ---------------- Effects (static treatments) ---------------- */
    { id: 'glow', name: 'Glow', cat: 'Effects', glyph: '✦', blurb: 'A soft white bloom around the glyphs.',
      unit: 'letter', delay: 0, dur: .9, blur: 0, feel: 'smooth', glow: true, colour: '#ffffff', sfx: 'whoosh' },
    { id: 'neon-cyan', name: 'Neon Cyan', cat: 'Effects', glyph: '✦', blurb: 'A saturated cyan glow on white text.',
      unit: 'letter', delay: 0, dur: 1.2, blur: 0, feel: 'smooth', special: 'neon', shadowColor: '#00e5ff', sfx: 'ding' },
    { id: 'neon-mag', name: 'Neon Magenta', cat: 'Effects', glyph: '✦', blurb: 'A saturated magenta glow.',
      unit: 'letter', delay: 0, dur: 1.2, blur: 0, feel: 'smooth', special: 'neon', shadowColor: '#ff00ff', sfx: 'pop' },
    { id: 'outline', name: 'Outline', cat: 'Effects', glyph: '◐', blurb: 'A thin white stroke around the text.',
      unit: 'letter', delay: 0, dur: .9, blur: 0, feel: 'smooth', special: 'outline', strokePx: 2.5, sfx: 'whoosh' },
    { id: 'hard', name: 'Hard Shadow', cat: 'Effects', glyph: '■', blurb: 'A solid offset shadow underneath.',
      unit: 'letter', delay: 0, dur: .9, blur: 0, feel: 'smooth', special: 'hard', shadowColor: '#ff6228', sfx: 'whoosh' },
    { id: 'long', name: 'Long Shadow', cat: 'Effects', glyph: '↘', blurb: 'A long diagonal drop-shadow.',
      unit: 'letter', delay: 0, dur: 1.0, blur: 0, feel: 'smooth', special: 'long', shadowColor: '#8b5cf6', shadowDist: 8, sfx: 'whoosh' },
    { id: 'glitch-h', name: 'Glitch', cat: 'Effects', glyph: '⌁', blurb: 'A short digital stutter.',
      unit: 'letter', delay: .012, dur: .55, blur: 6, feel: 'smooth', dist: 10, dir: 'right', special: 'glitch', sfx: 'glitch' },
    { id: 'glitch-v', name: 'Glitch Vertical', cat: 'Effects', glyph: '⌁', blurb: 'The same stutter, vertical.',
      unit: 'letter', delay: .012, dur: .55, blur: 6, feel: 'smooth', dist: 10, dir: 'down', special: 'glitchV', sfx: 'glitch' },
    { id: 'static', name: 'TV Static', cat: 'Effects', glyph: '~', blurb: 'Jittery static texture.',
      unit: 'letter', delay: 0, dur: .9, blur: 0, feel: 'smooth', special: 'static', sfx: 'scan' },
    { id: 'rgbflash', name: 'RGB Flash', cat: 'Effects', glyph: '⚡', blurb: 'A sudden red-green-blue flash.',
      unit: 'letter', delay: 0, dur: 1.2, blur: 0, feel: 'smooth', special: 'rgbflash', sfx: 'ding' },
    { id: 'flicker', name: 'Flicker', cat: 'Effects', glyph: '¶', blurb: 'A strobe flicker.',
      unit: 'letter', delay: 0, dur: 2.0, blur: 0, feel: 'smooth', special: 'flicker', sfx: 'ding' },
    { id: 'float', name: 'Float', cat: 'Effects', glyph: '~', blurb: 'Gentle bobbing lift, like the product preset.',
      unit: 'letter', delay: 0, dur: 4.6, blur: 0, feel: 'smooth', special: 'float', sfx: 'whoosh' },
    { id: 'pulse', name: 'Pulse', cat: 'Effects', glyph: '●', blurb: 'A heartbeat emphasis, not an entrance.',
      unit: 'letter', delay: 0, dur: .6, blur: 0, feel: 'bounce', scale: 1.28, opacity: .25, special: 'pulse', sfx: 'pop' },
    { id: 'zoompunch', name: 'Zoom Punch', cat: 'Effects', glyph: '⚡', blurb: 'A quick zoom-in snap, like the product preset.',
      unit: 'letter', delay: 0, dur: 1.9, blur: 0, feel: 'smooth', special: 'zoomPunch', sfx: 'pop' },
    { id: 'mirror-sweep', name: 'Mirror Sweep', cat: 'Effects', glyph: '◧', blurb: 'Sweeps in from the left with a mirror turn.',
      unit: 'letter', delay: 0, dur: 4.0, blur: 0, feel: 'smooth', special: 'mirrorSweep', sfx: 'whoosh' }
  ];

  /* Same Web Audio cues as the Sound Vault section. */
  var SFX = [
    { id: 'whoosh', label: 'Whoosh' },
    { id: 'swipe', label: 'Air Swipe' },
    { id: 'riser', label: 'Riser' },
    { id: 'pop', label: 'Pop' },
    { id: 'ding', label: 'UI Ding' },
    { id: 'sparkle', label: 'Sparkle' },
    { id: 'glitch', label: 'Glitch' },
    { id: 'scan', label: 'Data Scan' },
    { id: 'coin', label: 'Coin' },
    { id: 'boing', label: 'Boing' },
    { id: 'tape', label: 'Tape Stop' },
    { id: 'sub', label: 'Sub Hit' }
  ];

  return {
    presets: PRESETS,
    cats: CATS,
    colours: [
      { id: 'keep', label: 'Layer colour', css: '' },
      { id: '#ffffff', label: 'White', css: '#ffffff' },
      { id: '#a48bff', label: 'Violet', css: '#a48bff' },
      { id: '#8b5cf6', label: 'Kinekit Purple', css: '#8b5cf6' },
      { id: '#ff6228', label: 'Orange', css: '#ff6228' },
      { id: '#4ade80', label: 'Green', css: '#4ade80' },
      { id: '#ff4655', label: 'Red', css: '#ff4655' },
      { id: '#3ec7ff', label: 'Cyan', css: '#3ec7ff' },
      { id: '#ffd23f', label: 'Yellow', css: '#ffd23f' },
      { id: 'grad', label: 'Gradient', css: '' }
    ],
    grad: ['#a48bff', '#8b5cf6'],
    sfx: SFX
  };
})();
