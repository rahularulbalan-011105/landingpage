import { useEffect, useRef } from "react";
import type * as T from "three";
import { stageQuality } from "@/lib/stage-quality";

export type StagePhase = "loading" | "assembling" | "assembled" | "floating" | "rebuilding";
export type RobotModel = "crawler" | "arm" | "humanoid";

type Props = {
  className?: string;
  model: RobotModel;
  /** Increment to snap the floating parts back into a robot. */
  rebuildKey: number;
  onPhase?: (phase: StagePhase) => void;
};

// Palette sampled from the editor's renders.
const C = {
  chassis: 0xc4242e,
  servoBlue: 0x2a5fc4,
  servoTeal: 0x2b93b8,
  servoCyan: 0x25a9b8,
  leg: 0x2453d6,
  torso: 0x2357d9,
  orange: 0xe2772e,
  magenta: 0xc2257a,
  disc: 0xe2dcdf,
  gripper: 0x8b1d22,
  uno: "#1c5fa6",
  navy: "#0f1c42",
  steel: 0xd9dee2,
  black: 0x121514,
  white: 0xf3f5f4,
  gold: "#e2b54a",
  gridMajor: 0x2fb36b,
  gridMinor: 0x9ed8ab,
  axisZ: 0x3b82f6,
};

// ── Silkscreen textures (drawn once, like the editor's board decals) ─────────

function canvasTex(THREE: typeof T, w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  paint(cv.getContext("2d")!);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function paintUno(g: CanvasRenderingContext2D) {
  const W = 680;
  const H = 530;
  g.fillStyle = C.uno;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.lineWidth = 3;
  g.strokeRect(10, 10, W - 20, H - 20);
  g.fillStyle = "#111";
  g.fillRect(170, 18, 470, 34);
  g.fillRect(250, H - 52, 390, 34);
  g.fillStyle = C.gold;
  for (let i = 0; i < 18; i++) g.fillRect(180 + i * 25.5, 29, 9, 12);
  for (let i = 0; i < 14; i++) g.fillRect(262 + i * 26.5, H - 41, 9, 12);
  g.fillStyle = "#cfd5da";
  for (let i = 0; i < 14; i++) {
    g.fillRect(300 + i * 22, 232, 8, 10);
    g.fillRect(300 + i * 22, 318, 8, 10);
  }
  g.fillStyle = "#151817";
  g.fillRect(288, 240, 320, 80);
  g.fillStyle = "#2a2f2d";
  g.beginPath();
  g.arc(300, 280, 8, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#d8dde1";
  g.beginPath();
  g.roundRect(200, 200, 60, 24, 12);
  g.fill();
  for (const [x, y] of [
    [150, 130],
    [200, 130],
  ]) {
    g.fillStyle = "#c9ced2";
    g.beginPath();
    g.arc(x, y, 18, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.font = "800 72px Unbounded, Figtree, sans-serif";
  g.fillText("UNO", 70, 330);
  g.font = "700 26px Figtree, sans-serif";
  g.fillText("ARDUINO", 74, 372);
  g.font = "600 18px 'JetBrains Mono', monospace";
  g.fillText("DIGITAL (PWM ~)", 360, 78);
  g.fillText("POWER", 270, 466);
  g.fillText("ANALOG IN", 480, 466);
  g.fillText("ON", 600, 150);
  g.fillStyle = "#2fd36b";
  g.fillRect(640, 140, 12, 8);
}

function paintOled(g: CanvasRenderingContext2D) {
  g.fillStyle = C.navy;
  g.fillRect(0, 0, 300, 300);
  g.fillStyle = "#050607";
  g.fillRect(22, 26, 256, 176);
  g.strokeStyle = "#1d2a52";
  g.lineWidth = 4;
  g.strokeRect(22, 26, 256, 176);
  g.fillStyle = "#7fe3ff";
  g.font = "600 30px 'JetBrains Mono', monospace";
  g.fillText("DIST 24cm", 40, 80);
  g.globalAlpha = 0.85;
  for (let i = 0; i < 12; i++) {
    const h = 14 + Math.round(Math.abs(Math.sin(i * 1.3)) * 60);
    g.fillRect(42 + i * 19, 186 - h, 11, h);
  }
  g.globalAlpha = 1;
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.font = "600 22px 'JetBrains Mono', monospace";
  g.fillText("GND VCC SCL SDA", 34, 262);
  g.strokeStyle = "rgba(255,255,255,0.6)";
  g.lineWidth = 2;
  for (const [x, y] of [
    [10, 10],
    [290, 10],
    [10, 290],
    [290, 290],
  ]) {
    g.beginPath();
    g.arc(x, y, 7, 0, Math.PI * 2);
    g.stroke();
  }
}

function paintScreen(g: CanvasRenderingContext2D) {
  // The humanoid's head: a plain OLED panel, dark glass with a soft reflection.
  g.fillStyle = "#0b0f14";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#1a2430";
  g.fillRect(14, 14, 228, 228);
  const glass = g.createLinearGradient(22, 22, 234, 234);
  glass.addColorStop(0, "#26313d");
  glass.addColorStop(0.45, "#0d1218");
  glass.addColorStop(1, "#090c10");
  g.fillStyle = glass;
  g.fillRect(22, 22, 212, 212);
}

function paintNavyBoard(labels: string[]) {
  return (g: CanvasRenderingContext2D) => {
    const W = g.canvas.width;
    const H = g.canvas.height;
    g.fillStyle = C.navy;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(255,255,255,0.25)";
    g.lineWidth = 2;
    g.strokeRect(6, 6, W - 12, H - 12);
    g.fillStyle = "rgba(255,255,255,0.88)";
    g.font = "600 20px 'JetBrains Mono', monospace";
    labels.forEach((l, i) => g.fillText(l, W - 70, 34 + i * 28));
    g.fillStyle = "#151817";
    g.fillRect(30, 30, 26, 14);
    g.fillRect(30, 60, 26, 14);
    g.fillStyle = "#e5484d";
    g.fillRect(70, H - 34, 14, 10);
  };
}

function paintMatrixBoard(g: CanvasRenderingContext2D) {
  // The humanoid's navy controller with a 5×5 LED matrix and buzzer.
  const W = g.canvas.width;
  const H = g.canvas.height;
  g.fillStyle = C.navy;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#1b2a5c";
  g.beginPath();
  g.arc(W / 2, H * 0.3, 54, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#0a1230";
  g.beginPath();
  g.arc(W / 2, H * 0.3, 40, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#e9eef2";
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++) {
      g.beginPath();
      g.arc(W / 2 - 52 + c * 26, H * 0.58 + r * 20, 5, 0, Math.PI * 2);
      g.fill();
    }
  g.fillStyle = C.gold;
  for (let i = 0; i < 9; i++) g.fillRect(36 + i * 26, H - 22, 12, 10);
}

function paintServoLabel(g: CanvasRenderingContext2D) {
  g.fillStyle = "#0e1112";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.font = "700 30px Figtree, sans-serif";
  g.fillText("TowerPro", 22, 52);
  g.font = "600 26px 'JetBrains Mono', monospace";
  g.fillText("SG90  9g", 22, 98);
}

// ── Parts kit: one model per component, shared by every robot ────────────────

type RoundedBoxCtor = new (w: number, h: number, d: number, seg?: number, r?: number) => T.BufferGeometry;
type Built = { root: T.Group; parts: T.Object3D[]; disposables: { dispose(): void }[] };

function makeKit(THREE: typeof T, RoundedBox: RoundedBoxCtor) {
  const disposables: { dispose(): void }[] = [];
  const keep = <X extends { dispose(): void }>(x: X) => (disposables.push(x), x);
  const std = (color: number, roughness = 0.55, metalness = 0) =>
    keep(new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  const decal = (paint: (g: CanvasRenderingContext2D) => void, w: number, h: number) =>
    keep(new THREE.MeshStandardMaterial({ map: keep(canvasTex(THREE, w, h, paint)), roughness: 0.55 }));

  const m = {
    steel: std(C.steel, 0.32, 0.65),
    black: std(C.black, 0.28),
    rubber: std(0x1e2321, 0.9),
    white: std(C.white, 0.5),
    edgeBlue: std(0x174f8f, 0.6),
    edgeNavy: std(0x0b1533, 0.6),
    pot: std(0x2f6fe0, 0.4),
    brown: std(0x8a5a2b, 0.6),
    gold: std(0xe2b54a, 0.35, 0.6),
    servoLabel: decal(paintServoLabel, 256, 128),
  };

  const mesh = (geo: T.BufferGeometry, mat: T.Material | T.Material[]) => {
    keep(geo);
    const o = new THREE.Mesh(geo, mat);
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  };
  /** A thin board whose top (+y) face carries a decal. */
  const board = (w: number, t: number, d: number, top: T.Material, edge: T.Material) =>
    mesh(new THREE.BoxGeometry(w, t, d), [edge, edge, top, edge, edge, edge]);

  /** Arduino UNO lying flat; components on +y. */
  const uno = () => {
    const g = new THREE.Group();
    g.add(board(6.8, 0.16, 5.3, decal(paintUno, 680, 530), m.edgeBlue));
    const usb = mesh(new THREE.BoxGeometry(1.6, 1.1, 1.2), m.steel);
    usb.position.set(-3.2, 0.6, -1.2);
    const jack = mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), m.black);
    jack.position.set(-3.2, 0.55, 1.6);
    g.add(usb, jack);
    return g;
  };

  /** SG90 micro servo: body along x, horn on +y, label on +z. */
  const servo = (color: number, hornMat: T.Material = m.white) => {
    const g = new THREE.Group();
    const bodyMat = std(color, 0.45);
    g.add(mesh(new RoundedBox(2.4, 2.3, 1.3, 3, 0.16), bodyMat));
    const tabs = mesh(new RoundedBox(3.5, 0.24, 1.3, 2, 0.08), bodyMat);
    tabs.position.y = 0.55;
    const label = mesh(new THREE.PlaneGeometry(1.9, 0.95), m.servoLabel);
    label.position.set(0, -0.2, 0.661);
    const gear = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 24), bodyMat);
    gear.position.set(0.55, 1.3, 0);
    const horn = mesh(new RoundedBox(1.9, 0.18, 0.42, 2, 0.08), hornMat);
    horn.position.set(0.55, 1.55, 0);
    g.add(tabs, label, gear, horn);
    return g;
  };

  /** Capsule link between two points. */
  const link = (a: T.Vector3, b: T.Vector3, r: number, mat: T.Material) => {
    const d = b.clone().sub(a);
    const g = new THREE.Group();
    g.position.copy(a).add(b).multiplyScalar(0.5);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    g.add(mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, d.length() - 2 * r), 6, 20), mat));
    return g;
  };

  /** Joint hub whose axis runs along z. */
  const hub = (r: number, len: number, mat: T.Material) => {
    const o = mesh(new THREE.CylinderGeometry(r, r, len, 32), mat);
    o.rotation.x = Math.PI / 2;
    return o;
  };

  /** Group placed at the midpoint of a→b with local +y running along it (z stays forward for xy segments). */
  const along = (a: T.Vector3, b: T.Vector3) => {
    const d = b.clone().sub(a);
    const g = new THREE.Group();
    g.position.copy(a).add(b).multiplyScalar(0.5);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return { g, len: d.length() };
  };

  /** Flat rounded bar from a to b: w across, t deep. */
  const bar = (a: T.Vector3, b: T.Vector3, w: number, t: number, mat: T.Material, r = 0.25) => {
    const { g, len } = along(a, b);
    g.add(mesh(new RoundedBox(w, len, t, 3, Math.min(r, w / 2 - 0.01, t / 2 - 0.01)), mat));
    return g;
  };

  /** A servo used as a limb segment from a to b, label facing +z. */
  const servoBar = (a: T.Vector3, b: T.Vector3, w: number, t: number, color: number) => {
    const { g, len } = along(a, b);
    const bodyMat = std(color, 0.45);
    g.add(mesh(new RoundedBox(w, len, t, 3, 0.22), bodyMat));
    const label = mesh(new THREE.PlaneGeometry(w * 0.78, Math.min(len * 0.42, 1.5)), m.servoLabel);
    label.position.set(0, len * 0.1, t / 2 + 0.012);
    label.rotation.z = Math.PI / 2;
    const horn = mesh(new THREE.CylinderGeometry(w * 0.26, w * 0.26, 0.2, 24), m.white);
    horn.rotation.x = Math.PI / 2;
    horn.position.set(0, -len / 2 + w * 0.42, t / 2 + 0.1);
    g.add(label, horn);
    return g;
  };

  return { THREE, RoundedBox, keep, std, decal, mesh, board, uno, servo, link, hub, bar, servoBar, m, disposables };
}
type Kit = ReturnType<typeof makeKit>;

