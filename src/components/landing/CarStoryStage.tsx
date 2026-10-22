import { useEffect, useRef } from "react";
import type * as T from "three";
import { stageQuality } from "@/lib/stage-quality";

/**
 * One robot car, start to finish, driven by scroll progress (0 → 1):
 * CAD parts snap together → electronics land and wire up → code uploads and it drives.
 * Shares the hero's look: the editor's mint grid, solid parts, soft shadows.
 */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeOutBack = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);

// ── Timeline (shared with the copy so checklists tick in sync) ───────────────

export const STORY = {
  stepAt: [0, 0.33, 0.66],
  build: [
    { name: "Chassis plate", at: [0.03, 0.1] },
    { name: "TT motor ×2", at: [0.09, 0.16] },
    { name: "Wheels ×2", at: [0.15, 0.23] },
    { name: "Caster ball", at: [0.22, 0.29] },
  ],
  wire: [
    { name: "Arduino UNO", at: [0.36, 0.42] },
    { name: "HC-SR04 sonar", at: [0.41, 0.48] },
    { name: "Jumper wires", at: [0.49, 0.64] },
  ],
  code: { type: [0.68, 0.79], upload: [0.79, 0.88], drive: [0.88, 1] },
} as const;

const C = {
  chassis: 0xc4242e,
  motor: 0xf2c230,
  tire: 0x1e2321,
  hub: 0xf3f5f4,
  spoke: 0x9aa4ac,
  steel: 0xd9dee2,
  black: 0x121514,
  sonarBoard: 0x1f4fb8,
  uno: "#1c5fa6",
  gold: "#e2b54a",
  grid: 0xcfe8d6,
  axisX: 0x2fb36b,
  axisZ: 0x3b82f6,
  ink: 0x141a17,
  orange: 0xff6b35,
};

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
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.font = "800 72px Unbounded, Figtree, sans-serif";
  g.fillText("UNO", 70, 330);
  g.font = "700 26px Figtree, sans-serif";
  g.fillText("ARDUINO", 74, 372);
  g.font = "600 18px 'JetBrains Mono', monospace";
  g.fillText("DIGITAL (PWM ~)", 360, 78);
  g.fillText("POWER", 270, 466);
  g.fillText("ANALOG IN", 480, 466);
  g.fillText("ON", 560, 150);
}

type Part = {
  name: string;
  obj: T.Object3D;
  win: readonly [number, number];
  homeP: T.Vector3;
  homeQ: T.Quaternion;
  fromP: T.Vector3;
  fromQ: T.Quaternion;
};

type Props = {
  /** Scroll progress through the story, 0 → 1. Read every frame. */
  progressRef: React.MutableRefObject<number>;
  /** Optional element the upload packets fly out of (the code card). */
  sourceRef?: React.RefObject<HTMLElement | null>;
  className?: string;
};

