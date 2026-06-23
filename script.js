/* ═══════════════════════════════════════════════════════
   THE PRICE OF KNOWLEDGE — script.js
   Physical book: NO scroll. Fixed spreads per chapter.
═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   SPREAD DATA
   Each spread = { left: PageDef, right: PageDef }
   PageDef = { runHead, blocks: [...] }
   block types: orn | actLabel | chTitle | subTitle |
     verse | illus | sceneList | spacer | back | text | rule | divider
   illus block: { layout: 'a'|'b'|'c'|'d' }
     a = illus top + verse below (default)
     b = verse top + illus bottom
     c = illus float-left + verse wraps
     d = illus float-right + verse wraps
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────
   SPREAD IMG DATA
   Each spread = { spreadImg: "path.png", quadrant: 0|1|2|3 }
     quadrant: 0=top-left  1=top-right
               2=bot-left  3=bot-right
   The image is a 2×2 grid of book openings.
   Optional: { back: true } adds the "Back to Act" button overlay.
   Music trigger still uses spreadIdx.
───────────────────────────────────────────────────────── */
const SPREADS = {
  "1-1": [
    // ── grid 1: Spread 0 (Scene I) + Spread 1 (Elbren's warning) ──
    { spreadImg:"grid01.png", quadrant:0 },           // 0 — Scene I, part 1
    { spreadImg:"grid01.png", quadrant:1 },           // 1 — Scene I, part 2
    { spreadImg:"grid01.png", quadrant:2 },           // 2 — Elbren
    { spreadImg:"grid01.png", quadrant:3 },           // 3 — Meriadas crosses veil
    // ── grid 2: Chorus I + Scene II (Meriadas' Room) ──
    { spreadImg:"grid02.png", quadrant:0 },           // 4 — Chorus I (illus)
    { spreadImg:"grid02.png", quadrant:1 },           // 5 — Chorus I (verse)
    { spreadImg:"grid02.png", quadrant:2 },           // 6 — Scene II, part 1
    { spreadImg:"grid02.png", quadrant:3 },           // 7 — Scene II, part 2
    // ── grid 3: Chorus II + Part II title ──
    { spreadImg:"grid03.png", quadrant:0 },           // 8 — Chorus II (illus)
    { spreadImg:"grid03.png", quadrant:1 },           // 9 — Chorus II (verse)
    { spreadImg:"grid03.png", quadrant:2 },           // 10 — Part II title
    { spreadImg:"grid03.png", quadrant:3 },           // 11 — Scene III intro
    // ── grid 4: Scene III (Betweenway) + Chorus III ──
    { spreadImg:"grid04.png", quadrant:0 },           // 12 — Betweenway, part 1
    { spreadImg:"grid04.png", quadrant:1 },           // 13 — Betweenway, part 2
    { spreadImg:"grid04.png", quadrant:2 },           // 14 — Chorus III (illus)
    { spreadImg:"grid04.png", quadrant:3 },           // 15 — Chorus III (verse)
    // ── grid 5: Scene IV (Road Back) + Chorus IV ──
    { spreadImg:"grid05.png", quadrant:0 },           // 16 — Scene IV, part 1
    { spreadImg:"grid05.png", quadrant:1 },           // 17 — Scene IV, part 2
    { spreadImg:"grid05.png", quadrant:2 },           // 18 — Chorus IV (illus)
    { spreadImg:"grid05.png", quadrant:3, back:true },// 19 — Chorus IV (verse) + fim
  ]
};