function finish(kit: Kit, root: T.Group, parts: T.Object3D[]): Built {
  // Flatten: every part becomes a direct child of root, keeping its assembled pose.
  root.updateMatrixWorld(true);
  for (const p of parts) root.attach(p);
  // Stand the robot on the grid.
  const box = new kit.THREE.Box3().setFromObject(root);
  for (const p of parts) p.position.y -= box.min.y;
  return { root, parts, disposables: kit.disposables };
}

// ── Robot 1: crawler ─────────────────────────────────────────────────────────

function buildCrawler(kit: Kit): Built {
  const { THREE, RoundedBox, std, decal, mesh, board, m } = kit;
  const root = new THREE.Group();
  const parts: T.Object3D[] = [];
  const add = (o: T.Object3D) => (root.add(o), parts.push(o), o);

  const CW = 16;
  const CH = 3.5;
  const CD = 10;
  const cy = 3.4 + CH / 2;
  const top = cy + CH / 2;
  const chassis = mesh(new RoundedBox(CW, CH, CD, 4, 0.35), std(C.chassis, 0.62));
  chassis.position.set(0, cy, 0);
  add(chassis);

  const uno = kit.uno();
  uno.position.set(-2.6, top + 0.08, 0.2);
  add(uno);

  const oled = board(2.9, 0.2, 2.9, decal(paintOled, 300, 300), m.edgeNavy);
  oled.position.set(3.4, top + 0.1, -2.7);
  oled.rotation.y = -Math.PI / 2;
  add(oled);

  const dome = new THREE.Group();
  dome.position.set(3.6, top + 0.12, 2.5);
  dome.add(board(3.2, 0.24, 3.2, decal(paintNavyBoard([]), 256, 256), m.edgeNavy));
  const domeBase = mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.7, 40), m.black);
  domeBase.position.y = 0.47;
  const domeCap = mesh(new THREE.SphereGeometry(1.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), m.black);
  domeCap.position.y = 0.82;
  dome.add(domeBase, domeCap);
  add(dome);

  const ldr = new THREE.Group();
  ldr.position.set(6.4, top + 0.08, -2.4);
  ldr.rotation.y = 0.12;
  ldr.add(board(2.8, 0.16, 1.5, decal(paintNavyBoard(["VCC", "GND", "D0"]), 280, 150), m.edgeNavy));
  const pot = mesh(new THREE.BoxGeometry(0.6, 0.45, 0.6), m.pot);
  pot.position.set(0.1, 0.3, -0.2);
  const cell = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 20), m.brown);
  cell.position.set(-1.1, 0.5, -0.3);
  const pins = mesh(new THREE.BoxGeometry(0.9, 0.12, 0.12), m.black);
  pins.position.set(1.55, 0.06, 0.2);
  ldr.add(pot, cell, pins);
  add(ldr);

  const sonar = new THREE.Group();
  sonar.position.set(CW / 2 + 0.1, cy + 0.1, 0);
  sonar.add(mesh(new THREE.BoxGeometry(0.16, 2.2, 4.6), std(0x1f4fb8, 0.55)));
  for (const z of [-1.3, 1.3]) {
    const can = mesh(new THREE.CylinderGeometry(0.82, 0.82, 1.3, 40), m.steel);
    can.rotation.z = Math.PI / 2;
    can.position.set(0.73, 0, z);
    const grille = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.02, 32), std(0x6c767e, 0.8));
    grille.rotation.z = Math.PI / 2;
    grille.position.set(1.39, 0, z);
    sonar.add(can, grille);
  }
  add(sonar);

  for (const [x, z] of [
    [-7.2, -4.2],
    [7.2, -4.2],
    [-7.2, 4.2],
    [7.2, 4.2],
  ]) {
    const screw = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 16), m.steel);
    screw.position.set(x, top + 0.09, z);
    add(screw);
  }

  const mServo = std(C.servoBlue, 0.45);
  const mLeg = std(C.leg, 0.5);
  const upperLen = 3.6;
  const upperAngle = 0.32;
  const up = new THREE.Vector3(0, 1, 0);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const servo = mesh(new RoundedBox(2.3, 2.2, 1.2, 3, 0.18), mServo);
      servo.position.set(sx * 5.6, cy + 0.2, sz * (CD / 2 + 0.6));
      const horn = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 24), m.white);
      horn.rotation.x = Math.PI / 2;
      horn.position.z = sz * 0.7;
      servo.add(horn);
      add(servo);

      const dir = new THREE.Vector3(sx * 0.62, 0, sz).normalize();
      const pivot = new THREE.Vector3(sx * 5.6, cy + 0.2, sz * (CD / 2 + 1.3));
      const upper = new THREE.Group();
      upper.position.copy(pivot);
      upper.rotation.order = "YXZ";
      upper.rotation.set(upperAngle, Math.atan2(dir.x, dir.z), 0);
      const uMesh = mesh(new RoundedBox(0.8, 0.55, upperLen, 2, 0.15), mLeg);
      uMesh.position.z = upperLen / 2;
      upper.add(uMesh);
      add(upper);

      const knee = pivot
        .clone()
        .addScaledVector(dir, upperLen * Math.cos(upperAngle))
        .add(new THREE.Vector3(0, -upperLen * Math.sin(upperAngle), 0));
      const footPos = knee.clone().addScaledVector(dir, 1.6).setY(0.42);
      const span = knee.clone().sub(footPos);
      const lower = new THREE.Group();
      lower.position.copy(knee).add(footPos).multiplyScalar(0.5);
      lower.quaternion.setFromUnitVectors(up, span.clone().normalize());
      const lMesh = mesh(new RoundedBox(0.7, span.length(), 0.8, 2, 0.15), mLeg);
      const foot = mesh(new THREE.SphereGeometry(0.44, 20, 12), m.rubber);
      foot.position.y = -span.length() / 2;
      lower.add(lMesh, foot);
      add(lower);
    }
  }
  return finish(kit, root, parts);
}

