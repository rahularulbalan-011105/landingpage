import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Bolt — Constructa's robot guide, as a real 3D character.
 *
 * Built procedurally (no model download): toon-shaded parts with thick black
 * "inverted hull" outlines so he matches the site's comic style — blue body,
 * dark face plate with glowing cyan eyes, orange antenna bulb, pink cheeks,
 * stubby arms and a hover jet. Everything he does (bob, blink, talk, wave,
 * point, lean into a flight) is driven from props through refs, so changing
 * the pose never rebuilds the scene.
 */
export type BoltAction = "idle" | "talk" | "wave" | "point";
export type BoltMood = "happy" | "wow" | "wink";

export type BoltProps = {
  size?: number;
  action?: BoltAction;
  mood?: BoltMood;
  /** -1 = pointing / looking left, 1 = right (screen space). */
  dir?: -1 | 1;
  /** true while the character is flying to a new spot (leans + jet flare). */
  moving?: boolean;
};

const BLUE = 0x29abe2, BLUE_DARK = 0x1a7fb0, INK = 0x111111, FACE = 0x0f1b24
const CYAN = 0x5ee0ff, ORANGE = 0xff6b35, PINK = 0xff8fb1, WHITE = 0xf5f7fa, YELLOW = 0xffd34e

export default function Bolt3D({ size = 180, action = "idle", mood = "happy", dir = 1, moving = false }: BoltProps) {
  const host = useRef<HTMLDivElement>(null)
  const props = useRef({ action, mood, dir, moving })
  props.current = { action, mood, dir, moving }

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
    } catch {
      return   // no WebGL → the parent keeps showing the flat mascot
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(size, size)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    // Frame him snugly: jet flame (≈-1.45) to antenna bulb (≈1.85) fills the view.
    camera.position.set(0, 0.45, 6.7)
    camera.lookAt(0, 0.22, 0)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.6))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(2.5, 4, 5)
    scene.add(key)

    // 3-step toon ramp → crisp cartoon shading
    const ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1)
    ramp.minFilter = ramp.magFilter = THREE.NearestFilter
    ramp.needsUpdate = true
    const toon = (color: number, emissive = 0x000000, ei = 0) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, emissive, emissiveIntensity: ei })
    const glow = (color: number) => new THREE.MeshBasicMaterial({ color })
    const outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })
    const disposables: { dispose(): void }[] = [ramp, outlineMat]
    const track = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x }

    /** A part with a comic outline (inverted hull, scaled `w` larger). */
    const part = (geo: THREE.BufferGeometry, mat: THREE.Material, w = 0.06) => {
      track(geo); track(mat)
      const g = new THREE.Group()
      const m = new THREE.Mesh(geo, mat)
      const o = new THREE.Mesh(geo, outlineMat)
      geo.computeBoundingSphere()
      const r = geo.boundingSphere?.radius || 1
      o.scale.setScalar(1 + w / r)
      g.add(o, m)
      return g
    }

    const root = new THREE.Group()          // flight lean + bob
    scene.add(root)

    // ── body ──
    const body = part(new THREE.SphereGeometry(0.62, 32, 24), toon(BLUE))
    body.scale.set(1, 0.86, 0.9)
    body.position.y = -0.15
    root.add(body)
    const belly = part(new RoundedBoxGeometry(0.62, 0.36, 0.12, 4, 0.08), toon(FACE), 0.04)
    belly.position.set(0, -0.12, 0.53)
    root.add(belly)
    const heart = new THREE.Mesh(track(new THREE.SphereGeometry(0.075, 16, 12)), track(glow(CYAN)) as THREE.MeshBasicMaterial)
    heart.position.set(0, -0.12, 0.6)
    root.add(heart)
    const bolts = [-0.2, 0.2].map((x) => {
      const b = part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), toon(YELLOW), 0.02)
      b.rotation.x = Math.PI / 2
      b.position.set(x, -0.12, 0.6)
      root.add(b)
      return b
    })
    void bolts

    // ── hover jet ──
    const jet = part(new THREE.CylinderGeometry(0.22, 0.3, 0.2, 24), toon(BLUE_DARK))
    jet.position.y = -0.72
    root.add(jet)
    const flameMat = track(new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.75 }))
    const flame = new THREE.Mesh(track(new THREE.ConeGeometry(0.17, 0.45, 20)), flameMat)
    flame.rotation.x = Math.PI
    flame.position.y = -1.0
    root.add(flame)

    // ── head ── (pivot sits on the neck so it can nod / turn)
    const head = new THREE.Group()
    head.position.y = 0.72
    root.add(head)
    head.add(part(new RoundedBoxGeometry(1.5, 1.18, 1.1, 6, 0.36), toon(BLUE), 0.07))
    const face = part(new RoundedBoxGeometry(1.12, 0.74, 0.14, 5, 0.12), toon(FACE), 0.04)
    face.position.z = 0.53
    head.add(face)
    for (const x of [-0.82, 0.82]) {
      const ear = part(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 20), toon(BLUE_DARK), 0.05)
      ear.rotation.z = Math.PI / 2
      ear.position.x = x
      head.add(ear)
      const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.1, 0.03, 8, 20)), track(toon(ORANGE)))
      ring.rotation.y = Math.PI / 2
      ring.position.x = x * 1.12
      head.add(ring)
    }
    // eyes (capsules — squash to blink / smile)
    const eyeGeo = track(new THREE.CapsuleGeometry(0.085, 0.13, 6, 12))
    const eyeMat = track(glow(CYAN))
    const eyes = [-0.24, 0.24].map((x) => {
      const e = new THREE.Mesh(eyeGeo, eyeMat)
      e.position.set(x, 0.06, 0.62)
      head.add(e)
      const shine = new THREE.Mesh(track(new THREE.SphereGeometry(0.028, 8, 8)), track(glow(0xffffff)))
      shine.position.set(0.035, 0.07, 0.07)
      e.add(shine)
      return e
    })
    // smile
    const mouth = new THREE.Mesh(track(new THREE.TorusGeometry(0.1, 0.024, 8, 20, Math.PI)), eyeMat)
    mouth.rotation.z = Math.PI
    mouth.position.set(0, -0.15, 0.62)
    head.add(mouth)
    // blush
    const blushMat = track(new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0.85 }))
    for (const x of [-0.46, 0.46]) {
      const c = new THREE.Mesh(track(new THREE.CircleGeometry(0.075, 20)), blushMat)
      c.position.set(x, -0.1, 0.615)
      head.add(c)
    }
    // antenna (pivot at the top of the head → wobbles)
    const antenna = new THREE.Group()
    antenna.position.y = 0.58
    head.add(antenna)
    const stalk = part(new THREE.CylinderGeometry(0.035, 0.045, 0.36, 10), toon(INK), 0.0)
    stalk.position.y = 0.18
    antenna.add(stalk)
    const bulbMat = track(toon(ORANGE, ORANGE, 0.35))
    const bulb = part(new THREE.SphereGeometry(0.13, 20, 16), bulbMat, 0.05)
    bulb.position.y = 0.42
    antenna.add(bulb)

    // ── arms ── (pivot at the shoulder)
    const arm = (side: -1 | 1) => {
      const pivot = new THREE.Group()
      pivot.position.set(0.6 * side, -0.02, 0)
      const limb = part(new THREE.CapsuleGeometry(0.1, 0.32, 6, 12), toon(BLUE_DARK), 0.045)
      limb.position.y = -0.26
      pivot.add(limb)
      const hand = part(new THREE.SphereGeometry(0.13, 16, 12), toon(WHITE), 0.045)
      hand.position.y = -0.52
      pivot.add(hand)
      root.add(pivot)
      return pivot
    }
    const armL = arm(-1), armR = arm(1)

    // ── animation ──
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const s = { lean: 0, pitch: 0, headY: 0, headZ: 0, armL: 0.25, armR: -0.25, armRx: 0, armLx: 0, flame: 0.6 }
    const damp = (cur: number, to: number, k: number, dt: number) => cur + (to - cur) * (1 - Math.exp(-k * dt))
    let blinkAt = 1.5, last = performance.now(), raf = 0, t = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now; t += dt
      const p = props.current
      const d = p.dir

      // body: bob, lean into flight
      const bob = reduce ? 0.02 : 0.08
      root.position.y = Math.sin(t * 2.1) * bob + 0.05
      s.lean = damp(s.lean, p.moving ? -0.32 * d : Math.sin(t * 0.9) * 0.04, 6, dt)
      s.pitch = damp(s.pitch, p.moving ? 0.18 : 0, 6, dt)
      root.rotation.z = s.lean
      root.rotation.x = s.pitch
      root.rotation.y = damp(root.rotation.y, p.action === "point" ? 0.35 * d : p.moving ? 0.5 * d : Math.sin(t * 0.6) * 0.12, 5, dt)

      // head: look toward what he's explaining, tilt while talking
      s.headY = damp(s.headY, p.action === "point" ? 0.25 * d : 0, 5, dt)
      s.headZ = damp(s.headZ, p.action === "talk" ? Math.sin(t * 2.6) * 0.09 : p.action === "wave" ? 0.12 : 0, 6, dt)
      head.rotation.y = s.headY
      head.rotation.z = s.headZ
      head.position.y = 0.72 + (p.action === "talk" ? Math.abs(Math.sin(t * 7)) * 0.025 : 0)

      // antenna wobble (lags the body)
      antenna.rotation.z = Math.sin(t * 3.4) * 0.12 - s.lean * 0.9
      antenna.rotation.x = Math.sin(t * 2.7) * 0.08 - s.pitch * 0.8
      bulbMat.emissiveIntensity = 0.3 + (Math.sin(t * 4) + 1) * 0.2

      // arms
      const sway = Math.sin(t * 2.1) * 0.08
      let toL = 0.28 + sway, toR = -0.28 - sway, toLx = 0, toRx = 0
      if (p.action === "wave") { toR = -2.5 + Math.sin(t * 11) * 0.35 }
      else if (p.action === "point") { if (d > 0) { toR = -1.45; toRx = -0.25 } else { toL = 1.45; toLx = -0.25 } }
      else if (p.action === "talk") { toR = -0.7 + Math.sin(t * 3.2) * 0.25; toL = 0.45 + Math.sin(t * 2.4) * 0.15 }
      if (p.moving) { toL = 0.9; toR = -0.9 }
      s.armL = damp(s.armL, toL, 9, dt); s.armR = damp(s.armR, toR, 9, dt)
      s.armLx = damp(s.armLx, toLx, 9, dt); s.armRx = damp(s.armRx, toRx, 9, dt)
      armL.rotation.set(s.armLx, 0, s.armL); armR.rotation.set(s.armRx, 0, s.armR)

      // eyes: blink every few seconds, squint when happy-talking, wink mood
      let ey = 1
      if (t > blinkAt) { const k = (t - blinkAt) / 0.14; ey = k < 1 ? Math.abs(1 - 2 * k) * 0.9 + 0.1 : 1; if (k >= 1) blinkAt = t + 2.2 + Math.random() * 2.6 }
      const wow = p.mood === "wow" ? 1.25 : 1
      eyes[0].scale.set(wow, ey * wow, 1)
      eyes[1].scale.set(wow, (p.mood === "wink" ? 0.18 : ey) * wow, 1)
      eyes.forEach((e) => { e.position.x = Math.sign(e.position.x) * 0.24 + s.headY * 0.12 })

      // mouth: chatter while talking
      const m = p.action === "talk" ? 0.75 + Math.abs(Math.sin(t * 13)) * 0.7 : p.mood === "wow" ? 1.5 : 1
      mouth.scale.set(1, m, 1)

      // heart + jet
      heart.scale.setScalar(1 + Math.sin(t * 5) * 0.15)
      s.flame = damp(s.flame, p.moving ? 1.6 : 0.75 + Math.sin(t * 18) * 0.12, 8, dt)
      flame.scale.set(1, s.flame, 1)
      flame.position.y = -0.82 - 0.22 * s.flame
      flameMat.opacity = 0.55 + Math.sin(t * 22) * 0.12

      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      for (const x of disposables) x.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [size])

  return <div ref={host} style={{ width: size, height: size }} aria-hidden="true" />
}
