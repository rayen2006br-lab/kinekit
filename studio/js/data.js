/* ============================================================
   TextFX 50 — studio site data
   ────────────────────────────────────────────────────────────
   Ported from the Waveframe studio, rebranded:
     - brand voice: Kinekit
     - products: TextMotion Pack, SoundVault 300, TextFX 50
   ============================================================ */

const SITE = {
  brand: {
    name: 'kinekit',
    dot: '.',
    tagline: 'Motion tools for editors who move fast.',
    email: 'you@example.com',
    instagram: 'https://instagram.com/',
    store: '#products'
  },

  stats: [
    { num: '26', label: 'text animations' },
    { num: '300', label: 'sound effects' },
    { num: '50', label: 'text FX & transitions' },
    { num: '∞', label: 'free updates' }
  ],

  products: [
    {
      id: 'textmotion',
      cat: 'After Effects + Premiere Extension',
      name: 'TextMotion Pack',
      desc: '26 text animations for After Effects and Premiere Pro. Live preview with your own text, tweak it, click once — on one layer or twenty.',
      price: '$9.99',
      unit: 'one-time',
      cta: '#'
    },
    {
      id: 'textfx50',
      cat: 'Premiere Pro Presets',
      name: 'TextFX 50',
      desc: '50 text effects and transitions for Premiere Pro — neon, glitch, shake, flicker, slides, flips and more.',
      price: '$6.99',
      unit: 'one-time',
      cta: '#'
    },
    {
      id: 'soundvault',
      cat: 'Sound effects',
      name: 'SoundVault 300',
      desc: '300 level-matched WAV effects, generated in-house and sorted into 10 categories.',
      price: '$4.99',
      unit: 'one-time',
      cta: '#'
    },
    {
      id: 'soon',
      cat: 'In the workshop',
      name: '???',
      desc: 'Something is on the bench. Join the list and you will hear about it first.',
      price: 'Soon',
      cta: ''
    }
  ],

  /* Same Web Audio cues as the Sound Vault section. */
  sounds: [
    { name: 'Whoosh', synth: 'whoosh' },
    { name: 'Air Swipe', synth: 'swipe' },
    { name: 'Sub Hit', synth: 'sub' },
    { name: 'Riser', synth: 'riser' },
    { name: 'Pop', synth: 'pop' },
    { name: 'UI Ding', synth: 'ding' },
    { name: 'Sparkle', synth: 'sparkle' },
    { name: 'Glitch', synth: 'glitch' },
    { name: 'Data Scan', synth: 'scan' },
    { name: 'Coin', synth: 'coin' },
    { name: 'Boing', synth: 'boing' },
    { name: 'Tape Stop', synth: 'tape' }
  ],

  review: {
    stars: 5,
    text: '"The preview panel alone saved me a full afternoon. I stop guessing which animation fits the cut and just look at it."',
    who: 'Sample review',
    role: 'Motion designer',
    product: 'TextMotion Pack',
    note: 'Replace this with a real, verified review before you publish.'
  },

  faq: [
    { q: 'Can I try before I buy?', a: 'Yes. Run the TextFX Live Studio above with your own copy, and preview sounds from SoundVault 300 further down this page.' },
    { q: 'Mac or Windows?', a: 'Both. Every tool ships as a one-click installer for macOS and Windows.' },
    { q: 'Does TextFX 50 work in Premiere Pro?', a: 'Yes — it ships as a pure .prfpset file: drag it onto any text or graphic clip, no plugins.' },
    { q: 'Do I get free updates?', a: 'All 1.x updates are free. Panels do not auto-update; you get a download link by email when a new build ships.' },
    { q: 'Can I use these commercially?', a: 'Yes. Buy once, use in personal and client work, no royalties and no per-project fees.' },
    { q: 'How do I install TextFX 50?', a: 'Download the .prfpset file, open the Extensions panel in Premiere Pro, and use the import presets button in the Effects panel.' },
    { q: 'How do I install TextMotion Pack?', a: 'One-click installer, then Window → Extensions inside your editor.' },
    { q: 'How do I get support?', a: 'Email <a href="mailto:you@example.com">you@example.com</a> or DM us. Replies usually land within two business days.' }
  ]
};
