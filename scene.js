/* ═══════════════════════════════════════════════════════
   SCENE.JS — Chapter II VTT-style map viewer
   Phase 3: tokens can be dragged from the tray onto the
   map, moved freely, resized, and removed. Their state now
   syncs live between everyone on the page via Yjs + WebRTC
   — no backend server of our own, just a public signaling
   relay that only helps peers find each other; the token
   data itself flows directly browser-to-browser.
═══════════════════════════════════════════════════════ */

import * as Y from 'https://esm.sh/yjs@13.6.31';
import { WebrtcProvider } from 'https://esm.sh/y-webrtc@10.3.0?deps=yjs@13.6.31';

/* ─────────────────────────────────────────────────────
   LIVE SYNC CONFIG
   ROOM_NAME identifies this "table" to the signaling
   server — anyone who loads this page joins the same
   room automatically. ROOM_PASSWORD just encrypts the
   traffic between peers; change both to whatever you
   like (they just need to match for everyone using the
   same table).
───────────────────────────────────────────────────────── */
const ROOM_NAME     = 'pok-dnd-price-of-knowledge-scene-tokens-v1';
const ROOM_PASSWORD = 'ravens-and-runeblades';

/* ─────────────────────────────────────────────────────
   MASTER-ONLY ENEMY ROSTER
   The enemy tray stays hidden behind a password prompt so
   players glancing at the screen don't see spoilers. Only
   the SHA-256 hash lives in this file — never the plain
   password — so a quick "view source" doesn't reveal it.

   ⚠️ Read this honestly: this is a *spoiler* gate, not real
   security. The site is 100% public and static — the enemy
   images/names still exist as plain files anyone could find
   by digging through the repo or browser network tab. It
   stops a player from casually seeing the roster; it does
   NOT stop someone determined to look. Once an enemy token
   is actually placed on the map, everyone sees it normally
   (that part syncs live, same as heroes) — that's the
   "revealed to everyone" behavior you asked for.

   To set your own password: open this page, open the
   browser console (F12), and run:
     await crypto.subtle.digest('SHA-256', new TextEncoder().encode('sua-senha'))
       .then(b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join(''))
   then paste the result below.
───────────────────────────────────────────────────────── */
const MASTER_PASSWORD_HASH = 'eb38f6b02cd6e6d5f8ceb3e56d6c7d4f51fec445bcd2e141f28948dd0dc81f8a';
const MASTER_UNLOCK_KEY = 'pok_master_unlocked';
let masterUnlocked = localStorage.getItem(MASTER_UNLOCK_KEY) === '1';

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function promptMasterUnlock() {
  const pw = prompt('Senha do Mestre:');
  if (pw == null) return;
  const hash = await sha256Hex(pw.trim());
  if (hash === MASTER_PASSWORD_HASH) {
    masterUnlocked = true;
    localStorage.setItem(MASTER_UNLOCK_KEY, '1');
    renderTokenTray();
  } else {
    alert('Senha incorreta.');
  }
}

function relockMaster(e) {
  e.stopPropagation();
  masterUnlocked = false;
  localStorage.removeItem(MASTER_UNLOCK_KEY);
  renderTokenTray();
}


/* ─────────────────────────────────────────────────────
   DATA
   Add new floors here as maps are ready — just point
   `img` at the file and flip `unlocked` to true.
───────────────────────────────────────────────────────── */
const FLOORS = [
  { id: 1,   name: "Andar 1", img: "Andar1.png",   unlocked: true  },
  { id: 2,   name: "Andar 2", img: "Andar2.png",   unlocked: true },
  { id: 3,   name: "Andar 3", img: "Andar3.png",   unlocked: true },
  { id: 4,   name: "Andar 4", img: "Andar4.png",   unlocked: true },
];

const TOKENS = [
  { id: "jack",  name: "Jack",      img: "token_jack.png",  color: "#3a8d54" },
  { id: "annie", name: "Annie",     img: "token_annie.png", color: "#9b4fc0" },
  { id: "oruam", name: "Oruam",     img: "token_oruam.png", color: "#3f8fd0" },
  { id: "judy",  name: "Judy Hops", img: "token_judy.png",  color: "#c8a02e" },
  { id: "gor", name: "Gor",     img: "token_gor.png", color: "#c0503a" },
];