// Legacy spread data kept for reference — not used in rendering
const SPREADS_LEGACY = {
  // act 1, chapter 1
  "1-1-legacy": [

    /* ── SPREAD 0: intro title page ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "v",
        blocks: [
          { t:"orn" },
          { t:"actLabel", text:"Chapter I" },
          { t:"chTitle",  text:"The Old Master's Room" },
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"Four souls beneath the dusk",
            verses:[{
              label:"", lines:[
                "From roots below the shattered stone,",
                "From which the sun has not yet grown,",
                "Four weary souls were pained and scarred,",
                "And o'er their heads, the night stood guard.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Scene I — The Ethereal Message",
        pgNum: "vi",
        blocks: [
          
          {
            t:"illus", size:"md", layout:"b",
            caption:"A spectral figure slowly did pray",
            verses:[{
              label:"", lines:[
                "The wind then carried distant chimes,",
                "Like echoes buried out of time,",
                "And through the fading light of day,",
                "A spectral figure slowly did pray.",
              ]
            }]
          }
        ]
      }
    },

    /* ── SPREAD 1: Elbren's warning ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "vii",
        blocks: [

          {
            t:"illus", size:"lg", layout:"a",
            caption:"Old Elbren spoke through ghostly light",
            verses:[{
              label:"", lines:[
                "Old Elbren spoke through ghostly light,",
                "His emerald robes pale blue that night,",
                "\u201cThe Codex lost\u2026 the veil grows thin,",
                "A darker age now stirs within.\u201d",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Scene I — The Ethereal Message",
        pgNum: "viii",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"md", layout:"a",
            caption:"Meriadas hath crossed the veil",
            verses:[{
              label:"", lines:[
                "\u201cMeriadas has crossed the veil,",
                "To hunt the one who chose betrayal,",
                "But none returned, their paths are lost,",
                "What wilt thou do, whate\u2019er the cost?",
              ]
            }]
          }
        ]
      }
    },

    /* ── SPREAD 1b: Chorus I ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "ix",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"Four souls bound by shadow and rust",
            verses:[{
              label:"", lines:[
                "And so the warning passed like smoke,",
                "While lanterns guttered, candles broke,",
                "Four hearts stood still beneath that gaze\u2014",
                "The ghost had set their path ablaze.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Act I · Chapter I",
        pgNum: "x",
        blocks: [
          { t:"orn" },
          { t:"verse", label:"", chorus:true, lines:[
            "Ohhh\u2026 four souls beneath the dusk,",
            "Bound by ruin, ash and rust,",
            "While distant bells through darkness call,",
            "The world prepares for shadows\u2019 fall.",
            "And somewhere still, the past will blight,",
            "With old secrets woken \u2019neath the night\u2026",
            "The road ahead grows cold and long,",
            "Where even wisdom can go wrong.",
          ]}
        ]
      }
    },

    /* ── SPREAD 2: Scene II — Meriadas' Room ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "ix",
        blocks: [
          { t:"orn" },
          { t:"actLabel", text:"Scene II" },
          { t:"subTitle", text:"Meriadas\u2019 Room" },
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"A room where dust itself had wept",
            verses:[{
              label:"", lines:[
                "Through the rift silence slept,",
                "In a room where dust itself had wept,",
                "Yet scattered pages lined the floor,",
                "Like love had fled through every door.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Scene II — Meriadas\u2019 Room",
        pgNum: "x",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"md", layout:"d",
            caption:"Reflecting more than should be there",
            verses:[{
              label:"", lines:[
                "A mirror watched with silver stare,",
                "Reflecting more than should be there,",
                "And carved in oak with crimson thread,",
                "The signs of life\u2026 of pain\u2026 the dead.",
              ]
            }]
          },
          { t:"rule" },
          { t:"verse", label:"", lines:[
            "A fractured crystal softly cried,",
            "With broken thoughts it could not hide,",
            "And hidden deep through shelves of stone,",
            "A ring revealed what none had known.",
          ]}
        ]
      }
    },

    /* ── SPREAD 3: Final Chorus + end of Part I ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "xi",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"A greater evil waited still",
            verses:[{
              label:"", lines:[
                "The master Oruam once knew",
                "Had walked where darker secrets grew,",
                "And somewhere underneath the Guild,",
                "A greater evil waited still.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Act I · Chapter I",
        pgNum: "xii",
        blocks: [
          { t:"orn" },
          { t:"verse", label:"", chorus:true, lines:[
            "Ohhh\u2026 four souls before the blame,",
            "Slowly learning every name,",
            "Of buried lies and blood-stained lore,",
            "And things best left behind sealed doors.",
            "For somewhere far beyond their sight,",
            "A storm already claims the night\u2026",
            "From then the answers they would find",
            "Would reveal their destinies entwined.",
          ]},
          { t:"rule" },
          { t:"divider", text:"\u2767 \u2767 \u2767" }
        ]
      }
    },

    /* ── SPREAD 4: Part II title + illustration ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "xiii",
        blocks: [
          { t:"orn" },
          { t:"actLabel", text:"Chapter I \u00b7 Part II" },
          { t:"chTitle",  text:"The Betweenway" },
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"Black tar walls like breathing skin",
            verses:[{
              label:"", lines:[
                "The bookshelves cracked with crimson light,",
                "A riddle solved in an endless night,",
                "And through the rift there stretched a hall",
                "No living soul should cross at all.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Scene III — The Betweenway",
        pgNum: "xiv",
        blocks: [
          { t:"orn" },
          { t:"actLabel", text:"Scene III" },
          { t:"subTitle", text:"The Betweenway" },
          { t:"orn" },
          {
            t:"illus", size:"md", layout:"c",
            caption:"Empty cells through darkness spread",
            verses:[{
              label:"", lines:[
                "Black tar walls like breathing skin,",
                "Swallowed every whispered thing,",
                "And empty cells through darkness spread,",
                "Still mourning all the nameless dead.",
              ]
            }]
          }
        ]
      }
    },

    /* ── SPREAD 5: Betweenway continued ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "xv",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"b",
            caption:"One prisoner still shared the tomb",
            verses:[{
              label:"", lines:[
                "Blackened feathers stained the floor,",
                "With bones dissolved by something more,",
                "The very air itself would breathe",
                "Like starving jaws beneath the deep.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Scene III — The Betweenway",
        pgNum: "xvi",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"md", layout:"a",
            caption:"A broken rabbit, scarred and torn",
            verses:[{
              label:"", lines:[
                "And far beyond the endless gloom,",
                "One prisoner still shared the tomb,",
                "A broken rabbit, scarred and torn,",
                "Where hope itself had long been mourned.",
              ]
            }]
          }
        ]
      }
    },

    /* ── SPREAD 5b: Chorus III ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "xvii",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"Through hollow halls no sun has known",
            verses:[{
              label:"", lines:[
                "Five souls passed through that rotting deep,",
                "Where even light refused to keep,",
                "And tar-stained walls breathed cold and slow\u2014",
                "No living thing should ever go.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Act I · Chapter I",
        pgNum: "xviii",
        blocks: [
          { t:"orn" },
          { t:"verse", label:"", chorus:true, lines:[
            "Ohhh\u2026 now five souls walk the dark,",
            "With no guide but fading sparks,",
            "Through hollow halls no sun has known,",
            "Where grief and silence built their throne.",
            "And every step through tar and stone",
            "Brought echoes not entirely gone\u2026",
            "For places built from death and pain",
            "Do not release what they have claimed.",
          ]}
        ]
      }
    },

    /* ── SPREAD 6: The Road Back ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "xvii",
        blocks: [
          { t:"orn" },
          { t:"actLabel", text:"Scene IV" },
          { t:"subTitle", text:"The Road Back" },
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"The Yawning Portal roared with flame",
            verses:[{
              label:"", lines:[
                "Back through the roads to Waterdeep,",
                "Where weary men drank hard to sleep,",
                "The Yawning Portal roared with flame,",
                "And fate remembered every name.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Scene IV — The Road Back",
        pgNum: "xviii",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"md", layout:"d",
            caption:"The pirate from his prison tale",
            verses:[{
              label:"", lines:[
                "There Judy saw through smoke and ale",
                "The pirate from his prison tale,",
                "The one who sold his blood to chains",
                "To Meriadas\u2019 darkened gains.",
              ]
            }]
          },
          { t:"rule" },
          { t:"verse", label:"", lines:[
            "Rha\u2019ast spoke fast through fear and wine,",
            "Of cursed relics lost to time,",
            "Of hidden islands past the sea,",
            "And things no sailor dares to see.",
          ]}
        ]
      }
    },

    /* ── SPREAD 7: Tavern brawl ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "xix",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"One swing amidst the tavern\u2019s brawl",
            verses:[{
              label:"", lines:[
                "But rage burns hotter far than steel,",
                "And some old wounds refuse to heal,",
                "One swing amidst the tavern\u2019s brawl\u2026",
                "And Rha\u2019ast had no one else to call.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Act I · Chapter I",
        pgNum: "xx",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"md", layout:"a",
            caption:"Fate remembered every name",
            verses:[{
              label:"", lines:[
                "A coin was tossed, a deal was made,",
                "Five names were stamped on fortune’s blade,",
                "The city watched with holding breath—",
                "And something old had chosen them.",
              ]
            }]
          }
        ]
      }
    },

    /* ── SPREAD 7b: Chorus IV ── */
    {
      left: {
        runHead: "Act I · Chapter I",
        pgNum: "xxi",
        blocks: [
          { t:"orn" },
          {
            t:"illus", size:"lg", layout:"a",
            caption:"Cast away to feel their fate",
            verses:[{
              label:"", lines:[
                "And from the tavern\u2019s blood-soaked floor,",
                "Five souls were shown a greater door,",
                "Cast off from every place they\u2019d known\u2014",
                "The world had made their fate its own.",
              ]
            }]
          }
        ]
      },
      right: {
        runHead: "Act I · Chapter I",
        pgNum: "xxii",
        blocks: [
          { t:"orn" },
          { t:"verse", label:"", chorus:true, lines:[
            "Ohhh\u2026 five souls beyond the gate,",
            "Cast away to feel their fate,",
            "Nowhere to run, nowhere to flee",
            "Forced to heed fate\u2019s desperate plea\u2026",
            "The road ahead grows cold and grim,",
            "Will they resist their every whim?",
            "With them the thread of time runs quick\u2026",
            "The world now hangs by its last wick.",
          ]},
          { t:"rule" },
          { t:"spacer" },
          { t:"back" }
        ]
      }
    }
  ]
}; // end SPREADS_LEGACY