// ── Robot 2: arm on a turntable, with a gripper end effector ────────────────

function buildArm(kit: Kit): Built {
  const { THREE, RoundedBox, std, mesh } = kit;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const root = new THREE.Group();
  const parts: T.Object3D[] = [];
  const add = (o: T.Object3D) => (root.add(o), parts.push(o), o);
  const mOrange = std(C.orange, 0.5);
  const mPad = std(C.gripper, 0.6);
  const Z = -0.4; // the arm's working plane

  // Turntable disc with the UNO on its front
  const disc = mesh(new THREE.CylinderGeometry(6.2, 6.2, 0.5, 72), std(C.disc, 0.7));
  disc.position.y = 0.25;
  add(disc);
  const uno = kit.uno();
  uno.position.set(0.8, 0.58, 3.9);
  uno.rotation.y = -0.1;
  add(uno);

  // Base yaw servo standing upright, orange turntable cap on its horn
  const base = kit.servo(C.servoTeal, mOrange);
  base.position.set(0, 0.5 + 1.15, Z);
  add(base);
  const cap = mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.45, 48), mOrange);
  cap.position.set(0.55, 3.3, Z);
  add(cap);

  // Shoulder: U-bracket holding the shoulder servo (axis along z)
  const shoulder = V(0.55, 5.0, Z);
  const bracket = new THREE.Group();
  const floor = mesh(new RoundedBox(2.0, 0.3, 3.0, 2, 0.1), mOrange);
  floor.position.y = -1.5;
  bracket.add(floor);
  for (const z of [-1, 1]) {
    const plate = mesh(new RoundedBox(2.0, 3.0, 0.3, 2, 0.1), mOrange);
    plate.position.set(0, 0, z * 1.35);
    bracket.add(plate);
  }
  bracket.position.copy(shoulder);
  add(bracket);
  /** Joint servo beside a pivot, its horn on the joint axis (z). */
  const jointServo = (pivot: T.Vector3) => {
    const s = kit.servo(C.servoTeal, mOrange);
    s.scale.setScalar(0.8);
    s.position.set(pivot.x - 0.44, pivot.y - 0.16, Z + 1.9);
    s.rotation.set(Math.PI / 2, 0, 0);
    return s;
  };
  add(jointServo(shoulder));

  // Lower arm: twin orange links, leaning back to the elbow
  const elbow = V(3.4, 10.8, Z);
  const twin = (a: T.Vector3, b: T.Vector3) => {
    const g = new THREE.Group();
    for (const z of [-0.9, 0.9]) g.add(kit.bar(a.clone().setZ(a.z + z), b.clone().setZ(b.z + z), 1.1, 0.35, mOrange, 0.17));
    return g;
  };
  add(twin(shoulder, elbow));
  const eHub = kit.hub(0.75, 2.4, mOrange);
  eHub.position.copy(elbow);
  add(eHub);
  add(jointServo(elbow));

  // Upper arm angling down and forward to the wrist
  const wrist = V(-3.8, 8.4, Z);
  add(twin(elbow, wrist));
  const wHub = kit.hub(0.65, 2.4, mOrange);
  wHub.position.copy(wrist);
  add(wHub);
  add(jointServo(wrist));

  // End effector, built pointing down then tilted toward the disc:
  // wrist link → palm → gripper servo → two fingers with grip pads.
  const eff = new THREE.Group();
  eff.position.copy(wrist);
  eff.rotation.z = -0.42;
  root.add(eff);
  const effPart = (o: T.Object3D) => (eff.add(o), parts.push(o), o);
  effPart(kit.bar(V(0, 0, Z - wrist.z), V(0, -1.7, Z - wrist.z), 1.0, 1.4, mOrange, 0.2));
  const palm = mesh(new RoundedBox(3.4, 0.6, 2.4, 2, 0.18), mOrange);
  palm.position.set(0, -1.95, 0);
  effPart(palm);
  const gServo = kit.servo(C.servoTeal, mOrange);
  gServo.scale.setScalar(0.66);
  gServo.position.set(1.15, -1.0, -0.2);
  effPart(gServo);
  for (const sx of [-1, 1]) {
    const finger = new THREE.Group();
    finger.add(mesh(new RoundedBox(0.5, 2.9, 1.7, 2, 0.18), mOrange));
    const pad = mesh(new RoundedBox(0.3, 1.2, 1.5, 2, 0.1), mPad);
    pad.position.set(-sx * 0.38, -0.75, 0);
    finger.add(pad);
    finger.position.set(sx * 1.25, -3.6, 0);
    finger.rotation.z = sx * 0.14;
    effPart(finger);
  }

  return finish(kit, root, parts);
}