/* Inimigos / criaturas de combate desta dungeon.
   Sem arte pronta ainda? Sem problema — sem o campo `img`,
   o token aparece como um "monograma" colorido (inicial do
   nome). Assim que tiver o PNG, é só adicionar
   `img: "token_monge.png"` (por exemplo) que ele passa a
   usar a imagem automaticamente, igual os heróis. */
const ENEMIES = [
  { id: "monge",          name: "Monge",              img: "token_monge.png",          color: "#8a2f2f" },
  { id: "dragao_marmore", name: "Dragão de Mármore",  img: "token_dragao_marmore.png",  color: "#9c8a5a" },
  { id: "elfo_angelical", name: "Elfo Angelical",     img: "token_elfo_angelical.png",  color: "#d8c96a" },
  { id: "anjo_caido",     name: "Anjo Caído",         img: "token_anjo_caido.png",      color: "#5a1f3a" },
  { id: "guardiao",       name: "Guardião",           img: "token_guardiao.png",        color: "#55545f" },
];

// Registro único usado para localizar qualquer token (herói ou
// inimigo) por id, sem precisar duplicar essa lógica em todo canto.
const ALL_CHARS = [...TOKENS, ...ENEMIES];
function findChar(charId) { return ALL_CHARS.find(c => c.id === charId); }

const TOKEN_WIDTH = 70; // px, in map-image space — tweak to taste
const TOKEN_SCALE_MIN = 0.4;
const TOKEN_SCALE_MAX = 2.2;
const TOKEN_SCALE_DEFAULT = 1;

/* ─────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────── */
let currentFloorId = FLOORS.find(f => f.unlocked)?.id ?? FLOORS[0].id;
let placedTokens = []; // [{uid, charId, x, y}] for the current floor

const _view = {
  zoom: 1, panX: 0, panY: 0,
  MIN: 0.5, MAX: 4, STEP: 0.4,
  imgW: 0, imgH: 0,
  vpW: 0, vpH: 0,
  dragging: false, startX: 0, startY: 0, panStartX: 0, panStartY: 0,
  lastDist: null,
};

const _tokenDrag = {
  active: false,   // dragging a NEW token from the tray
  charId: null,
};

const _tokenMove = {
  active: false,   // moving an EXISTING token already on the map
  uid: null,
  el: null,
};

const _tokenResize = {
  active: false,   // resizing an EXISTING token via its handle
  uid: null,
  el: null,
  startX: 0,
  startScale: 1,
};

/* ─────────────────────────────────────────────────────
   ELEMENTS
───────────────────────────────────────────────────────── */
const viewportEl   = document.getElementById('sceneViewport');
const sceneEl       = document.getElementById('sceneScene');
const mapImgEl      = document.getElementById('sceneMapImg');
const floorTabsEl   = document.getElementById('floorTabs');
const tokenTrayEl   = document.getElementById('tokenTrayList');
const tokenLayerEl  = document.getElementById('sceneTokenLayer');
const clearBtn      = document.getElementById('clearFloorBtn');
const syncStatusEl  = document.getElementById('syncStatus');
const ghostEl        = ensureGhostEl();
const hintEl          = ensureHintEl();

function ensureGhostEl() {
  const el = document.createElement('div');
  el.id = 'dragGhost';
  el.innerHTML = '<img id="dragGhostImg" src="" alt="" /><div id="dragGhostMono"></div>';
  document.body.appendChild(el);
  return el;
}
function ensureHintEl() {
  const el = document.createElement('div');
  el.id = 'sceneHint';
  el.textContent = 'Drag a character onto the map \u00b7 right-click a token to remove it';
  viewportEl.appendChild(el);
  return el;
}

/* ─────────────────────────────────────────────────────
   LIVE SYNC — shared state instead of localStorage
   Every placed token is one entry in a shared Y.Map,
   keyed by "<floorId>:<uid>". Because each token is its
   own entry, two people moving different tokens at the
   same instant never clobber each other. y-webrtc keeps
   every open tab in sync directly, peer-to-peer.
───────────────────────────────────────────────────────── */
const ydoc = new Y.Doc();
const tokensMap = ydoc.getMap('placedTokens');
const provider = new WebrtcProvider(ROOM_NAME, ydoc, { password: ROOM_PASSWORD });

function tokenKey(floorId, uid) { return `${floorId}:${uid}`; }

function getTokensForFloor(floorId) {
  const prefix = `${floorId}:`;
  const out = [];
  tokensMap.forEach((val, key) => {
    if (key.startsWith(prefix)) out.push({ uid: key.slice(prefix.length), ...val });
  });
  return out;
}