/* ─────────────────────────────────────────────────────
   CAMPAIGN DATA
───────────────────────────────────────────────────────── */
const DATA = {
  acts:[
    {
      id:1, numeral:"I",
      title:"An Investigation from the Past",
      description:"The past casts a long shadow. A message from beyond the grave sets our heroes on a path through forgotten rooms, forbidden archives, and the haunted roads between worlds.",
      hasTrailer:true, trailerSrc:"Teaser.mp4",
      chapters:[
        {
          id:1, title:"The Old Master\u2019s Room", unlocked:true,
          scenes:[
            {id:1, name:"The Ethereal Message", unlocked:true},
            {id:2, name:"The Study",             unlocked:true},
            {id:3, name:"The Betweenway",         unlocked:true},
            {id:4, name:"The Road Back",          unlocked:true},
          ]
        },
        {id:2, title:"The Last Dragon Apprentices", unlocked:false, scenes:[]},
        {id:3, title:"The Island of Souls",          unlocked:false, scenes:[]},
        {id:4, title:"The Prophecy",                 unlocked:false, scenes:[]},
      ]
    },
    {id:2, numeral:"II",  title:"Descent into Avernus",    description:"The descent begins.",  hasTrailer:false, chapters:[]},
    {id:3, numeral:"III", title:"The Price of Knowledge",  description:"All debts come due.",   hasTrailer:false, chapters:[]},
  ],
  tales: [
    { id:1, tag:"Vision I", title:"The Amber Eye",      subtitle:"A dream within the Betweenway", unlocked:false },
    { id:2, tag:"Vision II", title:"The Drowned Bell",  subtitle:"What Judy heard in the dark",    unlocked:false },
    { id:3, tag:"Vision III", title:"A Necessary Price",  subtitle:"Velvar's Visions",    unlocked:true },
  ],
  characters:[
    {init:"O",  name:"Oruam",     role:"Wizard",    desc:"Red-haired dwarf wizard and former apprentice of Meriadas Thorne. Keeper of secrets that cost more than he bargained for."},
    {init:"C",  name:"Chris",     role:"Warrior",   desc:"Human warrior hardened by battle and loyalty. His sword arm is matched only by his unyielding will."},
    {init:"J",  name:"Jack",      role:"Ranger",    desc:"Black-haired elven ranger haunted by past accusations. Moves silently through both forest and memory."},
    {init:"A",  name:"Annie",     role:"Sorceress", desc:"Young sorceress gifted with dangerous arcane potential. In her search to understand where her powers come from, and possibly end what she thinks is a curse, she found company in a new group. Now, she walks a path that may lead to answers... or to ruin."},
    {init:"JH", name:"Judy Hops", role:"Barbarian", desc:"Harengon barbarian rescued from the horrors of the Betweenway. What she saw there has never left her eyes."},
    ],

  fragments:[
    {
      id:1,
      title:"A Necessary Price",
      unlocked:true,
      text:[
        "You close your eyes, holding between your palms the ring found within the chamber of the former master of the arcane academy.",

        "Forged from some unknown metal, the ring has already been worn by use. Along its outer surface, engravings resembling skulls converge toward a central jewel: a violet obsidian.",

        "After several minutes within that rhythm, the ring pulses in your hand. The fractured obsidian emits a subtle pulse, almost organic, as though it were alive.",

        "Then, the fractures begin to mend, as though time itself were rewinding toward a moment before the damage.",

        "But now... the hand holding it is no longer yours.",

        "You are cast upward — not in body, but in soul.",

        "Below you, Meriadas Thorne walks slowly, the ring held within his left hand.",

        "Velvar Duskveil stands bound to a Saint Andrew’s Cross, upon the brink of becoming yet another victim of his master’s profane experiments.",

        "The sorrow upon Meriadas’ face is genuine.",

        "“I am sorry... Believe me when I say I never wished for this.”",

        "Beside the Cross, a cauldron filled with bubbling acid boils violently above arcane fire.",

        "Several horizontal strikes follow.",

        "Velvar screams for help.",

        "No living soul shall ever hear his desperate cries.",

        "The obsidian erupts in blinding radiance.",

        "Dozens — hundreds — of distinct voices echo from within the ring.",

        "Without warning, the blade is driven into Velvar’s heart.",

        "Blood pours across his chest, shifting from crimson into vivid violet.",

        "Then a thunderous crack echoes throughout the chamber.",

        "The surface of the obsidian begins to give way.",

        "Too late.",

        "The precious stone ruptures from within, and dozens of souls burst free into the open sky.",

        "Velvar turns toward you.",

        "“Now, it falls to you not to follow the same path.”",

        "“It falls to you to stop them.”",

        "You awaken from the meditative state with both a doubt... and a certainty.",

        "Velvar’s sacrifice shall not be in vain."
      ]
    }
  ]
};

/* ─────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────── */
let S = {
  tab:'chronicle',
  view:'acts',
  actId:null,
  chapterId:null,
  spreadIdx:0,
  fragmentId:null
};

/* ─────────────────────────────────────────────────────
   AUDIO
───────────────────────────────────────────────────────── */

const chapterMusic = {
  "1-1-part1": new Audio("chapter1_part1.mp3"),
  "1-1-part2": new Audio("chapter1_part2.mp3")
};
const menuMusic = new Audio("menu.mp3");
menuMusic.loop = true;
menuMusic.volume = 0.25;

document.addEventListener("click", () => {
  playMenuMusic();
}, { once:true });

Object.values(chapterMusic).forEach(a => {
  a.loop = true;
  a.volume = 0.45;
});

let currentMusic = null;

function playMusic(trackKey) {
  const next = chapterMusic[trackKey];
  if (!next || currentMusic === next) return;

  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  currentMusic = next;
  currentMusic.play().catch(() => {
    console.log("Autoplay bloqueado pelo navegador.");
  });
}

function stopMusic() {
  if (!currentMusic) return;

  currentMusic.pause();
  currentMusic.currentTime = 0;
  currentMusic = null;
}

function playMenuMusic() {

  if (!menuMusic.paused) return;

  menuMusic.play().catch(() => {
    console.log("Autoplay bloqueado pelo navegador.");
  });
}
/* ─────────────────────────────────────────────────────
   DOM
───────────────────────────────────────────────────────── */
const bookClosed  = document.getElementById('bookClosed');
const bookOpen_el = document.getElementById('bookOpen');
const openBookBtn = document.getElementById('openBookBtn');
const bookOpen    = document.getElementById('bookOpen');
const LC          = document.getElementById('pageLeftContent');
const RC          = document.getElementById('pageRightContent');
const bottomNav   = document.getElementById('bottomNav');
const btnBack     = document.getElementById('btnBackward');
const btnFwd      = document.getElementById('btnForward');
const bnavTabs    = document.querySelectorAll('.bnav-tab');
const flapCont    = document.getElementById('pageFlapContainer');
const pageFlap    = document.getElementById('pageFlap');
const videoModal  = document.getElementById('videoModal');
const modalVideo  = document.getElementById('modalVideo');
const skipBtn     = document.getElementById('skipVideoBtn');
const videoLabel  = document.getElementById('videoLabel');

/* ─────────────────────────────────────────────────────
   OPEN BOOK
───────────────────────────────────────────────────────── */
openBookBtn.addEventListener('click', () => {
  bookClosed.classList.add('opening');
  setTimeout(() => {
    bookClosed.classList.add('hidden');
    bookOpen.classList.remove('hidden');
    bottomNav.classList.remove('hidden');
    render();
  }, 1450);
});

/* ─────────────────────────────────────────────────────
   PAGE TURN
───────────────────────────────────────────────────────── */
let turning = false;
function turnPage(fwd, cb) {
  if (turning) return;
  turning = true;
  flapCont.classList.remove('hidden');
  requestAnimationFrame(() => {
    pageFlap.classList.add('turning');
    setTimeout(() => {
      cb(); render();
      pageFlap.classList.remove('turning');
      setTimeout(() => { flapCont.classList.add('hidden'); turning = false; }, 80);
    }, 360);
  });
}

/* ─────────────────────────────────────────────────────
   RENDER DISPATCHER
───────────────────────────────────────────────────────── */
function render() {

  const chapterMode =
    (S.view === 'chapter') ||
    (S.view === 'fragment');

  if (chapterMode) {
    menuMusic.pause();
  } else {
    playMenuMusic();
  }

  if (S.tab === 'codex')             { renderCodex();   }
  else if (S.tab === 'tales')        { renderTales();   }
  else if (S.tab === 'map')          { renderMap();     }
  else if (S.view === 'acts')        { renderActs();    }
  else if (S.view === 'act')         { renderAct();     }
  else if (S.view === 'chapter')     { renderChapter(); }
  else if (S.view === 'fragment')    { renderFragment(); }

  syncNav();
}