export function CarStoryStage({ progressRef, sourceRef, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let raf = 0;
    let teardown = () => {};

    const start = async () => {
      const quality = stageQuality();
      const THREE = await import("three");
      const { RoundedBoxGeometry: RoundedBox } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      if (disposed) return;

      let renderer: T.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, alpha: true, powerPreference: "high-performance" });
      } catch {
        return;
      }
      renderer.setPixelRatio(quality.dpr);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.shadowMap.enabled = quality.shadows;
      renderer.shadowMap.type = quality.tier === "high" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      const canvas = renderer.domElement;
      Object.assign(canvas.style, { display: "block", opacity: "0", transition: "opacity 600ms ease" });
      host.prepend(canvas);

      const disposables: { dispose(): void }[] = [];
      const keep = <X extends { dispose(): void }>(x: X) => (disposables.push(x), x);
      const std = (color: number, roughness = 0.55, metalness = 0) =>
        keep(new THREE.MeshStandardMaterial({ color, roughness, metalness }));
      const mesh = (geo: T.BufferGeometry, mat: T.Material | T.Material[]) => {
        keep(geo);
        const o = new THREE.Mesh(geo, mat);
        o.castShadow = true;
        o.receiveShadow = true;
        return o;
      };

      // ── Scene: the editor's floor ──
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 500);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xdde6e1, 1.9));
      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.position.set(14, 30, 12);
      sun.castShadow = quality.shadows;
      if (quality.shadows) sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
      Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, far: 90 });
      sun.shadow.radius = 4;
      sun.shadow.bias = -0.0006;
      scene.add(sun, sun.target);

      const grid = new THREE.GridHelper(240, 120, C.grid, C.grid);
      keep(grid.geometry);
      keep(grid.material as T.Material);
      scene.add(grid);
      const line = (pts: T.Vector3[], color: number, opacity = 0.85) => {
        const g = keep(new THREE.BufferGeometry().setFromPoints(pts));
        const m = keep(new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
        return new THREE.Line(g, m);
      };
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
      scene.add(line([V(-120, 0.01, 0), V(120, 0.01, 0)], C.axisX), line([V(0, 0.01, -120), V(0, 0.01, 120)], C.axisZ));
      const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(240, 240)), keep(new THREE.ShadowMaterial({ opacity: 0.16 })));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0.005;
      ground.receiveShadow = true;
      scene.add(ground);

      const car = new THREE.Group();
      scene.add(car);
      const parts: Part[] = [];
      const addPart = (name: string, obj: T.Object3D, win: readonly [number, number], from: T.Vector3, spin = 1) => {
        car.add(obj);
        const fromQ = new THREE.Quaternion().setFromEuler(
          new THREE.Euler((Math.random() - 0.5) * 1.6 * spin, (Math.random() - 0.5) * 1.6 * spin, (Math.random() - 0.5) * 1.2 * spin),
        );
        parts.push({
          name,
          obj,
          win,
          homeP: obj.position.clone(),
          homeQ: obj.quaternion.clone(),
          fromP: obj.position.clone().add(from),
          fromQ: fromQ.multiply(obj.quaternion.clone()),
        });
        obj.visible = false;
        return obj;
      };
      const [bChassis, bMotor, bWheel, bCaster] = STORY.build.map((b) => b.at);
      const [wUno, wSonar, wWires] = STORY.wire.map((b) => b.at);

      // ── 01 · CAD parts ──
      const chassis = mesh(new RoundedBox(14, 0.8, 8, 3, 0.3), std(C.chassis, 0.62));
      chassis.position.set(0, 3.6, 0);
      addPart("Chassis plate · 140 × 80 mm", chassis, bChassis, V(0, 14, 0), 0.4);

      const wheelSpins: T.Group[] = [];
      for (const sz of [-1, 1]) {
        const motor = new THREE.Group();
        motor.add(mesh(new RoundedBox(2.2, 1.9, 3.6, 2, 0.2), std(C.motor, 0.45)));
        const shaft = mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), std(C.steel, 0.3, 0.6));
        shaft.rotation.x = Math.PI / 2;
        shaft.position.z = sz * 2.2;
        motor.add(shaft);
        motor.position.set(2.5, 2.25, sz * 2.6);
        const mw = sz < 0 ? [bMotor[0], bMotor[1] - 0.025] as const : [bMotor[0] + 0.025, bMotor[1]] as const;
        addPart("TT gear motor · 1:48", motor, mw, V(0, 9, sz * 8));

        const wheel = new THREE.Group();
        const spinG = new THREE.Group();
        const tire = mesh(new THREE.TorusGeometry(2.0, 0.65, 18, 56), std(C.tire, 0.9));
        const hubM = mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.9, 40), std(C.hub, 0.5));
        hubM.rotation.x = Math.PI / 2;
        spinG.add(tire, hubM);
        for (let k = 0; k < 3; k++) {
          const spoke = mesh(new THREE.BoxGeometry(2.7, 0.32, 1.0), std(C.spoke, 0.5));
          spoke.rotation.z = (k * Math.PI) / 3;
          spinG.add(spoke);
        }
        wheel.add(spinG);
        wheel.position.set(2.5, 2.65, sz * 5.0);
        wheelSpins.push(spinG);
        const ww = sz < 0 ? [bWheel[0], bWheel[1] - 0.03] as const : [bWheel[0] + 0.03, bWheel[1]] as const;
        addPart("Wheel · Ø 65 mm", wheel, ww, V(0, 6, sz * 12));
      }

      const caster = new THREE.Group();
      const bracket = mesh(new RoundedBox(1.4, 1.5, 1.4, 2, 0.2), std(C.black, 0.4));
      bracket.position.y = 1.6;
      const ball = mesh(new THREE.SphereGeometry(0.9, 24, 16), std(C.steel, 0.25, 0.7));
      ball.position.y = 0;
      caster.add(bracket, ball);
      caster.position.set(-5.4, 0.9, 0);
      addPart("Caster ball", caster, bCaster, V(-8, 8, 0));

      // ── 02 · Electronics ──
      const unoTex = keep(
        (() => {
          const cv = document.createElement("canvas");
          cv.width = 680;
          cv.height = 530;
          paintUno(cv.getContext("2d")!);
          const t = new THREE.CanvasTexture(cv);
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          return t;
        })(),
      );
      const edge = std(0x174f8f, 0.6);
      const uno = new THREE.Group();
      uno.add(mesh(new THREE.BoxGeometry(6.8, 0.16, 5.3), [edge, edge, keep(new THREE.MeshStandardMaterial({ map: unoTex, roughness: 0.55 })), edge, edge, edge]));
      const usb = mesh(new THREE.BoxGeometry(1.6, 1.1, 1.2), std(C.steel, 0.32, 0.65));
      usb.position.set(-3.2, 0.6, -1.2);
      const jack = mesh(new THREE.BoxGeometry(1.4, 1.0, 0.9), std(C.black, 0.3));
      jack.position.set(-3.2, 0.55, 1.6);
      for (const [x, z] of [[-3, -2.3], [3, -2.3], [-3, 2.3], [3, 2.3]]) {
        const standoff = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 10), std(0xc8a24a, 0.4, 0.5));
        standoff.position.set(x, -0.28, z);
        uno.add(standoff);
      }
      const ledMat = keep(new THREE.MeshStandardMaterial({ color: 0x2a3a2f, emissive: 0x000000, roughness: 0.4 }));
      const led = mesh(new THREE.BoxGeometry(0.28, 0.14, 0.2), ledMat);
      led.position.set(2.75, 0.14, -1.2);
      const lMat = keep(new THREE.MeshStandardMaterial({ color: 0x3a2f20, emissive: 0x000000, roughness: 0.4 }));
      const lLed = mesh(new THREE.BoxGeometry(0.28, 0.14, 0.2), lMat);
      lLed.position.set(-0.6, 0.14, -1.4);
      uno.add(usb, jack, led, lLed);
      uno.position.set(1.0, 4.48, 0);
      addPart("Arduino UNO R3", uno, wUno, V(0, 12, 0), 0.6);

      const sonar = new THREE.Group();
      sonar.add(mesh(new THREE.BoxGeometry(0.16, 2.2, 4.6), std(C.sonarBoard, 0.55)));
      for (const z of [-1.3, 1.3]) {
        const can = mesh(new THREE.CylinderGeometry(0.82, 0.82, 1.3, 32), std(C.steel, 0.32, 0.65));
        can.rotation.z = Math.PI / 2;
        can.position.set(0.73, 0, z);
        const grille = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.02, 24), std(0x6c767e, 0.8));
        grille.rotation.z = Math.PI / 2;
        grille.position.set(1.39, 0, z);
        sonar.add(can, grille);
      }
      sonar.position.set(6.6, 5.2, 0);
      addPart("HC-SR04 ultrasonic", sonar, wSonar, V(10, 6, 0));

      // jumper wires: drawn on progressively via drawRange
      const wireDefs: { pts: [number, number, number][]; color: number }[] = [
        { pts: [[2.6, 4.7, -2.3], [2.6, 6.0, -3.6], [2.6, 4.6, -4.7], [2.5, 2.9, -4.4]], color: 0xf2a33a },
        { pts: [[3.0, 4.7, -2.3], [3.4, 6.8, 0], [3.0, 5.2, 4.7], [2.5, 2.9, 4.4]], color: 0x3b82f6 },
        { pts: [[0.2, 4.7, 2.3], [2.6, 7.4, 2.6], [6.4, 5.0, 1.7]], color: 0x1f2937 },
        { pts: [[0.6, 4.7, 2.3], [3.0, 7.0, -2.8], [6.4, 5.0, -1.5]], color: 0xe5484d },
        { pts: [[-0.2, 4.7, -2.3], [3.0, 7.2, -2.0], [6.4, 5.0, -0.7]], color: 0x22c55e },
        { pts: [[0.3, 4.7, -2.3], [3.3, 7.6, -1.2], [6.4, 5.0, 0.1]], color: 0x22c3e6 },
        { pts: [[1.2, 4.7, 2.3], [4.0, 6.8, 2.2], [6.4, 5.0, 0.9]], color: 0xa855f7 },
      ];
      const wires = wireDefs.map((d, i) => {
        const curve = new THREE.CatmullRomCurve3(d.pts.map((p) => V(...p)));
        const geo = keep(new THREE.TubeGeometry(curve, 80, 0.12, 8));
        const m = new THREE.Mesh(geo, std(d.color, 0.45));
        m.castShadow = true;
        m.visible = false;
        car.add(m);
        const span = (wWires[1] - wWires[0]) * 0.42;
        const a = wWires[0] + (i / (wireDefs.length - 1)) * (wWires[1] - wWires[0] - span);
        return { m, geo, count: geo.index!.count, win: [a, a + span] as const };
      });

      // ── CAD overlays: move gizmo + dimension lines ──
      const gizmo = new THREE.Group();
      for (const [dir, color] of [[V(1, 0, 0), 0xe5484d], [V(0, 1, 0), 0x2fb36b], [V(0, 0, 1), 0x3b82f6]] as const) {
        const arrow = new THREE.ArrowHelper(dir, V(0, 0, 0), 3.2, color, 0.8, 0.45);
        (arrow.line.material as T.Material).depthTest = false;
        (arrow.cone.material as T.Material).depthTest = false;
        arrow.renderOrder = 10;
        keep(arrow);
        gizmo.add(arrow);
      }
      car.add(gizmo);

      const dimMat = keep(new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0 }));
      const dim = (a: T.Vector3, b: T.Vector3, tick: T.Vector3) => {
        const g = keep(
          new THREE.BufferGeometry().setFromPoints([
            a, b,
            a.clone().sub(tick), a.clone().add(tick),
            b.clone().sub(tick), b.clone().add(tick),
          ]),
        );
        const l = new THREE.LineSegments(g, dimMat);
        car.add(l);
        return l;
      };
      dim(V(-7, 0.05, 7.4), V(7, 0.05, 7.4), V(0, 0, 0.5));
      dim(V(9.2, 0.05, -5.65), V(9.2, 0.05, 5.65), V(0.5, 0, 0));
      const dimAnchors = [V(0, 0.05, 7.4), V(9.2, 0.05, 0)];

      // ── 03 · Code: upload packets + sonar ping ──
      const usbPort = V(-2.4, 5.1, -1.2);
      const uploadCurve = new THREE.CatmullRomCurve3([V(-22, 16, 10), V(-13, 13, 4), V(-6, 8.5, 0.5), usbPort]);
      const packetMat = keep(new THREE.MeshBasicMaterial({ color: C.orange }));
      const packetGeo = keep(new THREE.SphereGeometry(0.28, 12, 8));
      const packets = Array.from({ length: 18 }, () => {
        const p = new THREE.Mesh(packetGeo, packetMat);
        p.visible = false;
        car.add(p);
        return p;
      });
      const pingMat = keep(new THREE.MeshBasicMaterial({ color: 0x29abe2, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      const pingGeo = keep(new THREE.RingGeometry(0.85, 1.0, 40));
      const pings = [0, 1].map(() => {
        const r = new THREE.Mesh(pingGeo, pingMat.clone());
        keep(r.material as T.Material);
        r.rotation.y = Math.PI / 2;
        r.visible = false;
        car.add(r);
        return r;
      });

      // ── Camera path ──
      type Key = { t: number; dir: T.Vector3; dist: number; target: T.Vector3 };
      const KEYS: Key[] = [
        { t: 0.0, dir: V(0.8, 0.62, 0.95), dist: 58, target: V(0, 2.5, 0) },
        { t: 0.3, dir: V(0.62, 0.55, 0.9), dist: 46, target: V(0, 3, 0) },
        { t: 0.5, dir: V(0.3, 0.95, 0.6), dist: 36, target: V(1, 4.5, 0) },
        { t: 0.66, dir: V(0.25, 0.7, 0.85), dist: 38, target: V(0, 4.5, 0) },
        { t: 0.86, dir: V(-0.35, 0.6, 0.95), dist: 44, target: V(-2, 4, 0) },
        { t: 1.0, dir: V(0.75, 0.42, 0.8), dist: 50, target: V(2, 3, 0) },
      ];
      KEYS.forEach((k) => k.dir.normalize());
      const camDir = new THREE.Vector3();
      const camTarget = new THREE.Vector3();
      const poseAt = (t: number) => {
        let i = 0;
        while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
        const a = KEYS[i];
        const b = KEYS[i + 1];
        const f = smooth(seg(t, a.t, b.t));
        camDir.copy(a.dir).lerp(b.dir, f).normalize();
        camTarget.copy(a.target).lerp(b.target, f);
        return a.dist + (b.dist - a.dist) * f;
      };

      let wide = true;
      let W = 1;
      let H = 1;
      const layout = () => {
        W = host.clientWidth;
        H = host.clientHeight;
        if (!W || !H) return;
        renderer.setSize(W, H, false);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        camera.aspect = W / H;
        wide = W >= 900;
        if (wide) camera.setViewOffset(W, H, -W * 0.2, -H * 0.02, W, H);
        else camera.setViewOffset(W, H, 0, H * 0.2, W, H);
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(layout);
      ro.observe(host);
      layout();

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      const tmp = new THREE.Vector3();
      let t = progressRef.current;
      let time = 0;
      let shown = false;

      const placeLabel = (el: HTMLSpanElement | null, world: T.Vector3 | null, opacity: number) => {
        if (!el) return;
        if (!world || opacity <= 0.01) {
          el.style.opacity = "0";
          return;
        }
        tmp.copy(world).project(camera);
        el.style.opacity = String(opacity);
        el.style.transform = `translate(${((tmp.x + 1) / 2) * W}px, ${((1 - tmp.y) / 2) * H}px) translate(-50%, -50%)`;
      };

      const frame = () => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.05);
        if (!visible) return;
        time += dt;
        t += (progressRef.current - t) * Math.min(1, dt * 6);

        // parts fly in and click into place
        let active: Part | null = null;
        for (const p of parts) {
          const k = seg(t, p.win[0], p.win[1]);
          p.obj.visible = k > 0;
          if (k > 0) {
            p.obj.position.lerpVectors(p.fromP, p.homeP, easeOutBack(k));
            p.obj.quaternion.slerpQuaternions(p.fromQ, p.homeQ, easeOutCubic(k));
            if (t < p.win[1] + 0.05) active = p;
          }
        }
        for (const w of wires) {
          const k = seg(t, w.win[0], w.win[1]);
          w.m.visible = k > 0;
          w.geo.setDrawRange(0, Math.floor((easeOutCubic(k) * w.count) / 6) * 6);
        }

        // CAD gizmo rides on the part being placed (build step only)
        const buildActive = t < 0.32 && active;
        gizmo.visible = !!buildActive;
        if (buildActive) gizmo.position.copy(active!.obj.position).add(tmp.set(0, 2.2, 0));
        const dimO = seg(t, 0.08, 0.13) * (1 - seg(t, 0.31, 0.36));
        dimMat.opacity = dimO * 0.8;

        // code: upload, wake up, drive
        const up = seg(t, STORY.code.upload[0], STORY.code.upload[1]);
        // aim the packet stream from the code card's right edge into the USB port
        const src = sourceRef?.current;
        if (up > 0 && up < 1 && src) {
          const r = src.getBoundingClientRect();
          const hr = host.getBoundingClientRect();
          if (r.width > 0) {
            const depth = tmp.copy(usbPort).applyMatrix4(car.matrixWorld).project(camera).z;
            const a = uploadCurve.points[0]
              .set(((r.right - hr.left) / W) * 2 - 1, -(((r.top + r.height * 0.35 - hr.top) / H) * 2 - 1), depth)
              .unproject(camera);
            car.worldToLocal(a);
            uploadCurve.points[1].lerpVectors(a, usbPort, 0.35).add(tmp.set(0, 5, 0));
            uploadCurve.points[2].lerpVectors(a, usbPort, 0.72).add(tmp.set(0, 3, 0));
          }
        }
        packets.forEach((p, i) => {
          const u = (i / packets.length + time * 0.55) % 1;
          p.visible = up > 0 && up < 1;
          uploadCurve.getPoint(u, p.position);
          p.scale.setScalar(Math.sin(Math.PI * u) * 1.1 + 0.1);
        });
        const alive = t >= STORY.code.upload[1] - 0.005;
        ledMat.emissive.setHex(up > 0 || alive ? 0x2fd36b : 0x000000);
        ledMat.emissiveIntensity = 1.4;
        const blink = alive ? (Math.sin(time * 8) > 0 ? 1 : 0) : up > 0 && up < 1 ? (Math.sin(time * 22) > 0 ? 1 : 0) : 0;
        lMat.emissive.setHex(blink ? 0xffa53a : 0x000000);
        pings.forEach((r, i) => {
          const ph = (time * 0.9 + i * 0.5) % 1;
          r.visible = alive;
          r.position.set(8.3 + ph * 6, 5.2, 0);
          r.scale.setScalar(1 + ph * 3.2);
          (r.material as T.MeshBasicMaterial).opacity = (1 - ph) * 0.7;
        });
        const drive = easeInOut(seg(t, STORY.code.drive[0], STORY.code.drive[1]));
        car.position.x = drive * 14;
        car.position.y = alive && !reduced ? Math.abs(Math.sin(time * 9)) * 0.04 : 0;
        for (const s of wheelSpins) s.rotation.z = -(car.position.x / 2.65);

        // camera follows the story
        const dist = poseAt(t) * (wide ? 1 : 1.75);
        const sway = reduced ? 0 : Math.sin(time * 0.3) * 0.05;
        camDir.applyAxisAngle(tmp.set(0, 1, 0), sway);
        camTarget.x += car.position.x * 0.85;
        camera.position.copy(camDir).multiplyScalar(dist).add(camTarget);
        camera.lookAt(camTarget);
        scene.fog = scene.fog ?? new THREE.Fog(0xffffff, 60, 160);
        (scene.fog as T.Fog).near = dist + 12;
        (scene.fog as T.Fog).far = dist + 110;
        sun.position.set(14 + car.position.x, 30, 12);
        sun.target.position.set(car.position.x, 0, 0);

        renderer.render(scene, camera);

        // HTML callouts track 3D anchors
        const labels = labelRefs.current;
        placeLabel(labels[0], active ? car.localToWorld(active.obj.position.clone().add(V(0, 3.6, 0))) : null, active && t < 0.66 ? 1 : 0);
        if (labels[0] && active) labels[0].textContent = active.name;
        placeLabel(labels[1], car.localToWorld(dimAnchors[0].clone()), dimO);
        placeLabel(labels[2], car.localToWorld(dimAnchors[1].clone()), dimO);

        if (!shown) {
          shown = true;
          canvas.style.opacity = "1";
        }
      };
      raf = requestAnimationFrame(frame);

      teardown = () => {
        ro.disconnect();
        io.disconnect();
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        canvas.remove();
      };
    };

    // No usable GPU path: never load three or open a second WebGL context.
    if (!stageQuality().enabled) return;

    const gate = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        gate.disconnect();
        void start();
      },
      { rootMargin: "800px 0px" },
    );
    gate.observe(host);

    return () => {
      disposed = true;
      gate.disconnect();
      cancelAnimationFrame(raf);
      teardown();
    };
  }, [progressRef, sourceRef]);

  const pill =
    "pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-[8px] border border-wb-line bg-white/95 px-2 py-1 font-key text-[11px] text-wb-ink-2 shadow-sm opacity-0 transition-opacity duration-200";
  return (
    <div ref={hostRef} className={className} aria-hidden>
      <span ref={(el) => void (labelRefs.current[0] = el)} className={`${pill} text-wb-ink`} />
      <span ref={(el) => void (labelRefs.current[1] = el)} className={pill}>
        140 mm
      </span>
      <span ref={(el) => void (labelRefs.current[2] = el)} className={pill}>
        113 mm
      </span>
    </div>
  );
}