function setToken(floorId, uid, data) {
  tokensMap.set(tokenKey(floorId, uid), data);
}

function deleteToken(floorId, uid) {
  tokensMap.delete(tokenKey(floorId, uid));
}

// Whenever the shared map changes — from us or from anyone
// else connected — refresh what's on screen for this floor.
tokensMap.observe(() => {
  placedTokens = getTokensForFloor(currentFloorId);
  renderPlacedTokens();
});

/* ── Connection status badge ── */
function updateSyncStatus() {
  const others = Math.max(0, provider.awareness.getStates().size - 1);
  if (others > 0) {
    syncStatusEl.textContent = `● Sincronizado — ${others} jogador${others > 1 ? 'es' : ''} online`;
    syncStatusEl.className = 'scene-sync-status online';
  } else {
    syncStatusEl.textContent = '● Sincronizado — aguardando outros jogadores';
    syncStatusEl.className = 'scene-sync-status solo';
  }
}
provider.awareness.setLocalStateField('joinedAt', Date.now());
provider.awareness.on('change', updateSyncStatus);
updateSyncStatus();

/* ─────────────────────────────────────────────────────
   FLOOR TABS
───────────────────────────────────────────────────────── */
function renderFloorTabs() {
  floorTabsEl.innerHTML = FLOORS.map(f => `
    <button class="floor-tab ${f.id === currentFloorId ? 'active' : ''} ${f.unlocked ? '' : 'locked'}"
            data-floor="${f.id}">${f.name}</button>
  `).join('');

  floorTabsEl.querySelectorAll('.floor-tab:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => {
      const floor = FLOORS.find(f => String(f.id) === btn.dataset.floor);
      if (!floor || floor.id === currentFloorId) return;
      currentFloorId = floor.id;
      loadFloor(floor);
      renderFloorTabs();
    });
  });
}

/* ─────────────────────────────────────────────────────
   LOAD FLOOR IMAGE + FIT VIEWPORT
───────────────────────────────────────────────────────── */
function loadFloor(floor) {
  placedTokens = getTokensForFloor(floor.id);
  mapImgEl.onload = () => {
    _view.imgW = mapImgEl.naturalWidth;
    _view.imgH = mapImgEl.naturalHeight;
    fitToViewport();
    renderPlacedTokens();
  };
  mapImgEl.src = floor.img;
}

function fitToViewport() {
  _view.vpW = viewportEl.clientWidth;
  _view.vpH = viewportEl.clientHeight;
  if (!_view.imgW || !_view.imgH) return;

  const scale = Math.min(_view.vpW / _view.imgW, _view.vpH / _view.imgH);
  _view.zoom = scale;
  _view.MIN = scale;
  _view.panX = (_view.vpW - _view.imgW * scale) / 2;
  _view.panY = (_view.vpH - _view.imgH * scale) / 2;
  applyTransform();
}

function clampPanToBounds() {
  const scaledW = _view.imgW * _view.zoom;
  const scaledH = _view.imgH * _view.zoom;
  const minPanX = Math.min(0, _view.vpW - scaledW);
  const maxPanX = Math.max(0, _view.vpW - scaledW);
  const minPanY = Math.min(0, _view.vpH - scaledH);
  const maxPanY = Math.max(0, _view.vpH - scaledH);

  _view.panX = Math.max(minPanX, Math.min(maxPanX, _view.panX));
  _view.panY = Math.max(minPanY, Math.min(maxPanY, _view.panY));
}

function applyTransform() {
  sceneEl.style.width  = _view.imgW + 'px';
  sceneEl.style.height = _view.imgH + 'px';
  clampPanToBounds();
  sceneEl.style.transform =
    `translate(${_view.panX}px, ${_view.panY}px) scale(${_view.zoom})`;
}

/* ─────────────────────────────────────────────────────
   ZOOM (centered on a viewport point)
───────────────────────────────────────────────────────── */
function zoomAt(newZoom, px, py) {
  newZoom = Math.min(_view.MAX, Math.max(_view.MIN, newZoom));
  const ratio = newZoom / _view.zoom;
  _view.panX = px - (px - _view.panX) * ratio;
  _view.panY = py - (py - _view.panY) * ratio;
  _view.zoom = newZoom;
  applyTransform();
}

