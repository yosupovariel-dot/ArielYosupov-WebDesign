// =========================================================
// DA Web Design | Hero 3D: מחשב נייד וטלפון שמציגים את העבודות
// דורש את js/vendor/three.min.js (THREE גלובלי)
// =========================================================
(function hero3d() {
  const host = document.querySelector('.hero-canvas');
  const visual = document.querySelector('.hero-visual');
  const caption = document.querySelector('.hero-caption-text');
  if (!host || !visual || typeof THREE === 'undefined') return;

  // WebGL support check
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) return;
  } catch { return; }

  const base = host.dataset.base || 'assets/portfolio/';
  const SITES = [
    { img: 'levmeirisrael.jpg', name: 'levmeirisrael.com' },
    { img: 'keterjudah.jpg', name: 'keterjudah.com' },
    { img: 'eduardyonim.jpg', name: 'eduardyonim.com' },
    { img: 'techno-tech.jpg', name: 'techno-tech.co.il' },
    { img: 'cyberlabsdpo.jpg', name: 'cyberlabsdpo.com' },
  ];
  const PHONE_SITE = 'keterjudah-2.jpg';

  const motionOff = () =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  const isSmall = window.innerWidth < 820;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 2.3, 10.2);
  const lookAt = new THREE.Vector3(-0.1, 0.75, 0);

  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x0a1322, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5b8fe0, 3.0);
  rim.position.set(-6, 3, -5);
  scene.add(rim);
  const fill = new THREE.PointLight(0x7fa9ea, 6, 12);
  fill.position.set(-3, 1, 3);
  scene.add(fill);

  /* ---------- helpers ---------- */
  function roundedBox(w, h, d, r, seg = 4) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const b = Math.min(d * 0.35, r * 0.5);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(d - 2 * b, 0.001),
      bevelEnabled: true, bevelThickness: b, bevelSize: b,
      bevelSegments: seg, curveSegments: seg * 3,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  }
  function roundedPlane(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ShapeGeometry(s, 10);
    // map UVs 0..1 across the plane so textures fit
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
    }
    return g;
  }
  function shadowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(0,0,0,0.65)');
    grd.addColorStop(0.55, 'rgba(0,0,0,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- materials ---------- */
  const aluminium = new THREE.MeshStandardMaterial({ color: 0xb9c3cf, metalness: 0.35, roughness: 0.38 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.5, roughness: 0.35 });
  const keys = new THREE.MeshStandardMaterial({ color: 0x252c38, metalness: 0.1, roughness: 0.8 });
  const pad = new THREE.MeshStandardMaterial({ color: 0xa3adbb, metalness: 0.3, roughness: 0.5 });
  const bezel = new THREE.MeshBasicMaterial({ color: 0x0b0f16 });

  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function loadTex(file) {
    return new Promise((resolve) => {
      loader.load(base + file, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAniso;
        resolve(t);
      }, undefined, () => resolve(null));
    });
  }

  /* ---------- laptop ---------- */
  const rig = new THREE.Group();
  scene.add(rig);
  const laptop = new THREE.Group();
  rig.add(laptop);

  const baseMesh = new THREE.Mesh(roundedBox(3.5, 2.35, 0.12, 0.14), aluminium);
  baseMesh.rotation.x = -Math.PI / 2;
  baseMesh.position.y = 0.06;
  laptop.add(baseMesh);

  const kb = new THREE.Mesh(roundedPlane(3.05, 1.05, 0.05), keys);
  kb.rotation.x = -Math.PI / 2;
  kb.position.set(0, 0.1215, -0.38);
  laptop.add(kb);
  // key rows: thin lines give the deck some texture
  const keyLine = new THREE.MeshBasicMaterial({ color: 0x3a4352 });
  for (let i = 1; i < 5; i++) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 0.012), keyLine);
    l.rotation.x = -Math.PI / 2;
    l.position.set(0, 0.122, -0.38 - 0.525 + i * 0.21);
    laptop.add(l);
  }
  const trackpad = new THREE.Mesh(roundedPlane(1.15, 0.66, 0.06), pad);
  trackpad.rotation.x = -Math.PI / 2;
  trackpad.position.set(0, 0.1215, 0.62);
  laptop.add(trackpad);

  const hinge = new THREE.Group();
  hinge.position.set(0, 0.12, -1.13);
  laptop.add(hinge);

  const lid = new THREE.Mesh(roundedBox(3.5, 2.25, 0.07, 0.14), aluminium);
  lid.position.set(0, 1.125, 0);
  hinge.add(lid);
  const lidFront = new THREE.Mesh(roundedPlane(3.42, 2.17, 0.11), bezel);
  lidFront.position.set(0, 1.125, 0.0365);
  hinge.add(lidFront);

  const SCREEN_W = 3.18, SCREEN_H = SCREEN_W / 1.6;
  const screenGeo = roundedPlane(SCREEN_W, SCREEN_H, 0.03);
  const screenA = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ color: 0x0b0f16, toneMapped: false }));
  const screenB = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0 }));
  screenA.position.set(0, 1.14, 0.037);
  screenB.position.set(0, 1.14, 0.0375);
  hinge.add(screenA, screenB);

  /* ---------- phone ---------- */
  const phone = new THREE.Group();
  phone.position.set(-2.05, 1.0, 1.05);
  phone.rotation.set(-0.06, 0.55, 0.04);
  rig.add(phone);

  const PH_W = 0.98, PH_H = 2.0;
  phone.add(new THREE.Mesh(roundedBox(PH_W, PH_H, 0.1, 0.16), darkMetal));
  const phoneFace = new THREE.Mesh(roundedPlane(PH_W - 0.04, PH_H - 0.04, 0.14), bezel);
  phoneFace.position.z = 0.0505;
  phone.add(phoneFace);
  const PS_W = PH_W - 0.1, PS_H = PH_H - 0.12;
  const phoneScreen = new THREE.Mesh(
    roundedPlane(PS_W, PS_H, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x0b0f16, toneMapped: false })
  );
  phoneScreen.position.z = 0.051;
  phone.add(phoneScreen);
  const notch = new THREE.Mesh(roundedPlane(0.26, 0.06, 0.03), bezel);
  notch.position.set(0, PS_H / 2 - 0.07, 0.0515);
  phone.add(notch);

  /* ---------- soft contact shadows ---------- */
  const shTex = shadowTexture();
  const shMat = new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0.85 });
  const shLaptop = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.6), shMat);
  shLaptop.rotation.x = -Math.PI / 2;
  shLaptop.position.y = -0.01;
  rig.add(shLaptop);
  const shPhone = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), shMat.clone());
  shPhone.rotation.x = -Math.PI / 2;
  shPhone.position.set(-2.05, -0.005, 1.1);
  rig.add(shPhone);

  rig.position.set(0.15, 0, 0);

  /* ---------- sizing ---------- */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // pull back on narrow canvases so both devices stay in frame
    camera.position.z = camera.aspect < 1.1 ? 12.6 : 10.2;
    camera.updateProjectionMatrix();
    requestRender();
  }
  new ResizeObserver(resize).observe(host);

  /* ---------- interaction state ---------- */
  const BASE_YAW = 0.38;
  let pointerX = 0, pointerY = 0;
  let dragYaw = 0, dragging = false, lastX = 0;
  let scrollP = 0;
  let yaw = BASE_YAW, pitch = 0;

  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    if (dragging) {
      dragYaw += (e.clientX - lastX) * 0.008;
      dragYaw = Math.max(-1.4, Math.min(1.4, dragYaw));
      lastX = e.clientX;
    }
    requestRender();
  }, { passive: true });
  renderer.domElement.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX;
    renderer.domElement.setPointerCapture?.(e.pointerId);
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('scroll', () => {
    const hero = visual.closest('.hero');
    const h = hero ? hero.offsetHeight : window.innerHeight;
    scrollP = Math.min(Math.max(window.scrollY / h, 0), 1);
    requestRender();
  }, { passive: true });

  /* ---------- screen cycling ---------- */
  let textures = [];
  let current = 0;
  let fade = null; // { from, to, start }
  const CYCLE_MS = 3800, FADE_MS = 700;
  let lastSwap = 0;

  function setCaption(i) {
    if (caption && SITES[i]) caption.textContent = SITES[i].name;
  }
  function showScreen(i) {
    const t = textures[i];
    if (!t) return;
    screenA.material.map = t;
    screenA.material.color.set(0xffffff);
    screenA.material.needsUpdate = true;
    setCaption(i);
  }

  /* ---------- render loop ---------- */
  let visible = true, running = false, needsRender = true;
  let introStart = 0;
  const INTRO_MS = 1700;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function requestRender() {
    needsRender = true;
    if (!running) loop(performance.now());
  }

  function frame(now) {
    const still = motionOff();

    // lid opening intro
    let open = 1;
    if (!still && introStart) open = easeOut(Math.min((now - introStart) / INTRO_MS, 1));
    hinge.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.02, -0.2, open);
    phone.position.y = THREE.MathUtils.lerp(0.4, 1.0, open);
    phone.rotation.y = THREE.MathUtils.lerp(1.2, 0.55, open);

    // orientation: base + pointer + drag + scroll
    if (!dragging) dragYaw *= 0.94;
    const tYaw = BASE_YAW + (still ? 0 : pointerX * 0.22) + dragYaw + scrollP * 0.6;
    const tPitch = (still ? 0 : pointerY * 0.06) + scrollP * 0.12;
    yaw += (tYaw - yaw) * (still ? 1 : 0.08);
    pitch += (tPitch - pitch) * (still ? 1 : 0.08);
    rig.rotation.y = yaw;
    rig.rotation.x = pitch;

    // idle float
    const t = now / 1000;
    if (!still) {
      laptop.position.y = Math.sin(t * 0.9) * 0.035;
      phone.position.y += Math.sin(t * 1.1 + 1.3) * 0.05;
    }

    // screen crossfade
    if (!still && textures.length > 1) {
      if (!fade && now - lastSwap > CYCLE_MS && open >= 1) {
        const next = (current + 1) % textures.length;
        if (textures[next]) {
          screenB.material.map = textures[next];
          screenB.material.needsUpdate = true;
          fade = { to: next, start: now };
        }
      }
      if (fade) {
        const p = Math.min((now - fade.start) / FADE_MS, 1);
        screenB.material.opacity = p;
        if (p >= 1) {
          current = fade.to;
          showScreen(current);
          screenB.material.opacity = 0;
          fade = null;
          lastSwap = now;
        }
      }
    }

    camera.lookAt(lookAt);
    renderer.render(scene, camera);
  }

  function loop(now) {
    if (!visible) { running = false; return; }
    const still = motionOff();
    const animating = !still || dragging || Math.abs(dragYaw) > 0.001;
    if (animating || needsRender) {
      needsRender = false;
      frame(now);
    }
    if (animating) {
      running = true;
      requestAnimationFrame(loop);
    } else {
      running = false;
    }
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting && !document.hidden;
    if (visible) requestRender();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) requestRender();
  });
  document.addEventListener('a11y-change', requestRender);

  /* ---------- boot ---------- */
  Promise.all([...SITES.map(s => loadTex(s.img)), loadTex(PHONE_SITE)]).then((all) => {
    const phoneTex = all.pop();
    textures = all;
    showScreen(0);

    if (phoneTex) {
      // crop the desktop screenshot to a tall phone slice (right side, where Hebrew sites start)
      const aspectScreen = PS_W / PS_H;
      const frac = Math.min(aspectScreen / 1.6, 1);
      phoneTex.repeat.set(frac, 1);
      phoneTex.offset.set(1 - frac, 0);
      phoneScreen.material.map = phoneTex;
      phoneScreen.material.color.set(0xffffff);
      phoneScreen.material.needsUpdate = true;
    }

    resize();
    introStart = performance.now();
    lastSwap = introStart + INTRO_MS;
    visual.classList.add('is-3d');
    requestRender();
  });
})();