/* ─────────────────────────────────────────────────────
   BLOCK RENDERER
───────────────────────────────────────────────────────── */
function renderBlock(b, ctx) {
  switch(b.t) {
    case 'orn':
      return `<span class="orn"></span>`;
    case 'actLabel':
      return `<p class="pg-act-label">${b.text}</p>`;
    case 'chTitle':
      return `<h2 class="pg-chapter-head">${b.text}</h2>`;
    case 'subTitle':
      return `<p class="pg-subtitle">${b.text}</p>`;
    case 'rule':
      return `<hr class="thin-rule">`;
    case 'divider':
      return `<div class="poem-divider"><span>${b.text||'\u2767'}</span></div>`;
    case 'spacer':
      return `<div class="pg-spacer"></div>`;
    case 'back':
      return `<button class="pg-back" id="pgBackBtn">\u2190 Back to Act</button>`;
    case 'text':
      return `<p class="pg-text${b.dropCap?' drop-cap':''}">${b.text}</p>`;
    case 'verse':
      return renderVerse({label:b.label, lines:b.lines, chorus:b.chorus});
    case 'sceneList':
      if (!ctx?.chapter) return '';
      return ctx.chapter.scenes.map(sc => `
        <div class="scene-line${sc.unlocked?'':' locked'}">
          <span class="sc-rom">${romanize(sc.id)}</span>
          <span class="sc-name">${sc.name}</span>
        </div>`).join('');
    case 'illus':
      return renderIllusBlock(b);
    default: return '';
  }
}

function renderVerse(v) {
  return `<div class="verse-block${v.chorus?' chorus':''}">
    <p class="verse-label">${v.label}</p>
    <div class="verse-lines">${v.lines.map(l=>`<p>${l}</p>`).join('')}</div>
  </div>`;
}

/* ─────────────────────────────────────────────────────
   ILLUSTRATION BLOCK RENDERER
   4 layout modes: a (top), b (bottom), c (float-left), d (float-right)
───────────────────────────────────────────────────────── */
function renderIllusBlock(b) {
  const sizeClass = `illus-${b.size||'md'}`;
  const illusHtml = `<div class="illus ${sizeClass}"><div class="illus-inner">${b.caption||'\u2736 Illustration \u2736'}</div></div>`;
  const versesHtml = (b.verses||[]).map(v => renderVerse(v)).join('');
  const layout = b.layout || 'a';

  if (layout === 'a') {
    // illus top, verse below
    return `${illusHtml}${versesHtml}`;
  }
  if (layout === 'b') {
    // verse top, illus flush to bottom
    return `${versesHtml}<div class="pg-spacer"></div>${illusHtml}`;
  }
  if (layout === 'c') {
    // illus float-left, verse wraps right
    return `<div class="layout-c">${illusHtml}${versesHtml}</div>`;
  }
  if (layout === 'd') {
    // illus float-right, verse wraps left
    return `<div class="layout-d">${illusHtml}${versesHtml}</div>`;
  }
  return `${illusHtml}${versesHtml}`;
}

/* ─────────────────────────────────────────────────────
   PAGE BUILDER
───────────────────────────────────────────────────────── */
function buildPage(pageDef, side, ctx) {
  const runHtml  = pageDef.runHead ? `<p class="run-head">${pageDef.runHead}</p>` : '';
  const bodyHtml = pageDef.blocks.map(b => renderBlock(b, ctx)).join('');
  const align    = side === 'left' ? 'text-align:left' : 'text-align:right';
  return `${runHtml}${bodyHtml}<p class="pg-num" style="${align}">${pageDef.pgNum||''}</p>`;
}

/* ─────────────────────────────────────────────────────
   ACTS VIEW
───────────────────────────────────────────────────────── */
function renderActs() {
  resetPageStyles();
  
  LC.innerHTML = `
    <p class="run-head">The Chronicle</p>
    <span class="orn"></span>
    <h2 class="pg-chapter-head">The Chronicle</h2>
    <p class="pg-subtitle">A tale of forgotten realms</p>
    <span class="orn"></span>
    <p class="pg-text drop-cap">In ages past, when the boundaries between worlds grew thin and the old masters still walked among mortals, a price was paid for every truth uncovered. </p>
    <div class="pg-spacer"></div>
    <p class="pg-num" style="text-align:left">i</p>
  `;
  RC.innerHTML = `
    <p class="run-head">Acts</p>
    <span class="orn"></span>
    <p class="pg-subtitle" style="margin-bottom:.8rem">Select an Act</p>
    ${DATA.acts.map(a=>`
      <div class="entry-row ${a.chapters.length===0?'locked':''}" data-act="${a.id}">
        <div class="er-numeral">${a.numeral}</div>
        <div class="er-info">
          <h3 class="${a.chapters.length===0?'runes':''}">${a.chapters.length===0 ? runicize(a.title) : a.title}</h3>
          <p>${a.chapters.length ? a.chapters.length+' chapters' : '\u26BF \u043D\u0435 \u0440\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u0430\u043D\u043E'}</p>
        </div>
        <div class="er-arrow">\u2192</div>
      </div>`).join('')}
    <div class="pg-spacer"></div>
    <p class="pg-num" style="text-align:right">ii</p>
  `;
  RC.querySelectorAll('.entry-row:not(.locked)').forEach(r => {
    r.addEventListener('click', () => {
      const act = DATA.acts.find(a=>a.id===parseInt(r.dataset.act));
      if (!act) return;
      S.actId = act.id;
      if (act.hasTrailer) {
        showVideo(act.trailerSrc, `Act ${act.numeral} \u2014 Teaser`, () => {
          turnPage(true, () => { S.view='act'; });
        });
      } else {
        turnPage(true, () => { S.view='act'; });
      }
    });
  });
}

/* ─────────────────────────────────────────────────────
   ACT VIEW
───────────────────────────────────────────────────────── */
function renderAct() {
  resetPageStyles();
  stopMusic();
  const act = DATA.acts.find(a=>a.id===S.actId);
  if (!act) return;

  LC.innerHTML = `
    <p class="run-head">The Chronicle \u00b7 Act ${act.numeral}</p>
    <span class="orn"></span>
    <p class="pg-act-label">Act ${act.numeral}</p>
    <h2 class="pg-chapter-head">${act.title}</h2>
    <span class="orn"></span>
    <p class="pg-text drop-cap">${act.description}</p>
    ${act.hasTrailer?`<button class="pg-btn" id="replayBtn">\u25B6 Watch Teaser</button>`:''}
    <div class="pg-spacer"></div>
    <button class="pg-back" id="backToActs">\u2190 All Acts</button>
    <p class="pg-num" style="text-align:left">iii</p>
  `;
  RC.innerHTML = `
    <p class="run-head">Chapters</p>
    <span class="orn"></span>
    <p class="pg-subtitle" style="margin-bottom:.8rem">Chapters</p>
    ${act.chapters.map(ch=>`
      <div class="ch-row ${ch.unlocked?'':'locked'}" data-ch="${ch.id}">
        <div class="ch-row-num">Chapter ${romanize(ch.id)}</div>
        <div>
          <h4 class="${ch.unlocked?'':'runes'}">${ch.unlocked ? ch.title : runicize(ch.title)}</h4>
          <p>${ch.unlocked&&ch.scenes.length ? ch.scenes.length+' scenes' : !ch.unlocked ? '\u26BF \u043D\u0435 \u0440\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u0430\u043D\u043E' : ''}</p>
        </div>
        ${!ch.unlocked?'<span class="ch-row-lock">\u26BF</span>':'<span style="margin-left:auto;color:var(--gold);font-size:.8rem">\u2192</span>'}
      </div>`).join('')}
    <div class="pg-spacer"></div>
    <p class="pg-num" style="text-align:right">iv</p>
  `;
  document.getElementById('backToActs')?.addEventListener('click', () => {
    turnPage(false, () => { S.view='acts'; });
  });
  document.getElementById('replayBtn')?.addEventListener('click', () => {
    showVideo(act.trailerSrc, `Act ${act.numeral} \u2014 Teaser`, ()=>{});
  });
  RC.querySelectorAll('.ch-row:not(.locked)').forEach(c => {
    c.addEventListener('click', () => {
      S.chapterId = parseInt(c.dataset.ch);
      S.spreadIdx = 0;
      turnPage(true, () => { S.view='chapter'; });
    });
  });
}