/* ─────────────────────────────────────────────────────
   COORDINATE HELPERS
   screen (viewport px) <-> image space (natural map px)
───────────────────────────────────────────────────────── */
function screenToImage(clientX, clientY) {
  const r = viewportEl.getBoundingClientRect();
  return {
    x: (clientX - r.left - _view.panX) / _view.zoom,
    y: (clientY - r.top  - _view.panY) / _view.zoom,
  };
}

/* ─────────────────────────────────────────────────────
   TOKEN TRAY
───────────────────────────────────────────────────────── */
function trayTokenCard(t) {
  const visual = t.img
    ? `<img class="tray-token-img" src="${t.img}" alt="${t.name}" draggable="false" />`
    : `<div class="tray-token-mono">${t.name.trim().charAt(0)}</div>`;
  return `
    <div class="tray-token" data-char="${t.id}" style="--tok-color:${t.color}">
      ${visual}
      <div class="tray-token-name">${t.name}</div>
    </div>
  `;
}

function renderTokenTray() {
  const enemySection = masterUnlocked
    ? `<div class="tray-section">${ENEMIES.map(trayTokenCard).join('')}</div>`
    : `<button class="master-unlock-btn" id="masterUnlockBtn">🔒 Área do Mestre</button>`;

  tokenTrayEl.innerHTML = `
    <div class="tray-section-title">Heróis</div>
    <div class="tray-section">${TOKENS.map(trayTokenCard).join('')}</div>
    <div class="tray-section-title tray-section-title-enemy">
      Inimigos
      ${masterUnlocked ? '<span class="master-relock" id="masterRelock" title="Ocultar de novo">🔓</span>' : ''}
    </div>
    ${enemySection}
  `;

  tokenTrayEl.querySelectorAll('.tray-token').forEach(el => {
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      startTrayDrag(el.dataset.char, e.clientX, e.clientY);
    });
  });

  const unlockBtn = document.getElementById('masterUnlockBtn');
  if (unlockBtn) unlockBtn.addEventListener('click', promptMasterUnlock);

  const relockBtn = document.getElementById('masterRelock');
  if (relockBtn) relockBtn.addEventListener('click', relockMaster);
}

/* ─────────────────────────────────────────────────────
   PLACED TOKENS — render
───────────────────────────────────────────────────────── */
function renderPlacedTokens() {
  tokenLayerEl.innerHTML = '';
  const displayNames = computeDisplayNames(placedTokens);
  placedTokens.forEach(p => tokenLayerEl.appendChild(buildTokenEl(p, displayNames[p.uid])));
  hintEl.style.display = placedTokens.length ? 'none' : 'block';
}

// If more than one token of the same character is on the floor
// (e.g. three "Monge"s), label them "Monge 1", "Monge 2", ... in
// the order they were placed. A lone token just keeps its plain name.
function computeDisplayNames(list) {
  const byChar = {};
  list.slice().sort((a, b) => a.uid.localeCompare(b.uid)).forEach(p => {
    (byChar[p.charId] ??= []).push(p.uid);
  });
  const names = {};
  list.forEach(p => {
    const char = findChar(p.charId);
    if (!char) return;
    const group = byChar[p.charId];
    names[p.uid] = group.length > 1 ? `${char.name} ${group.indexOf(p.uid) + 1}` : char.name;
  });
  return names;
}

function buildTokenEl(placed, displayName) {
  const char = findChar(placed.charId);
  if (!char) return document.createComment('unknown token');

  const scale = placed.scale ?? TOKEN_SCALE_DEFAULT;
  const name = displayName || char.name;
  const visual = char.img
    ? `<img src="${char.img}" alt="${char.name}" draggable="false" />`
    : `<div class="map-token-mono">${char.name.trim().charAt(0)}</div>`;

  const el = document.createElement('div');
  el.className = 'map-token';
  el.dataset.uid = placed.uid;
  el.style.setProperty('--tok-color', char.color);
  el.style.setProperty('--tok-width', TOKEN_WIDTH + 'px');
  el.style.setProperty('--tok-scale', scale);
  el.style.left = placed.x + 'px';
  el.style.top  = placed.y + 'px';
  el.style.zIndex = Math.round(placed.y);
  el.innerHTML = `
    <div class="map-token-name">${name}</div>
    ${visual}
    <div class="token-resize-handle" title="Arrastar para redimensionar"></div>
  `;

  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    startTokenMove(placed.uid, el, e.clientX, e.clientY);
  });
  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    removeToken(placed.uid);
  });

  const handle = el.querySelector('.token-resize-handle');
  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    startTokenResize(placed.uid, el, e.clientX);
  });

  return el;
}