// ── Robot 3: humanoid (star pose) ────────────────────────────────────────────

function buildHumanoid(kit: Kit): Built {
  const { THREE, RoundedBox, std, decal, mesh, board, m, keep } = kit;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const root = new THREE.Group();
  const parts: T.Object3D[] = [];
  const add = (o: T.Object3D) => (root.add(o), parts.push(o), o);
  const mBlue = std(C.torso, 0.5);
  const mOrange = std(C.orange, 0.5);
  const mMagenta = std(C.magenta, 0.5);
  const mDark = std(0x1a1f22, 0.4);
  const TY = 14; // torso centre height

  // Torso: a shield-shaped plate. Raised shoulder corners, a dip for the neck,
  // shoulder ledges, then tapering to a narrow base.
  const shape = new THREE.Shape();
  const pts: [number, number][] = [
    [-5.6, 4.25], [-2.1, 3.55], [2.1, 3.55], [5.6, 4.25], [5.95, 2.3], [4.1, 1.3],
    [3.5, -2.4], [2.3, -4.25], [-2.3, -4.25], [-3.5, -2.4], [-4.1, 1.3], [-5.95, 2.3],
  ];
  shape.moveTo(...pts[0]);
  pts.slice(1).forEach((p) => shape.lineTo(...p));
  shape.closePath();
  const torsoGeo = keep(
    new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: true, bevelSize: 0.16, bevelThickness: 0.16, bevelSegments: 3 }),
  );
  torsoGeo.translate(0, 0, -0.55);
  const torso = mesh(torsoGeo, mBlue);
  torso.position.y = TY;
  add(torso);

  // Arduino UNO, landscape, high on the chest
  const uno = kit.uno();
  uno.rotation.x = Math.PI / 2;
  uno.scale.setScalar(0.8);
  uno.position.set(0, TY + 1.15, 0.8);
  add(uno);

  // Navy controller below it: round speaker over a 5×5 LED matrix
  const ctrl = board(3.3, 0.2, 3.6, decal(paintMatrixBoard, 300, 327), m.edgeNavy);
  ctrl.rotation.x = Math.PI / 2;
  ctrl.position.set(0, TY - 2.05, 0.72);
  add(ctrl);

  // Header pins under the base
  const pins = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const pin = mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), m.steel);
    pin.position.set(-0.6 + i * 0.4, 0, 0);
    pins.add(pin);
  }
  pins.position.set(0, TY - 4.75, 0.1);
  add(pins);

  // Head: square OLED in an orange frame, on a short dark neck
  const neck = mesh(new RoundedBox(1.0, 0.9, 0.8, 2, 0.15), mDark);
  neck.position.set(0, TY + 3.95, 0);
  add(neck);
  const head = new THREE.Group();
  head.add(mesh(new RoundedBox(2.5, 2.5, 1.0, 4, 0.35), mOrange));
  const screen = mesh(new THREE.PlaneGeometry(1.9, 1.9), decal(paintScreen, 256, 256));
  screen.position.z = 0.51;
  head.add(screen);
  head.position.set(0, TY + 5.6, 0);
  add(head);

  for (const sx of [-1, 1]) {
    // Shoulder: a horizontal servo bolted to the shoulder ledge
    const shoulder = mesh(new RoundedBox(1.9, 1.5, 1.7, 3, 0.2), std(C.servoCyan, 0.45));
    shoulder.position.set(sx * 6.3, TY + 2.4, 0);
    add(shoulder);
    // Upper arm: teal servo hanging down beside the torso
    const sTop = V(sx * 6.6, TY + 1.8, 0);
    const sBot = V(sx * 6.85, TY - 2.2, 0);
    add(kit.servoBar(sTop, sBot, 1.75, 1.7, C.servoCyan));
    // Hand: flat orange paddle with a rounded tip
    const hTop = V(sx * 6.85, TY - 1.9, 0.05);
    const hBot = V(sx * 7.05, TY - 6.3, 0.05);
    add(kit.bar(hTop, hBot, 1.3, 2.5, mOrange, 0.6));

    // Thigh: blue servo bracket from the hip
    const hip = V(sx * 2.9, TY - 3.6, 0);
    const knee = V(sx * 3.1, 6.2, 0);
    add(kit.bar(hip, knee, 2.4, 2.0, mBlue, 0.3));
    // Shin: teal servo
    const ankle = V(sx * 3.35, 1.55, 0.1);
    add(kit.servoBar(V(sx * 3.2, 6.9, 0.1), ankle, 1.85, 1.85, C.servoCyan));
    // Foot: wide magenta sole plate
    const foot = mesh(new RoundedBox(3.2, 1.35, 4.0, 4, 0.45), mMagenta);
    foot.position.set(sx * 3.35, 0.68, 0.45);
    add(foot);
  }

  return finish(kit, root, parts);
}

// Per-robot staging: camera angle, resting yaw, idle sway.
const STAGING: Record<RobotModel, { dir: [number, number, number]; yaw: number; sway: number; zoom: number }> = {
  crawler: { dir: [0.6, 0.52, 0.62], yaw: 0.38, sway: 0.28, zoom: 2.9 },
  arm: { dir: [0.35, 0.62, 0.7], yaw: 0.2, sway: 0.3, zoom: 3.6 },
  humanoid: { dir: [0.22, 0.26, 0.94], yaw: 0.1, sway: 0.3, zoom: 2.6 },
};

// ── Stage ────────────────────────────────────────────────────────────────────