/* ─────────────────────────────────────────────────────
   CHAPTER VIEW  (spread-based, no scroll)
───────────────────────────────────────────────────────── */
function resetPageStyles() {
  // Remove spread image overlay if present
  const overlay = bookOpen_el.querySelector('.spread-overlay');
  if (overlay) overlay.remove();
  // Clear any inline styles that may have been set
  for (const el of [LC, RC]) {
    el.style.cssText = '';
  }
}

function renderChapter() {
  resetPageStyles();
  const act     = DATA.acts.find(a=>a.id===S.actId);
  const chapter = act?.chapters.find(c=>c.id===S.chapterId);
  if (!act || !chapter) return;

  const key     = `${S.actId}-${S.chapterId}`;
  const spreads = SPREADS[key];

  if (!spreads) {
    LC.innerHTML = `<p class="run-head">Act ${act.numeral} \u00b7 Chapter ${romanize(chapter.id)}</p><span class="orn"></span><h2 class="pg-chapter-head">${chapter.title}</h2><span class="orn"></span><div class="illus illus-lg"><div class="illus-inner">\u2736</div></div><div class="pg-spacer"></div><button class="pg-back" id="pgBackBtn">\u2190 Back</button><p class="pg-num" style="text-align:left">\u2014</p>`;
    RC.innerHTML = `<p class="run-head">Scenes</p><span class="orn"></span>${chapter.scenes.map(sc=>`<div class="scene-line${sc.unlocked?'':' locked'}"><span class="sc-rom">${romanize(sc.id)}</span><span class="sc-name">${sc.name}</span></div>`).join('')}<div class="pg-spacer"></div><p class="pg-num" style="text-align:right">\u2014</p>`;
    document.getElementById('pgBackBtn')?.addEventListener('click', () => { turnPage(false, () => { S.view='act'; }); });
    return;
  }

  const sp = spreads[S.spreadIdx];

  // ── spreadImg mode: render as 2×2 sprite sheet crop ──
  if (sp.spreadImg !== undefined) {
    renderSpreadImg(sp, act, chapter);
    return;
  }

  // ── legacy block-based mode (kept for fallback) ──
  const ctx = { act, chapter };
  LC.innerHTML = buildPage(sp.left,  'left',  ctx);
  RC.innerHTML = buildPage(sp.right, 'right', ctx);

  musicTrigger();

  document.getElementById('pgBackBtn')?.addEventListener('click', () => {
    turnPage(false, () => {
      if (S.spreadIdx > 0) { S.spreadIdx--; }
      else { S.view = 'act'; }
    });
  });
}