function removeToken(uid) {
  deleteToken(currentFloorId, uid);
}

/* ─────────────────────────────────────────────────────
   DRAG A NEW TOKEN FROM THE TRAY
───────────────────────────────────────────────────────── */
function startTrayDrag(charId, clientX, clientY) {
  const char = findChar(charId);
  if (!char) return;
  _tokenDrag.active = true;
  _tokenDrag.charId = charId;

  const ghostImg = document.getElementById('dragGhostImg');
  const ghostMono = document.getElementById('dragGhostMono');
  if (char.img) {
    ghostImg.src = char.img;
    ghostImg.style.display = 'block';
    ghostMono.style.display = 'none';
  } else {
    ghostImg.style.display = 'none';
    ghostMono.textContent = char.name.trim().charAt(0);
    ghostMono.style.setProperty('--tok-color', char.color);
    ghostMono.style.display = 'flex';
  }
  ghostEl.style.display = 'block';
  positionGhost(clientX, clientY);

  window.addEventListener('pointermove', onTrayDragMove);
  window.addEventListener('pointerup', onTrayDragEnd);
}

function positionGhost(clientX, clientY) {
  ghostEl.style.left = clientX + 'px';
  ghostEl.style.top  = clientY + 'px';
}

function onTrayDragMove(e) {
  if (!_tokenDrag.active) return;
  positionGhost(e.clientX, e.clientY);
}

function onTrayDragEnd(e) {
  if (!_tokenDrag.active) return;
  window.removeEventListener('pointermove', onTrayDragMove);
  window.removeEventListener('pointerup', onTrayDragEnd);
  ghostEl.style.display = 'none';

  const r = viewportEl.getBoundingClientRect();
  const overMap = e.clientX >= r.left && e.clientX <= r.right &&
                  e.clientY >= r.top  && e.clientY <= r.bottom;

  if (overMap) {
    const pos = screenToImage(e.clientX, e.clientY);
    const uid = 'tok_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    setToken(currentFloorId, uid, {
      charId: _tokenDrag.charId,
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      scale: TOKEN_SCALE_DEFAULT,
    });
    hintEl.style.display = 'none';
  }

  _tokenDrag.active = false;
  _tokenDrag.charId = null;
}

/* ─────────────────────────────────────────────────────
   MOVE AN EXISTING TOKEN ON THE MAP
───────────────────────────────────────────────────────── */
function startTokenMove(uid, el, clientX, clientY) {
  _tokenMove.active = true;
  _tokenMove.uid = uid;
  _tokenMove.el = el;
  el.classList.add('dragging');

  window.addEventListener('pointermove', onTokenMoveDrag);
  window.addEventListener('pointerup', onTokenMoveEnd);
}

function onTokenMoveDrag(e) {
  if (!_tokenMove.active) return;
  const pos = screenToImage(e.clientX, e.clientY);
  _tokenMove.el.style.left = pos.x + 'px';
  _tokenMove.el.style.top  = pos.y + 'px';
  _tokenMove.el.style.zIndex = Math.round(pos.y);
}

function onTokenMoveEnd(e) {
  if (!_tokenMove.active) return;
  window.removeEventListener('pointermove', onTokenMoveDrag);
  window.removeEventListener('pointerup', onTokenMoveEnd);
  _tokenMove.el.classList.remove('dragging');

  const pos = screenToImage(e.clientX, e.clientY);
  const existing = tokensMap.get(tokenKey(currentFloorId, _tokenMove.uid));
  if (existing) {
    setToken(currentFloorId, _tokenMove.uid, {
      ...existing,
      x: Math.round(pos.x),
      y: Math.round(pos.y),
    });
  }

  _tokenMove.active = false;
  _tokenMove.uid = null;
  _tokenMove.el = null;
}

/* ─────────────────────────────────────────────────────
   RESIZE AN EXISTING TOKEN VIA ITS CORNER HANDLE
───────────────────────────────────────────────────────── */
function startTokenResize(uid, el, clientX) {
  const rec = placedTokens.find(p => p.uid === uid);
  if (!rec) return;
  _tokenResize.active = true;
  _tokenResize.uid = uid;
  _tokenResize.el = el;
  _tokenResize.startX = clientX;
  _tokenResize.startScale = rec.scale ?? TOKEN_SCALE_DEFAULT;
  el.classList.add('resizing');

  window.addEventListener('pointermove', onTokenResizeDrag);
  window.addEventListener('pointerup', onTokenResizeEnd);
}