type PartState = {
  obj: T.Object3D;
  homeP: T.Vector3;
  homeQ: T.Quaternion;
  fromP: T.Vector3;
  fromQ: T.Quaternion;
  vel: T.Vector3;
  spin: T.Vector3;
  /** Where the part hovers in the exploded view. */
  anchor: T.Vector3;
  /** The robot's main body: hovers in place as the centrepiece. */
  heavy: boolean;
  radius: number;
  delay: number;
  /** Collision box in the part's own frame (before its scale), and its mass. */
  boxC: T.Vector3;
  boxH: T.Vector3;
  mass: number;
  /** This frame's oriented box in robot space: centre, unit axes, half extents. */
  c: T.Vector3;
  ax: [T.Vector3, T.Vector3, T.Vector3];
  h: [number, number, number];
  bound: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function RobotStage({ className, model, rebuildKey, onPhase }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ rebuild: () => void; setModel: (m: RobotModel) => void } | null>(null);
  const modelRef = useRef(model);
  const phaseCb = useRef(onPhase);
  phaseCb.current = onPhase;

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let teardown = () => {};

    const quality = stageQuality();
    // No usable GPU path: skip the 3D entirely rather than ship a slideshow.
    // The hero copy is designed to stand on its own (same as the no-WebGL case).
    if (!quality.enabled) return;

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      const host = hostRef.current;
      if (disposed || !host) return;

      let renderer: T.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: the copy still stands on its own
      }
      renderer.setPixelRatio(quality.dpr);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.shadowMap.enabled = quality.shadows;
      // Soft (PCF) shadows cost noticeably more per pixel; keep them for the top tier only.
      renderer.shadowMap.type = quality.tier === "high" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.touchAction = "pan-y";
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 600ms ease";
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
      const target = new THREE.Vector3();

      scene.add(new THREE.HemisphereLight(0xffffff, 0xdde6e1, 1.9));
      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.position.set(14, 30, 12);
      sun.castShadow = quality.shadows;
      if (quality.shadows) sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
      Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, far: 80 });
      sun.shadow.radius = 4;
      sun.shadow.bias = -0.0006;
      scene.add(sun);

      // The editor's ground: mint grid, green X axis, blue Z axis, soft shadows.
      const grid = new THREE.GridHelper(240, 120, C.gridMinor, C.gridMinor);
      scene.add(grid);
      const axisMat = (color: number) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
      const xAxisMat = axisMat(C.gridMajor);
      const zAxisMat = axisMat(C.axisZ);
      const xAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-120, 0.01, 0), new THREE.Vector3(120, 0.01, 0)]);
      const zAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.01, -120), new THREE.Vector3(0, 0.01, 120)]);
      scene.add(new THREE.Line(xAxisGeo, xAxisMat), new THREE.Line(zAxisGeo, zAxisMat));
      const shadowGeo = new THREE.PlaneGeometry(240, 240);
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.16 });
      const ground = new THREE.Mesh(shadowGeo, shadowMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0.005;
      ground.receiveShadow = true;
      scene.add(ground);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tmpV = new THREE.Vector3();
      const box = new THREE.Box3();

      // ── Current robot ──
      let current: RobotModel = modelRef.current;
      let built: Built | null = null;
      let states: PartState[] = [];
      let partOf = new Map<T.Object3D, PartState>();
      let stage = STAGING[current];
      const frameCentre = new THREE.Vector3();
      const frameSize = new THREE.Vector3();
      const floatCentre = new THREE.Vector3();
      const floatBounds = new THREE.Vector3();
      // Camera-relative walls (in robot space): never drift over the copy or into the lens.
      const screenRight = new THREE.Vector3();
      const towardCam = new THREE.Vector3();
      let leftLim = 0;
      let nearLim = 0;

      let phase: StagePhase = "loading";
      let tweenT = 0;
      const setPhase = (p: StagePhase) => {
        phase = p;
        phaseCb.current?.(p);
      };

      function startTween(next: "assembling" | "rebuilding") {
        for (const s of states) {
          s.fromP.copy(s.obj.position);
          s.fromQ.copy(s.obj.quaternion);
        }
        tweenT = 0;
        setPhase(next);
      }

      function mount(kind: RobotModel) {
        if (built) {
          scene.remove(built.root);
          built.disposables.forEach((d) => d.dispose());
        }
        current = kind;
        stage = STAGING[kind];
        const kit = makeKit(THREE, RoundedBoxGeometry);
        built = kind === "arm" ? buildArm(kit) : kind === "humanoid" ? buildHumanoid(kit) : buildCrawler(kit);
        const { root, parts } = built;
        scene.add(root);
        root.rotation.y = stage.yaw;

        // framing + zero-g volume from the assembled size
        box.setFromObject(root);
        box.getCenter(frameCentre);
        box.getSize(frameSize);
        floatCentre.set(0, frameSize.y * 0.55 + 1.5, 0);
        floatBounds.set(frameSize.x * 0.5 + 1.5, frameSize.y * 0.45 + 2, frameSize.z * 0.38 + 1.5);

        root.updateMatrixWorld(true);
        const inv = new THREE.Matrix4();
        const rel = new THREE.Matrix4();
        const meshBox = new THREE.Box3();
        states = parts.map((obj, i) => {
          box.setFromObject(obj);
          const size = box.getSize(tmpV);
          // tight box around the part's meshes, measured in the part's own frame
          inv.copy(obj.matrixWorld).invert();
          const local = new THREE.Box3();
          obj.traverse((o) => {
            const g = (o as T.Mesh).isMesh ? (o as T.Mesh).geometry : null;
            if (!g) return;
            if (!g.boundingBox) g.computeBoundingBox();
            local.union(meshBox.copy(g.boundingBox!).applyMatrix4(rel.multiplyMatrices(inv, o.matrixWorld)));
          });
          // re-centre the part on its geometry so it tumbles in place instead of
          // swinging around a far-off pivot (e.g. the arm's twin links sit on the root origin)
          const shift = local.getCenter(new THREE.Vector3());
          if ((obj as T.Mesh).isMesh) (obj as T.Mesh).geometry.translate(-shift.x, -shift.y, -shift.z);
          for (const ch of obj.children) ch.position.sub(shift);
          obj.position.add(shift.clone().multiply(obj.scale).applyQuaternion(obj.quaternion));
          obj.updateMatrixWorld(true);
          const boxC = new THREE.Vector3();
          const boxH = local.getSize(new THREE.Vector3()).multiplyScalar(0.5).max(new THREE.Vector3(0.08, 0.08, 0.08));
          const sc = obj.scale;
          const mass = Math.max(0.4, 8 * boxH.x * sc.x * boxH.y * sc.y * boxH.z * sc.z);
          return {
            boxC,
            boxH,
            mass: i === 0 ? mass * 25 : mass, // the centrepiece barely budges when hit
            c: new THREE.Vector3(),
            ax: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
            h: [0, 0, 0],
            bound: 0,
            obj,
            homeP: obj.position.clone(),
            homeQ: obj.quaternion.clone(),
            fromP: new THREE.Vector3(),
            fromQ: new THREE.Quaternion(),
            vel: new THREE.Vector3(),
            spin: new THREE.Vector3(),
            anchor: new THREE.Vector3(),
            heavy: false,
            radius: Math.max(0.35, Math.max(size.x, size.y, size.z) * 0.42),
            delay: i === 0 ? 0 : 0.12 + i * (0.9 / parts.length),
          };
        });
        partOf = new Map();
        for (const s of states) s.obj.traverse((o) => partOf.set(o, s));
        layout();

        // Opening: parts drift in from around the stage and click into place.
        if (reduced) {
          setPhase("assembled");
          return;
        }
        for (const s of states) {
          const dir = tmpV.copy(s.homeP).setY(0).normalize();
          if (dir.lengthSq() === 0) dir.set(rand(-1, 1), 0, rand(-1, 1)).normalize();
          s.obj.position
            .copy(s.homeP)
            .addScaledVector(dir, rand(7, 13))
            .add(new THREE.Vector3(rand(-3, 3), rand(3, 9), rand(-3, 3)));
          s.obj.quaternion.setFromEuler(new THREE.Euler(rand(-1.4, 1.4), rand(-1.4, 1.4), rand(-1.4, 1.4)));
        }
        startTween("assembling");
      }

      // ── Hit → disassemble into zero-g ──
      function burst(hitWorld: T.Vector3) {
        if (!built) return;
        const inv = built.root.quaternion.clone().invert();
        screenRight.setFromMatrixColumn(camera.matrixWorld, 0).applyQuaternion(inv).normalize();
        towardCam.setFromMatrixColumn(camera.matrixWorld, 2).applyQuaternion(inv).normalize();
        const span = Math.max(frameSize.x, frameSize.z, frameSize.y);
        leftLim = span * 0.32;
        nearLim = span * 0.22;
        const hit = built.root.worldToLocal(hitWorld.clone());
        const centre = new THREE.Vector3(0, frameSize.y * 0.5, 0);
        for (const s of states) {
          const d = tmpV.copy(s.obj.position).sub(hit);
          const dist = d.length();
          d.normalize();
          const power = (2.4 + 4.5 * Math.exp(-dist / 6)) / (1 + s.radius * 0.18);
          s.vel.copy(d).multiplyScalar(power).add(new THREE.Vector3(rand(-0.5, 0.5), rand(1.2, 2.6), rand(-0.5, 0.5)));
          s.spin.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(0.8, 2.2));
          // exploded-view anchor: pushed out from the robot's centre, lifted off the floor
          // spread sideways and up, never toward the lens
          const out = s.homeP.clone().sub(centre);
          const toward = out.dot(towardCam);
          if (toward > 0) out.addScaledVector(towardCam, -toward);
          if (out.lengthSq() < 0.01) out.copy(screenRight).multiplyScalar(rand(-1, 1)).setY(0.6);
          out.normalize();
          s.anchor
            .copy(s.homeP)
            .addScaledVector(out, span * 0.16 + s.radius * 0.6)
            .add(new THREE.Vector3(0, span * 0.1, 0));
          const near = tmpV.copy(s.anchor).sub(centre).dot(towardCam);
          if (near > nearLim * 0.5) s.anchor.addScaledVector(towardCam, -(near - nearLim * 0.5));
          s.anchor.y = Math.max(s.anchor.y, s.radius + 0.6);
          s.heavy = s === states[0]; // every builder adds its main body (chassis, disc, torso) first
          if (s.heavy) {
            s.vel.set(0, rand(1.5, 2.2), 0);
            s.spin.set(rand(-0.12, 0.12), rand(-0.2, 0.2), rand(-0.12, 0.12));
            s.anchor.copy(s.homeP).add(new THREE.Vector3(0, Math.min(2.5, span * 0.08), 0));
          }
        }
        relaxAnchors();
        setPhase("floating");
      }

      /**
       * Spread the exploded-view resting spots so no two parts' tumbling reach overlaps.
       * Otherwise neighbours keep getting tethered into each other and never settle.
       */
      function relaxAnchors() {
        for (const s of states) updateBox(s);
        const heavy = states[0];
        // how far each part can reach from its origin, whichever way it tumbles
        const reach = states.map((s) => s.bound + 0.15);
        const hc = heavy.c.clone().sub(heavy.obj.position).add(heavy.anchor);
        const d = new THREE.Vector3();
        const q = new THREE.Vector3();
        for (let iter = 0; iter < 80; iter++) {
          let moved = false;
          for (let i = 1; i < states.length; i++) {
            const a = states[i];
            // keep clear of the centrepiece's box
            d.copy(a.anchor).sub(hc);
            q.copy(hc);
            for (let k = 0; k < 3; k++) {
              const t = clamp(d.dot(heavy.ax[k]), -heavy.h[k], heavy.h[k]);
              q.addScaledVector(heavy.ax[k], t);
            }
            d.copy(a.anchor).sub(q);
            let len = d.length();
            if (len < reach[i]) {
              if (len < 1e-4) {
                d.copy(a.anchor).sub(hc).setY(0.3);
                len = d.length() || 1;
              }
              a.anchor.addScaledVector(d, (reach[i] - len) / len);
              moved = true;
            }
            for (let j = i + 1; j < states.length; j++) {
              const b = states[j];
              d.copy(b.anchor).sub(a.anchor);
              const min = reach[i] + reach[j];
              len = d.length();
              if (len >= min) continue;
              if (len < 1e-4) {
                d.set(rand(-1, 1), rand(0, 1), rand(-1, 1));
                len = d.length();
              }
              d.multiplyScalar((min - len) / len / 2);
              a.anchor.sub(d);
              b.anchor.add(d);
              moved = true;
            }
          }
          for (let i = 1; i < states.length; i++) clampAnchor(states[i]);
          if (!moved) break;
        }      }

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      function pick(ev: PointerEvent) {
        if (!built) return undefined;
        const r = canvas.getBoundingClientRect();
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        return raycaster.intersectObjects(built.parts, true)[0];
      }

      // ── Pointer: drag to rotate (assembled) · click to take apart · grab & throw (floating) ──
      let userYaw = 0;
      let userPitch = 0;
      let yawVel = 0;
      let lastTouch = -10; // when the visitor last rotated the robot (elapsed seconds)
      type Drag = {
        id: number;
        x0: number;
        y0: number;
        x: number;
        y: number;
        moved: boolean;
        mode: "rotate" | "grab" | "none";
        part?: PartState;
        plane?: T.Plane;
        offset?: T.Vector3;
        samples: { p: T.Vector3; t: number }[];
      };
      let drag: Drag | null = null;
      const planeHit = new THREE.Vector3();
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

      function aimRay(ev: PointerEvent) {
        const r = canvas.getBoundingClientRect();
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
      }

      /** Keep a part's resting spot inside the zero-g volume and clear of the copy and the lens. */
      function clampAnchor(s: PartState) {
        const a = s.anchor;
        for (const k of ["x", "y", "z"] as const) {
          a[k] = clamp(a[k], floatCentre[k] - floatBounds[k], floatCentre[k] + floatBounds[k]);
        }
        a.y = Math.max(a.y, s.radius + 0.6);
        const rel = tmpV.copy(a).sub(floatCentre);
        const near = rel.dot(towardCam);
        const side = rel.dot(screenRight);
        if (near > nearLim * 0.5) a.addScaledVector(towardCam, -(near - nearLim * 0.5));
        if (side < -leftLim) a.addScaledVector(screenRight, -leftLim - side);
      }

      const onDown = (e: PointerEvent) => {
        if (!built || (e.pointerType === "mouse" && e.button !== 0)) return;
        const hit = pick(e);
        drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false, mode: "none", samples: [] };
        if (phase === "floating" && hit) {
          const s = partOf.get(hit.object);
          if (s) {
            drag.mode = "grab";
            drag.part = s;
            drag.plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), hit.point);
            drag.offset = s.obj.getWorldPosition(new THREE.Vector3()).sub(hit.point);
            s.vel.set(0, 0, 0);
          }
        } else if (phase === "assembled") {
          drag.mode = "rotate";
          yawVel = 0;
        }
        if (drag.mode !== "none") {
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch {
            /* capture is best-effort */
          }
        }
      };

      let hoverQueued = false;
      const onMove = (e: PointerEvent) => {
        if (drag && e.pointerId === drag.id && built) {
          const dx = e.clientX - drag.x;
          const dy = e.clientY - drag.y;
          drag.x = e.clientX;
          drag.y = e.clientY;
          if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
          if (!drag.moved) return;
          if (drag.mode === "rotate") {
            userYaw += dx * 0.009;
            userPitch = clamp(userPitch + dy * 0.004, -0.3, 0.35);
            yawVel = dx * 0.009 * 60;
            lastTouch = elapsed;
            canvas.style.cursor = "grabbing";
          } else if (drag.mode === "grab" && drag.part && drag.plane && drag.offset) {
            aimRay(e);
            if (raycaster.ray.intersectPlane(drag.plane, planeHit)) {
              const local = built.root.worldToLocal(planeHit.add(drag.offset));
              drag.part.obj.position.copy(local);
              drag.samples.push({ p: local.clone(), t: performance.now() });
              if (drag.samples.length > 8) drag.samples.shift();
            }
            canvas.style.cursor = "grabbing";
          }
          return;
        }
        if (e.pointerType !== "mouse" || hoverQueued) return;
        hoverQueued = true;
        requestAnimationFrame(() => {
          hoverQueued = false;
          const over = !!pick(e);
          canvas.style.cursor =
            phase === "assembled" ? (over ? "pointer" : "grab") : phase === "floating" && over ? "grab" : "";
        });
      };

      const onUp = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        canvas.style.cursor = "";
        if (d.mode === "grab" && d.part) {
          const s = d.part;
          const now = performance.now();
          const recent = d.samples.filter((q) => now - q.t < 140);
          if (d.moved && recent.length >= 2) {
            // throw: release with the hand's velocity
            const a = recent[0];
            const b = recent[recent.length - 1];
            s.vel.copy(b.p).sub(a.p).divideScalar(Math.max(0.016, (b.t - a.t) / 1000));
            if (s.vel.length() > 40) s.vel.setLength(40);
            s.spin.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(1.6);
          } else if (!d.moved) {
            s.vel.addScaledVector(towardCam, -6);
            s.spin.addScalar(rand(-1, 1));
          }
          // it comes to rest roughly where it was thrown
          s.anchor.copy(s.obj.position).addScaledVector(s.vel, 0.45);
          clampAnchor(s);
          return;
        }
        if (!d.moved && phase === "assembled") {
          const hit = pick(e);
          if (hit) burst(hit.point);
        }
      };
      const onCancel = (e: PointerEvent) => {
        if (drag && e.pointerId === drag.id) drag = null;
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointercancel", onCancel);

      apiRef.current = {
        rebuild: () => {
          if (phase === "floating") startTween("rebuilding");
        },
        setModel: (kind) => {
          if (kind !== current) mount(kind);
        },
      };

      // ── Framing: robot sits right of the copy on desktop, under it on phones ──
      function layout() {
        const w = host!.clientWidth;
        const h = host!.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        camera.aspect = w / h;
        const wide = w >= 900;
        const span = Math.max(frameSize.x, frameSize.y * 1.25, frameSize.z);
        const dist = span * (wide ? stage.zoom : stage.zoom * 1.7);
        target.set(0, frameSize.y * 0.48, 0);
        camera.position.set(...stage.dir).normalize().multiplyScalar(dist).add(target);
        camera.lookAt(target);
        // fog only fades the far grid, never the robot
        scene.fog = new THREE.Fog(0xffffff, dist + 14, dist + 100);
        if (wide) camera.setViewOffset(w, h, -w * 0.22, -h * 0.02, w, h);
        else camera.setViewOffset(w, h, 0, -h * 0.24, w, h);
        camera.updateProjectionMatrix();
      }
      const ro = new ResizeObserver(layout);
      ro.observe(host);
      mount(current);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      // ── Loop ──
      const clock = new THREE.Clock();
      const dq = new THREE.Quaternion();
      const axis = new THREE.Vector3();
      let elapsed = 0;
      let shown = false;

      // ── Collisions: every part is an oriented box; overlapping boxes push apart and bounce ──
      const RESTITUTION = 0.75;
      const HARD_HIT = 1.5; // closing speed below which contacts don't bounce
      const satN = new THREE.Vector3();
      const satL = new THREE.Vector3();
      const satD = new THREE.Vector3();
      const relV = new THREE.Vector3();
      const kick = new THREE.Vector3();
      const crossAxes = Array.from({ length: 9 }, () => new THREE.Vector3());

      function updateBox(s: PartState) {
        const o = s.obj;
        o.updateMatrix();
        const e = o.matrix.elements;
        for (let k = 0; k < 3; k++) {
          const len = s.ax[k].set(e[k * 4], e[k * 4 + 1], e[k * 4 + 2]).length();
          s.ax[k].divideScalar(len || 1);
          s.h[k] = s.boxH.getComponent(k) * len;
        }
        s.c.copy(s.boxC).applyMatrix4(o.matrix);
        s.bound = Math.hypot(s.h[0], s.h[1], s.h[2]);
      }

      const extent = (s: PartState, L: T.Vector3) =>
        s.h[0] * Math.abs(s.ax[0].dot(L)) + s.h[1] * Math.abs(s.ax[1].dot(L)) + s.h[2] * Math.abs(s.ax[2].dot(L));

      /** Separating-axis test. Returns penetration depth (≤0 when apart); satN points from a to b. */
      function overlap(a: PartState, b: PartState) {
        satD.copy(b.c).sub(a.c);
        let best = Infinity;
        const test = (axis: T.Vector3, bias: number) => {
          const len = axis.length();
          if (len < 1e-5) return true;
          satL.copy(axis).divideScalar(len);
          const dist = satD.dot(satL);
          const o = extent(a, satL) + extent(b, satL) - Math.abs(dist);
          if (o <= 0) return false;
          if (o * bias < best) {
            best = o * bias;
            satN.copy(satL).multiplyScalar(dist < 0 ? -1 : 1);
          }
          return true;
        };
        for (let k = 0; k < 3; k++) if (!test(a.ax[k], 1) || !test(b.ax[k], 1)) return 0;
        // edge-edge axes; slightly penalised so faces win ties and contacts stay steady
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 3; j++) if (!test(crossAxes[i * 3 + j].crossVectors(a.ax[i], b.ax[j]), 1.08)) return 0;
        return best;
      }

      function collide() {
        const held = drag?.mode === "grab" ? drag.part : undefined;
        const invMass = (s: PartState) => (s === held ? 0 : 1 / s.mass);
        for (let iter = 0; iter < 3; iter++) {
          for (const s of states) updateBox(s);
          // the floor: lift the lowest corner back onto the grid and bounce
          for (const s of states) {
            if (s === held) continue;
            const low = s.c.y - (s.h[0] * Math.abs(s.ax[0].y) + s.h[1] * Math.abs(s.ax[1].y) + s.h[2] * Math.abs(s.ax[2].y));
            if (low < 0.05) {
              s.obj.position.y += 0.05 - low;
              s.c.y += 0.05 - low;
              if (s.vel.y < 0) s.vel.y = -s.vel.y * 0.5;
            }
          }
          for (let i = 0; i < states.length; i++) {
            const a = states[i];
            for (let j = i + 1; j < states.length; j++) {
              const b = states[j];
              if (a.c.distanceToSquared(b.c) > (a.bound + b.bound) ** 2) continue;
              const depth = overlap(a, b);
              if (depth <= 0) continue;              const ia = invMass(a);
              const ib = invMass(b);
              const sum = ia + ib;
              if (sum === 0) continue;
              // push apart along the contact normal, lighter part moving more
              const push = depth / sum;
              a.obj.position.addScaledVector(satN, -push * ia);
              b.obj.position.addScaledVector(satN, push * ib);
              a.c.addScaledVector(satN, -push * ia);
              b.c.addScaledVector(satN, push * ib);
              // settle their resting spots apart too, so the tethers don't drag them back together
              if (!a.heavy) a.anchor.addScaledVector(satN, -push * ia * 0.4);
              if (!b.heavy) b.anchor.addScaledVector(satN, push * ib * 0.4);
              // bounce: reflect the closing velocity
              const vn = relV.copy(b.vel).sub(a.vel).dot(satN);
              if (vn < 0) {
                // real hits bounce; slow brushes just stop, so resting neighbours don't buzz
                const hard = vn < -HARD_HIT;
                const jImp = (-(1 + (hard ? RESTITUTION : 0)) * vn) / sum;
                a.vel.addScaledVector(satN, -jImp * ia);
                b.vel.addScaledVector(satN, jImp * ib);
                if (hard) {
                  // a glancing hit sets them tumbling
                  kick.crossVectors(satN, relV).multiplyScalar(0.12);
                  if (ia && !a.heavy) a.spin.addScaledVector(kick, -1);
                  if (ib && !b.heavy) b.spin.addScaledVector(kick, 1);
                }
              }
              // contact friction: sliding and spinning bleed off while touching
              if (ia) {
                a.vel.multiplyScalar(0.97);
                a.spin.multiplyScalar(0.95);
              }
              if (ib) {
                b.vel.multiplyScalar(0.97);
                b.spin.multiplyScalar(0.95);
              }
            }
          }
        }
        for (const s of states) if (s !== held && !s.heavy) clampAnchor(s);
      }

      function frame() {
        raf = requestAnimationFrame(frame);
        const rawDt = clock.getDelta();
        const dt = Math.min(rawDt, 0.05);
        if (!visible || !built) return;
        elapsed += dt;
        const root = built.root;

        if (phase === "assembling" || phase === "rebuilding") {
          tweenT += Math.min(rawDt, 0.25); // tweens follow wall-clock time even on slow devices
          const dur = phase === "assembling" ? 0.95 : 0.8;
          const scaleDelay = phase === "assembling" ? 1 : 0.6;
          let done = true;
          for (const s of states) {
            const t = Math.min(1, Math.max(0, (tweenT - s.delay * scaleDelay) / dur));
            if (t < 1) done = false;
            s.obj.position.lerpVectors(s.fromP, s.homeP, easeOutBack(t));
            s.obj.quaternion.slerpQuaternions(s.fromQ, s.homeQ, easeOutCubic(t));
          }
          root.rotation.y += (stage.yaw + userYaw - root.rotation.y) * Math.min(1, dt * 4);
          root.rotation.x += (userPitch - root.rotation.x) * Math.min(1, dt * 4);
          if (done) setPhase("assembled");
        } else if (phase === "assembled") {
          // visitor rotation with a little inertia; the idle sway returns a few seconds later
          if (!drag || drag.mode !== "rotate") {
            userYaw += yawVel * dt;
            yawVel *= Math.pow(0.04, dt);
          }
          const idle = clamp((elapsed - lastTouch - 3) / 2, 0, 1);
          root.rotation.y = stage.yaw + userYaw + Math.sin(elapsed * 0.35) * stage.sway * idle;
          root.rotation.x = userPitch;
        } else if (phase === "floating") {
          states.forEach((s, i) => {
            if (drag?.mode === "grab" && drag.part === s) return; // held in the hand
            const p = s.obj.position;
            p.addScaledVector(s.vel, dt);
            // tethered to its exploded-view anchor, bobbing gently like it's in zero-g
            s.vel.addScaledVector(tmpV.copy(s.anchor).sub(p), 0.9 * dt);
            s.vel.y += Math.sin(elapsed * 0.9 + i * 1.7) * 0.35 * dt;
            s.vel.multiplyScalar(Math.pow(0.4, dt));
            // soft walls of the zero-g volume
            for (const k of ["x", "y", "z"] as const) {
              const off = p[k] - floatCentre[k];
              const lim = floatBounds[k];
              if (Math.abs(off) > lim) s.vel[k] -= Math.sign(off) * (Math.abs(off) - lim) * 6 * dt;
            }
            const rel = tmpV.copy(p).sub(floatCentre);
            const sx = rel.dot(screenRight);
            if (sx < -leftLim) s.vel.addScaledVector(screenRight, (-leftLim - sx) * 8 * dt);
            const sz = rel.dot(towardCam);
            if (sz > nearLim) s.vel.addScaledVector(towardCam, -(sz - nearLim) * 8 * dt);
            const spinLen = s.spin.length();
            if (spinLen > 0.0001) {
              axis.copy(s.spin).divideScalar(spinLen);
              dq.setFromAxisAngle(axis, spinLen * dt);
              s.obj.quaternion.premultiply(dq);
            }
            s.spin.multiplyScalar(Math.pow(0.75, dt));
            if (spinLen < (s.heavy ? 0.06 : 0.2)) s.spin.multiplyScalar(1.02);
          });
          collide();
        }

        renderer.render(scene, camera);
        if (!shown) {
          shown = true;
          canvas.style.opacity = "1";
        }
      }
      raf = requestAnimationFrame(frame);

      teardown = () => {
        ro.disconnect();
        io.disconnect();
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointercancel", onCancel);
        built?.disposables.forEach((d) => d.dispose());
        [grid.geometry, grid.material as T.Material, xAxisGeo, zAxisGeo, xAxisMat, zAxisMat, shadowGeo, shadowMat].forEach((d) =>
          d.dispose(),
        );
        renderer.dispose();
        canvas.remove();
        apiRef.current = null;
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      teardown();
    };
  }, []);

  useEffect(() => {
    modelRef.current = model;
    apiRef.current?.setModel(model);
  }, [model]);

  useEffect(() => {
    if (rebuildKey > 0) apiRef.current?.rebuild();
  }, [rebuildKey]);

  return <div ref={hostRef} className={className} aria-hidden />;
}