/* ─────────────────────────────────────────────────────
   SPREAD IMAGE RENDERER
   Crops the correct quadrant from a 2×2 PNG grid.
   quadrant: 0=TL 1=TR 2=BL 3=BR
───────────────────────────────────────────────────────── */
function renderSpreadImg(sp, act, chapter) {
  const q   = sp.quadrant;        // 0=TL 1=TR 2=BL 3=BR
  const col = q % 2;              // 0=left, 1=right
  const row = Math.floor(q / 2); // 0=top,  1=bottom

  // Strategy: inject a single full-bleed overlay div directly into .book-open
  // (position:relative) that sits on top of everything — pages, binding, all.
  // The overlay uses background-size:200% 200% to crop the correct quadrant.
  const bpX = col === 0 ? '0%' : '100%';
  const bpY = row === 0 ? '0%' : '100%';

  // Clear any leftover overlay
  const old = bookOpen_el.querySelector('.spread-overlay');
  if (old) old.remove();

  LC.innerHTML = '';
  RC.innerHTML = '';

  const overlay = document.createElement('div');
  overlay.className = 'spread-overlay';
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 20;
    background-image: url('${sp.spreadImg}');
    background-size: 200% 200%;
    background-repeat: no-repeat;
    background-position: ${bpX} ${bpY};
    border-radius: 5px;
  `;

  if (sp.back) {
    const btn = document.createElement('button');
    btn.className = 'pg-back';
    btn.id = 'pgBackBtn';
    btn.style.cssText = 'position:absolute;bottom:1.5rem;left:50%;transform:translateX(-50%);z-index:30';
    btn.textContent = '\u2190 Back to Act';
    overlay.appendChild(btn);
    btn.addEventListener('click', () => {
      turnPage(false, () => { S.view = 'act'; });
    });
  }

  bookOpen_el.appendChild(overlay);
  musicTrigger();
}

/* ─────────────────────────────────────────────────────
   MUSIC TRIGGER (shared between render modes)
───────────────────────────────────────────────────────── */
function musicTrigger() {
  if (S.actId === 1 && S.chapterId === 1) {
    // índices 0–11 = Part I (Cenas 1 e 2 + choruses)
    // índices 12+  = Part II (Cenas 3 e 4 + choruses)
    if (S.spreadIdx <=9) {
      playMusic("1-1-part1");
    } else {
      playMusic("1-1-part2");
    }
  }
}

/* ─────────────────────────────────────────────────────
   LOST TALES VIEW
───────────────────────────────────────────────────────── */
function renderTales() {
  resetPageStyles();
  stopMusic();

  const tales = DATA.tales || [];

  LC.innerHTML = `
    <p class="run-head">Lost Tales</p>
    <span class="orn"></span>
    <h2 class="pg-chapter-head">Lost Tales</h2>
    <p class="pg-subtitle">Visions from beyond the veil</p>
    <span class="orn"></span>
    <p class="pg-text drop-cap">Not all that was witnessed could be explained. Between the waking world and whatever lies beyond, fragments of other lives — other truths — found their way into the minds of those who dared look.</p>
    <div class="pg-spacer"></div>
    <p class="pg-num" style="text-align:left">—</p>
  `;

  RC.innerHTML = `
    <p class="run-head">Lost Fragments</p>
    <span class="orn"></span>
    ${tales.length === 0
      ? `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:.8rem;opacity:.45;">
           <span style="font-family:'Cinzel Decorative',serif;font-size:1.6rem;color:var(--gold-dim)">✦</span>
           <p style="font-family:'Cinzel',serif;font-size:.62rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dim);text-align:center">No visions recorded yet</p>
         </div>`
      : tales.map(t => `
      <div class="ch-row ${t.unlocked?'':'locked'}" data-tale="${t.id}">
        <div class="ch-row-num">${t.tag||'Vision'}</div>
        <div>
          <h4 class="${t.unlocked?'':'runes'}">${t.unlocked ? t.title : runicize(t.title)}</h4>
          <p>${t.unlocked ? t.subtitle||'' : '\u26BF \u043D\u0435 \u0440\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u0430\u043D\u043E'}</p>
        </div>
        ${t.unlocked?'<span style="margin-left:auto;color:var(--gold);font-size:.8rem">\u2192</span>':'<span class="ch-row-lock">\u26BF</span>'}
      </div>`).join('')}
    <div class="pg-spacer"></div>
    <p class="pg-num" style="text-align:right">—</p>
  `;
}

/* ─────────────────────────────────────────────────────
   CODEX
───────────────────────────────────────────────────────── */
function renderCodex() {
  resetPageStyles();

  const characters = [
    { id:"annie",    name:"Annie",              role:"Sorceress", type:"main", desc:"Young sorceress gifted with dangerous arcane potential. In her search to understand the origin of her powers—and perhaps cure what she believes to be a curse—she found companionship in an unlikely group of adventurers. Now, she walks a path that may lead to answers... or to ruin." },
    { id:"chris",    name:"Chris",              role:"Fighter",   type:"main", desc:"Human warrior hardened by battle and loyalty to the company of Lost Banners. After falling in the Battle of a Thousand Swords, he roamed the world fighting to survive until he heard of a quest that might redeem him. There, he found the chance to reclaim his honor in a new group to fight for. "},
    { id:"jack",     name:"Jack",               role:"Ranger",    type:"main", desc:"Black-haired elven ranger and a long time guide for rich adventures. His fate got intertwined with the threads of destiny. Now, marked by what lies beyond the veil, he may be the one to guide them through the shadows." },
    { id:"judy",     name:"Judy Hops",          role:"Barbarian", type:"main", desc:"Harengon barbarian rescued from the horrors of the Betweenway. The horrors he witnessed there still haunt him. Now, he seeks vengeance against the mage who wronged him." },
    { id:"oruam",    name:"Oruam",              role:"Mage",      type:"main", desc:"Red-haired dwarf wizard and former apprentice of Meriadas Thorne. Keeper of the White Scales and magical artifacts, his fate was sealed by a warning from an old colleague." },

    { id:"elbren",   name:"Elbren Naerith",     role:"Mage",      type:"support", desc:"A mysterious mage whose warning set the heroes upon their fateful path. Much remains unknown about his motives, but his knowledge of the forces at work appears far greater than he lets on." },
    { id:"velvar",   name:"Velvar Duskveil",    role:"",          type:"support", desc:"A tragic figure whose sacrifice still echoes through the ages, binding together the threads of destiny." },
    { id:"meriadas", name:"Meriadas Thorne",    role:"",          type:"support", desc:"The old master whose actions set in motion a plan that would alter the fate of countless lives." },
    { id:"rhaast",   name:"Rha'ast",            role:"",          type:"support", desc:"A pirate hired by mysterious mages to capture Judy and recover lost magical artifacts. Before dying at the barbarian's hands, he mumbled cryptic words about a lost island and treasures that no mercenary would dare seek." }
  ];

  LC.innerHTML = `
    <p class="run-head">Character Codex</p>
    <span class="orn"></span>

    <h2 class="pg-chapter-head">Character Codex</h2>
    <p class="pg-subtitle">The souls bound to this tale</p>

    <span class="orn"></span>

    <h3 style="
      color:#8a6010;
      margin-top:1rem;
      margin-bottom:.5rem;
      font-family:'Cinzel',serif;
    ">
      Main Characters
    </h3>

    ${characters
      .filter(c => c.type === "main")
      .map(c => `
        <div class="ch-row codex-link" data-char="${c.id}">
          <h4>${c.name}</h4>
        </div>
      `).join("")}

    <h3 style="
      color:#5a3a18;
      margin-top:1rem;
      margin-bottom:.5rem;
      font-family:'Cinzel',serif;
    ">
      Supporting Characters
    </h3>

    ${characters
      .filter(c => c.type === "support")
      .map(c => `
        <div class="ch-row codex-link" data-char="${c.id}">
          <h4>${c.name}</h4>
        </div>
      `).join("")}

    <div class="pg-spacer"></div>
    <p class="pg-num" style="text-align:left">vii</p>
  `;

  function showCharacter(id) {

    const c = characters.find(x => x.id === id);

    RC.innerHTML = `
      <p class="run-head">
        ${c.type === "main" ? "Main Character" : "Supporting Character"}
      </p>

      <span class="orn"></span>

      <h2 class="pg-chapter-head">
        ${c.name}
      </h2>

      <p class="pg-subtitle">
        ${c.role}
      </p>

      <span class="orn"></span>

      <div class="pg-text">
  <p>${c.desc}</p>

  ${c.id === "velvar" ? `
    <span class="orn"></span>

    <h3 style="margin-top:1.5rem;">Recovered Memories</h3>

    <div class="vision-entry"
         onclick="openVision('Velvar 1.mp4')">
      ▶ Vision I
    </div>

    <div class="vision-entry"
         onclick="openVision('Velvar 2.mp4')">
      ▶ Vision II
    </div>

    <div class="vision-entry locked">
      ᛗᛖᛗᛟᚱᚤ ᚢᚾᚱᛖᚲᛟᚹᛖᚱᛖᛞ
    </div>
  ` : ''}
</div>

      <div class="pg-spacer"></div>
      <p class="pg-num" style="text-align:right">viii</p>
    `;
  }

  showCharacter("annie");

  document.querySelectorAll(".codex-link").forEach(link => {
    link.addEventListener("click", () => {
      showCharacter(link.dataset.char);
    });
  });
}
function openVision(file) {

  menuMusic.pause();

  const overlay = document.getElementById("visionOverlay");
  const player  = document.getElementById("visionPlayer");

  player.src = file;
  overlay.classList.add("active");

  player.play();
}

function closeVision() {

  const overlay = document.getElementById("visionOverlay");
  const player  = document.getElementById("visionPlayer");

  player.pause();
  player.src = "";

  overlay.classList.remove("active");

  playMenuMusic();
}
/* ─────────────────────────────────────────────────────
   NAV SYNC
───────────────────────────────────────────────────────── */
function syncNav() {
  // back
  const atRoot = (S.tab==='chronicle' && S.view==='acts') || S.tab==='codex' || S.tab==='tales' || S.tab==='map';
  btnBack.disabled = atRoot;

  // forward — only inside chapter spreads
  const key = `${S.actId}-${S.chapterId}`;
  const spreads = S.view==='chapter' ? (SPREADS[key]||[]) : [];
  btnFwd.disabled = S.spreadIdx >= spreads.length - 1;

  bnavTabs.forEach(t => t.classList.toggle('active', t.dataset.tab===S.tab));
}

/* ─────────────────────────────────────────────────────
   BUTTON HANDLERS
───────────────────────────────────────────────────────── */
btnBack.addEventListener('click', () => {
  if (btnBack.disabled) return;
  turnPage(false, () => {
    if (S.view==='chapter') {
      if (S.spreadIdx > 0) { S.spreadIdx--; }
      else { S.view = 'act'; }
    } else if (S.view==='act') { S.view = 'acts'; }
  });
});

btnFwd.addEventListener('click', () => {
  if (btnFwd.disabled) return;
  const key = `${S.actId}-${S.chapterId}`;
  const spreads = SPREADS[key] || [];
  if (S.spreadIdx < spreads.length - 1) {
    turnPage(true, () => { S.spreadIdx++; });
  }
});

bnavTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.dataset.tab===S.tab) return;
    turnPage(true, () => {
      S.tab = tab.dataset.tab;
      if (S.tab==='chronicle') { S.view='acts'; hideMapOverlay(); }
      if (S.tab==='tales')     { S.view='tales'; hideMapOverlay(); }
      if (S.tab==='codex')     { hideMapOverlay(); }
      if (S.tab==='map')       S.view='map';
    });
  });
});

/* ─────────────────────────────────────────────────────
   VIDEO MODAL
───────────────────────────────────────────────────────── */
function showVideo(src, label, onDone) {
  videoLabel.textContent = label;
  modalVideo.src = src;
  videoModal.classList.remove('hidden');
  modalVideo.load();
  modalVideo.play().catch(()=>{});
  const close = () => {
    modalVideo.pause(); modalVideo.src='';
    videoModal.classList.add('hidden');
    onDone();
  };
  modalVideo.onended = close;
  skipBtn.onclick    = close;
}

/* ═══════════════════════════════════════════════════════
   MAP — FULLSCREEN OVERLAY
   The map renders in a fixed overlay covering the whole
   screen (above the book, below the nav bar).

   Architecture:
   • #mapOverlay  — fixed, full-viewport clipping container
   • #mapScene    — sized to image natural px, transformed for zoom/pan
   • #mapImg      — natural-size image (no object-fit)
   • #fogCanvas   — same size as image, fog drawn in image coords
   • #mapPins     — pins in image coords, counter-scaled vs zoom

   Fog technique:
   1. Offscreen canvas: fill black, punch destination-out holes
   2. Visible canvas:   fill dark colour, clip with destination-in
   This gives crispy opaque fog with soft revealed edges.

   Pin counter-scale:
   Each pin has CSS var --iz = 1/zoom so it stays the same
   screen size regardless of zoom level.
═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   MAP DATA
   x, y  = 0–100 percent of the natural image size.
───────────────────────────────────────────────────────── */
const MAP_LOCATIONS = [
  {
    id:1,
    label:"Chapter 1: An Investigation of the Past",
    x:45.5,
    y:37,
    spreadUnlock:0
  },
];
const MAP_PROGRESS = 0;

/* ─────────────────────────────────────────────────────
   MAP STATE
───────────────────────────────────────────────────────── */
const _map = {
  zoom:1, panX:0, panY:0,
  MIN:1, MAX:4, STEP:0.4,
  imgW:0, imgH:0,
  vpW:0, vpH:0,
  dragging:false, startX:0, startY:0, panStartX:0, panStartY:0,
  lastDist:null, tStart:null, attached:false,
};

/* ─────────────────────────────────────────────────────
   SHOW / HIDE
───────────────────────────────────────────────────────── */
function showMapOverlay() {
  const overlay = document.getElementById('mapOverlay');
  if (!overlay) return;
  overlay.classList.add('map-active');
  const img = document.getElementById('mapImg');
  const ready = () => {
    _map.imgW = img.naturalWidth;
    _map.imgH = img.naturalHeight;
    mapFitToViewport();
    buildMapLegend();
    drawFogOfWar();
    placePins();
    if (!_map.attached) { attachMapInteraction(); _map.attached = true; }
  };
  if (img.complete && img.naturalWidth > 0) { ready(); }
  else { img.onload = ready; }
}

function hideMapOverlay() {
  document.getElementById('mapOverlay')?.classList.remove('map-active');
}

/* ─────────────────────────────────────────────────────
   RENDER MAP (tab dispatcher calls this)
───────────────────────────────────────────────────────── */
function renderMap() {
  resetPageStyles();
  stopMusic();
  LC.innerHTML = '';
  RC.innerHTML = '';
  showMapOverlay();
}

/* ─────────────────────────────────────────────────────
   FIT SCENE TO VIEWPORT
───────────────────────────────────────────────────────── */
function mapFitToViewport() {
  const overlay = document.getElementById('mapOverlay');
  const scene   = document.getElementById('mapScene');
  if (!overlay || !scene || !_map.imgW) return;
  _map.vpW = overlay.offsetWidth;
  _map.vpH = overlay.offsetHeight;
const fit = Math.min(_map.vpW / _map.imgW, _map.vpH / _map.imgH);

_map.MIN = fit;
_map.zoom = fit * 2.6;   // aproxima o mapa

// Coordenadas aproximadas de Waterdeep no mapa
// (em % do tamanho da imagem, não pixels fixos — assim continua
// correto mesmo se a imagem do mapa for redimensionada/trocada)
const waterdeepX = (1040 / 10200) * _map.imgW;
const waterdeepY = (720  / 6600)  * _map.imgH;

// centraliza Waterdeep na tela
_map.panX = (_map.vpW / 2) - (waterdeepX * _map.zoom);
_map.panY = (_map.vpH / 2) - (waterdeepY * _map.zoom);
  scene.style.width  = `${_map.imgW}px`;
  scene.style.height = `${_map.imgH}px`;
  mapApplyTransform();
}

/* ─────────────────────────────────────────────────────
   APPLY TRANSFORM + COUNTER-SCALE PINS
───────────────────────────────────────────────────────── */
function mapApplyTransform() {
  const scene  = document.getElementById('mapScene');
  const btnIn  = document.getElementById('mapZoomIn');
  const btnOut = document.getElementById('mapZoomOut');
  const overlay = document.getElementById('mapOverlay');
  if (!scene) return;

  const scaledW = _map.imgW * _map.zoom;
  const scaledH = _map.imgH * _map.zoom;
  const maxPanX = Math.max(0, (_map.vpW - scaledW) / 2);
  const maxPanY = Math.max(0, (_map.vpH - scaledH) / 2);
  const minPanX = Math.min(_map.vpW - scaledW, maxPanX);
  const minPanY = Math.min(_map.vpH - scaledH, maxPanY);
  _map.panX = Math.max(minPanX, Math.min(maxPanX, _map.panX));
  _map.panY = Math.max(minPanY, Math.min(maxPanY, _map.panY));

  scene.style.transform = `translate(${_map.panX}px,${_map.panY}px) scale(${_map.zoom})`;
  scene.style.transformOrigin = '0 0';

  const iz = 1 / _map.zoom;
  document.querySelectorAll('.map-pin').forEach(p => p.style.setProperty('--iz', iz));

  if (btnIn)  btnIn.disabled  = _map.zoom >= _map.MAX;
  if (btnOut) btnOut.disabled = _map.zoom <= _map.MIN;
  if (overlay) overlay.style.cursor = _map.zoom > _map.MIN ? 'grab' : 'default';
}

/* ─────────────────────────────────────────────────────
   ZOOM TOWARD A POINT (viewport coords)
───────────────────────────────────────────────────────── */
function mapZoomAt(newZoom, vpX, vpY) {
  newZoom = Math.max(_map.MIN, Math.min(_map.MAX, newZoom));
  const imgX = (vpX - _map.panX) / _map.zoom;
  const imgY = (vpY - _map.panY) / _map.zoom;
  _map.zoom = newZoom;
  _map.panX = vpX - imgX * newZoom;
  _map.panY = vpY - imgY * newZoom;
  mapApplyTransform();
}

/* ─────────────────────────────────────────────────────
   FOG OF WAR (image-pixel coordinates)
───────────────────────────────────────────────────────── */
function drawFogOfWar() {
  const canvas = document.getElementById('fogCanvas');
  if (!canvas || !_map.imgW) return;

  // Mobile browsers (Safari/Chrome) silently fail to allocate canvases
  // above ~16-17 megapixels (or a single dimension above ~4096px on
  // many GPUs). Our map image is 10200x6600 (~67MP), which works fine
  // as a plain <img> but breaks as a <canvas> on phones. So we draw the
  // fog at a capped resolution and let CSS (width/height:100%) stretch
  // it back over the full image — invisible quality loss since the fog
  // is just a soft gradient with no fine detail.
  const MAX_DIM = 4000;
  let W = _map.imgW, H = _map.imgH;
  if (W > MAX_DIM || H > MAX_DIM) {
    const s = Math.min(MAX_DIM / W, MAX_DIM / H);
    W = Math.round(W * s);
    H = Math.round(H * s);
  }
  canvas.width  = W;
  canvas.height = H;

  const visited = MAP_LOCATIONS.filter(l => l.spreadUnlock <= MAP_PROGRESS);

  // 1. Offscreen: black fill + destination-out holes
  const off = Object.assign(document.createElement('canvas'), {width:W, height:H});
  const ox  = off.getContext('2d');
  ox.fillStyle = '#000';
  ox.fillRect(0, 0, W, H);

  visited.forEach(loc => {
    const cx = (loc.x / 100) * W;
    const cy = (loc.y / 100) * H;
    const r  = Math.min(W, H) * 0.10;
    const g  = ox.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0,    'rgba(0,0,0,1)');
    g.addColorStop(0.30, 'rgba(0,0,0,0.97)');
    g.addColorStop(0.58, 'rgba(0,0,0,0.72)');
    g.addColorStop(0.80, 'rgba(0,0,0,0.22)');
    g.addColorStop(1,    'rgba(0,0,0,0)');
    ox.globalCompositeOperation = 'destination-out';
    ox.fillStyle = g;
    ox.beginPath();
    ox.arc(cx, cy, r, 0, Math.PI * 2);
    ox.fill();
  });

  // 2. Visible canvas: dark fill, clip with mask
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgb(8,5,1)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(off, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

/* ─────────────────────────────────────────────────────
   PLACE PINS
───────────────────────────────────────────────────────── */
function placePins() {
  const pinsEl = document.getElementById('mapPins');
  if (!pinsEl || !_map.imgW) return;
  pinsEl.innerHTML = MAP_LOCATIONS.map(l => {
    const px  = (l.x / 100) * _map.imgW;
    const py  = (l.y / 100) * _map.imgH;
    const vis = l.spreadUnlock <= MAP_PROGRESS;
    return `<div class="map-pin ${vis?'pin-visited':'pin-locked'}"
                 style="left:${px}px;top:${py}px" data-id="${l.id}">
              <div class="pin-circle">${l.id}</div>
              <div class="pin-tooltip">${vis ? l.label : '???'}</div>
            </div>`;
  }).join('');
  mapApplyTransform();
}

/* ─────────────────────────────────────────────────────
   LEGEND
───────────────────────────────────────────────────────── */
function buildMapLegend() {
  const leg = document.getElementById('mapLegend');
  if (!leg) return;
  const visited = MAP_LOCATIONS.filter(l => l.spreadUnlock <= MAP_PROGRESS);
  const locked  = MAP_LOCATIONS.filter(l => l.spreadUnlock >  MAP_PROGRESS);
  leg.innerHTML = `
    <p class="map-legend-title">Locations</p>
    ${visited.map(l=>`<div class="map-legend-row"><span class="map-legend-dot"></span><span>${l.id}. ${l.label}</span></div>`).join('')}
    ${locked.map(l=>`<div class="map-legend-row locked-loc"><span class="map-legend-dot locked-dot"></span><span class="runes">${runicize(l.label)}</span></div>`).join('')}
  `;
}

/* ─────────────────────────────────────────────────────
   INTERACTION (attached once)
───────────────────────────────────────────────────────── */
function attachMapInteraction() {
  const overlay = document.getElementById('mapOverlay');
  const btnIn   = document.getElementById('mapZoomIn');
  const btnOut  = document.getElementById('mapZoomOut');

  btnIn?.addEventListener('click', () => mapZoomAt(_map.zoom + _map.STEP, _map.vpW/2, _map.vpH/2));
  btnOut?.addEventListener('click', () => mapZoomAt(_map.zoom - _map.STEP, _map.vpW/2, _map.vpH/2));

  overlay.addEventListener('wheel', e => {
    e.preventDefault();
    const r = overlay.getBoundingClientRect();
    mapZoomAt(_map.zoom + (e.deltaY < 0 ? _map.STEP : -_map.STEP), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  overlay.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    _map.dragging = true;
    _map.startX = e.clientX; _map.startY = e.clientY;
    _map.panStartX = _map.panX; _map.panStartY = _map.panY;
    overlay.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!_map.dragging) return;
    _map.panX = _map.panStartX + (e.clientX - _map.startX);
    _map.panY = _map.panStartY + (e.clientY - _map.startY);
    mapApplyTransform();
  });
  window.addEventListener('mouseup', () => {
    if (!_map.dragging) return;
    _map.dragging = false;
    overlay.style.cursor = _map.zoom > _map.MIN ? 'grab' : 'default';
  });

  overlay.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      _map.tStart = { x:e.touches[0].clientX, y:e.touches[0].clientY, panX:_map.panX, panY:_map.panY };
    } else { _map.tStart = null; }
  }, { passive:true });
  overlay.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d  = Math.hypot(dx, dy);
      if (_map.lastDist !== null) {
        const r  = overlay.getBoundingClientRect();
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        mapZoomAt(_map.zoom * (d / _map.lastDist), mx, my);
      }
      _map.lastDist = d; _map.tStart = null;
    } else if (e.touches.length === 1 && _map.tStart) {
      _map.panX = _map.tStart.panX + (e.touches[0].clientX - _map.tStart.x);
      _map.panY = _map.tStart.panY + (e.touches[0].clientY - _map.tStart.y);
      mapApplyTransform();
    }
  }, { passive:false });
  overlay.addEventListener('touchend', () => { _map.lastDist = null; _map.tStart = null; });
}

/* ─────────────────────────────────────────────────────
   RUNICIZE
───────────────────────────────────────────────────────── */
function runicize(text) {
  // Cyrillic look-alike pool — visually strange but readable as "alien script"
  const pool = [
    '\u0416','\u0424','\u042A','\u0429','\u0428','\u0426','\u0425',
    '\u0427','\u042E','\u042F','\u0436','\u0444','\u044A','\u0449',
    '\u0448','\u0446','\u0445','\u0447','\u044E','\u044F','\u0434',
    '\u0414','\u0411','\u0431','\u042B','\u044B','\u0402','\u040F',
    '\u0462','\u046A','\u0472','\u0474','\u0466','\u047A','\u047C',
  ];
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === ' ') { out += ' '; }
    else if (c.match(/[A-Za-z]/)) {
      // deterministic but looks random: use charCode + position as seed
      const idx = (c.charCodeAt(0) * 7 + i * 13) % pool.length;
      out += pool[idx];
    } else {
      out += c;
    }
  }
  return out;
}

/* ─────────────────────────────────────────────────────
   ROMANIZE
───────────────────────────────────────────────────────── */
function romanize(n) {
  const v=[1000,'M',900,'CM',500,'D',400,'CD',100,'C',90,'XC',
           50,'L',40,'XL',10,'X',9,'IX',5,'V',4,'IV',1,'I'];
  let r=''; for(let i=0;i<v.length;i+=2) while(n>=v[i]){r+=v[i+1];n-=v[i];} return r;
}

window.addEventListener('resize', () => {

  if (!document.getElementById('mapOverlay')?.classList.contains('map-active'))
    return;

  mapFitToViewport();
  drawFogOfWar();
  placePins();

});