function onTokenResizeDrag(e) {
  if (!_tokenResize.active) return;
  // Convert the screen-space drag distance into image space so the
  // resize feels consistent no matter how zoomed in/out the map is.
  const deltaImg = (e.clientX - _tokenResize.startX) / _view.zoom;
  let newScale = _tokenResize.startScale + deltaImg / TOKEN_WIDTH;
  newScale = Math.min(TOKEN_SCALE_MAX, Math.max(TOKEN_SCALE_MIN, newScale));
  _tokenResize.el.style.setProperty('--tok-scale', newScale);
}

function onTokenResizeEnd(e) {
  if (!_tokenResize.active) return;
  window.removeEventListener('pointermove', onTokenResizeDrag);
  window.removeEventListener('pointerup', onTokenResizeEnd);
  _tokenResize.el.classList.remove('resizing');

  const deltaImg = (e.clientX - _tokenResize.startX) / _view.zoom;
  let newScale = _tokenResize.startScale + deltaImg / TOKEN_WIDTH;
  newScale = Math.min(TOKEN_SCALE_MAX, Math.max(TOKEN_SCALE_MIN, newScale));

  const existing = tokensMap.get(tokenKey(currentFloorId, _tokenResize.uid));
  if (existing) {
    setToken(currentFloorId, _tokenResize.uid, { ...existing, scale: newScale });
  }

  _tokenResize.active = false;
  _tokenResize.uid = null;
  _tokenResize.el = null;
}

/* ─────────────────────────────────────────────────────
   CLEAR FLOOR
───────────────────────────────────────────────────────── */
clearBtn.addEventListener('click', () => {
  if (!placedTokens.length) return;
  if (!confirm('Remove all tokens from this floor?')) return;
  placedTokens.forEach(t => deleteToken(currentFloorId, t.uid));
});

/* ─────────────────────────────────────────────────────
   INTERACTION — pan (mouse + touch) and zoom (wheel + pinch)
───────────────────────────────────────────────────────── */
function attachInteraction() {
  document.getElementById('sceneZoomIn').addEventListener('click', () =>
    zoomAt(_view.zoom + _view.STEP, _view.vpW / 2, _view.vpH / 2));
  document.getElementById('sceneZoomOut').addEventListener('click', () =>
    zoomAt(_view.zoom - _view.STEP, _view.vpW / 2, _view.vpH / 2));

  viewportEl.addEventListener('wheel', e => {
    e.preventDefault();
    const r = viewportEl.getBoundingClientRect();
    zoomAt(_view.zoom + (e.deltaY < 0 ? _view.STEP : -_view.STEP),
           e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  viewportEl.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (e.target.closest('.map-token')) return; // token drag handles itself
    _view.dragging = true;
    _view.startX = e.clientX; _view.startY = e.clientY;
    _view.panStartX = _view.panX; _view.panStartY = _view.panY;
    viewportEl.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!_view.dragging) return;
    _view.panX = _view.panStartX + (e.clientX - _view.startX);
    _view.panY = _view.panStartY + (e.clientY - _view.startY);
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    _view.dragging = false;
    viewportEl.classList.remove('dragging');
  });

  viewportEl.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      _view._tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: _view.panX, panY: _view.panY };
    } else { _view._tStart = null; }
  }, { passive: true });
  viewportEl.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      if (_view.lastDist !== null) {
        const r = viewportEl.getBoundingClientRect();
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        zoomAt(_view.zoom * (d / _view.lastDist), mx, my);
      }
      _view.lastDist = d; _view._tStart = null;
    } else if (e.touches.length === 1 && _view._tStart) {
      _view.panX = _view._tStart.panX + (e.touches[0].clientX - _view._tStart.x);
      _view.panY = _view._tStart.panY + (e.touches[0].clientY - _view._tStart.y);
      applyTransform();
    }
  }, { passive: false });
  viewportEl.addEventListener('touchend', () => { _view.lastDist = null; _view._tStart = null; });

  window.addEventListener('resize', fitToViewport);
}

/* ─────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────── */
renderFloorTabs();
renderTokenTray();
loadFloor(FLOORS.find(f => f.id === currentFloorId));
attachInteraction();