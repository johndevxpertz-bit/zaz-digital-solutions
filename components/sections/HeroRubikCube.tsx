"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Texture,
  WebGLRenderer,
} from "three";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";

type HeroRubikCubeProps = {
  logoSrc: string | null;
};

// Pixel geometry of the graphical ZAZ mark within the dedicated Hero asset
// (public/portfolio/logos/Logo for home hero section.png, 558x447, real
// alpha transparency) — measured via an alpha-channel scan for the gaps
// between the mark and the "ZAZ DIGITAL / SOLUTIONS" wordmark beneath it,
// not eyeballed. Only these pixels (the mark) are ever drawn onto the cube;
// the wordmark rows are outside this box and never sampled.
const MARK = { left: 127, top: 79, width: 312, height: 167 };

const AXES: Array<"x" | "y" | "z"> = ["x", "y", "z"];
const LAYERS = [-1, 0, 1];
const SPACING = 1.15;
const CUBELET_SIZE = 1.06;
const STICKER_CANVAS = 256;
const DARK_TILE = "#1c1c1c";
// The canvas renders this much larger than its layout container (see the
// renderer.domElement sizing in setup()) so the cube can swing toward the
// frame edges during rotation without ever visibly hitting a hard boundary
// — the "free-floating object" look rather than "object trapped in a box".
const OVERSCAN = 1.15;

type Cubelet = { mesh: Mesh };
type Move = { axis: "x" | "y" | "z"; layer: number; dir: 1 | -1 };

/**
 * Draws sticker (row, col) of a virtual 3x3 face onto its own small canvas:
 * a dark tile background, plus whatever portion of the ZAZ mark — scaled
 * once to fit the *whole* 3x3 face without distorting its proportions, then
 * cropped to just this cell via canvas translation — falls inside this
 * cell. Cells the (non-square) mark doesn't reach stay a plain dark tile;
 * this is what keeps the mark undistorted rather than stretching a ~1.87:1
 * mark to fill a 1:1 face.
 */
function buildStickerCanvas(img: HTMLImageElement, row: number, col: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = STICKER_CANVAS;
  canvas.height = STICKER_CANVAS;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = DARK_TILE;
  ctx.fillRect(0, 0, STICKER_CANVAS, STICKER_CANVAS);

  const faceSize = STICKER_CANVAS * 3;
  const markAspect = MARK.width / MARK.height;
  const markDrawW = faceSize;
  const markDrawH = faceSize / markAspect;
  const markX = 0;
  const markY = (faceSize - markDrawH) / 2;

  const cellX = col * STICKER_CANVAS;
  const cellY = row * STICKER_CANVAS;

  // Brightened/contrast-boosted relative to the source asset so the mark
  // reads clearly under the scene's lighting instead of blending toward the
  // dark tile around it — a display-time adjustment via canvas filter, not
  // a modification of the source file.
  ctx.filter = "brightness(1.35) contrast(1.12)";
  ctx.drawImage(
    img,
    MARK.left,
    MARK.top,
    MARK.width,
    MARK.height,
    markX - cellX,
    markY - cellY,
    markDrawW,
    markDrawH
  );
  ctx.filter = "none";
  return canvas;
}

function darkMaterial(): MeshStandardMaterial {
  // Slightly brighter base + lower roughness than before: still reads as
  // black/near-black at rest, but takes a sharper, more defined specular
  // highlight from the key light instead of absorbing it — the "controlled
  // studio lighting on a dark object" look rather than a flat void.
  return new MeshStandardMaterial({ color: 0x1c1c1e, metalness: 0.62, roughness: 0.3 });
}

function snapOrientation(mesh: Object3D) {
  mesh.updateMatrix();
  const m = mesh.matrix.clone();
  const e = m.elements;
  for (const idx of [0, 1, 2, 4, 5, 6, 8, 9, 10]) {
    e[idx] = Math.round(e[idx]);
  }
  mesh.quaternion.setFromRotationMatrix(m);
  mesh.position.x = Math.round(mesh.position.x / SPACING) * SPACING;
  mesh.position.y = Math.round(mesh.position.y / SPACING) * SPACING;
  mesh.position.z = Math.round(mesh.position.z / SPACING) * SPACING;
}

/**
 * A genuine 3x3x3 puzzle: 27 cubelets, 6 faces × 9 stickers = 54 visible
 * facelets. Every one of the 6 faces carries the ZAZ mark, each in its own
 * 9 proportion-preserving slices (see buildStickerCanvas) — so whichever
 * side the visitor is looking at when it solves, the mark is there. Any
 * cubelet face that ISN'T on the cube's exterior (i.e. touches a
 * neighboring cubelet rather than open air) stays plain dark "premium
 * metal" material — brand-dark, not the rainbow-sticker Rubik's palette.
 * Moves are real layer rotations:
 * a move selects every cubelet whose position matches a layer, reparents
 * them under a temporary pivot (Object3D#attach, which preserves
 * world transform), tweens the pivot 90° on the correct axis, then
 * reparents the cubelets back with their position/orientation snapped to
 * the nearest exact grid value to prevent float drift across many moves.
 */
export default function HeroRubikCube({ logoSrc }: HeroRubikCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !logoSrc) return;

    let disposed = false;
    let rafId = 0;
    let renderer: WebGLRenderer | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const cleanupFns: Array<() => void> = [];
    const reduced = prefersReducedMotion();

    // Visibility gating: the render loop only runs while the cube is both
    // scrolled into view and the tab is active. This never changes how the
    // cube looks while it IS visible — it only stops paying real per-frame
    // GPU/CPU cost for a scene nobody can currently see. Starts optimistic
    // (true) since the Hero is virtually always the first thing on screen,
    // so nothing is skipped before the IntersectionObserver's first callback
    // arrives a moment after mount.
    let inViewport = true;
    let tabVisible = !document.hidden;
    let resumeTick: (() => void) | null = null;

    function isVisible() {
      return inViewport && tabVisible;
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        if (isVisible()) resumeTick?.();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);
    cleanupFns.push(() => intersectionObserver.disconnect());

    function handleVisibilityChange() {
      tabVisible = !document.hidden;
      if (isVisible()) resumeTick?.();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    cleanupFns.push(() => document.removeEventListener("visibilitychange", handleVisibilityChange));

    const img = new Image();
    // logoSrc is an unencoded path straight from the filesystem (may
    // contain spaces, e.g. "Logo for home hero section.png") — next/image
    // normally handles that encoding, but a plain Image element needs it
    // done explicitly here since this isn't going through next/image.
    img.src = logoSrc.split("/").map(encodeURIComponent).join("/");
    img.onload = () => {
      if (disposed) return;
      setup(img);
    };

    function setup(img: HTMLImageElement) {
      const scene = new Scene();
      // Closer + wider than before: a narrower FOV at a longer distance
      // reads as a flat, distant "product shot"; this is closer and wider
      // for the strong-perspective, near-camera, cinematic feel the brief
      // asks for (visible size difference between the cube's near and far
      // corners), while still keeping every corner inside the frustum
      // across the full rotation range (verified against the actual
      // rotating geometry, not just a static estimate).
      const camera = new PerspectiveCamera(52, 1, 0.1, 100);
      camera.position.set(3.95, 3.02, 5.35);
      camera.lookAt(0, 0, 0);

      renderer = new WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container!.appendChild(renderer.domElement);
      renderer.domElement.style.touchAction = "pan-y";
      renderer.domElement.style.display = "block";
      // Rendered deliberately larger than the layout container and centered
      // over it (see OVERSCAN below) — so the cube has visible room to swing
      // toward the frame edges during rotation without ever looking like
      // it's clipped by a card/box boundary. The container itself stays the
      // grid's actual layout slot; this canvas is free to visually spill
      // past it.
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.left = "50%";
      renderer.domElement.style.top = "50%";
      renderer.domElement.style.width = `${OVERSCAN * 100}%`;
      renderer.domElement.style.height = `${OVERSCAN * 100}%`;
      renderer.domElement.style.transform = "translate(-50%, -50%)";

      // Studio-style rig: brighter ambient/key/fill than a purely moody
      // scene would use (a dark cube on a dark background needs deliberate
      // light to read at all), plus a rim light from behind to trace the
      // cube's edges against the background and a soft hemisphere fill for
      // gentle top-to-bottom falloff — all still additive/subtractive on
      // existing dark materials, not colored/neon.
      scene.add(new AmbientLight(0xffffff, 0.75));
      scene.add(new HemisphereLight(0xffffff, 0x1a1a1a, 0.5));
      const key = new DirectionalLight(0xffffff, 1.7);
      key.position.set(4, 6, 5);
      scene.add(key);
      const fill = new DirectionalLight(0xd8d3c8, 0.55);
      fill.position.set(-4, -2, -3);
      scene.add(fill);
      const rim = new DirectionalLight(0xf4f1ea, 0.9);
      rim.position.set(-2, 3, -6);
      scene.add(rim);

      const orbit = new Group();
      const cubeGroup = new Group();
      orbit.add(cubeGroup);
      scene.add(orbit);

      // Initial resting tilt so the cube reads as 3D immediately, before any
      // interaction or auto-rotation.
      orbit.rotation.x = -0.32;
      orbit.rotation.y = 0.55;

      const stickerTextures = new Map<string, CanvasTexture>();
      function textureFor(row: number, col: number): Texture {
        const key = `${row}:${col}`;
        let tex = stickerTextures.get(key);
        if (!tex) {
          tex = new CanvasTexture(buildStickerCanvas(img, row, col));
          tex.colorSpace = SRGBColorSpace;
          stickerTextures.set(key, tex);
        }
        return tex;
      }

      function logoFaceMaterial(row: number, col: number): MeshStandardMaterial {
        return new MeshStandardMaterial({
          map: textureFor(row, col),
          metalness: 0.4,
          roughness: 0.22,
          emissive: 0x0a0a0a,
          emissiveIntensity: 0.4,
        });
      }

      const cubelets: Cubelet[] = [];
      const geometry = new BoxGeometry(CUBELET_SIZE, CUBELET_SIZE, CUBELET_SIZE);

      for (const gx of LAYERS) {
        for (const gy of LAYERS) {
          for (const gz of LAYERS) {
            // Materials in BoxGeometry face order: +x, -x, +y, -y, +z, -z.
            const materials = [darkMaterial(), darkMaterial(), darkMaterial(), darkMaterial(), darkMaterial(), darkMaterial()];
            // Every cubelet face that sits on the cube's exterior gets a
            // slice of the mark, using that face's own two in-plane grid
            // coordinates as (row, col) — so all 6 faces carry the same
            // 3x3 mark composition, not just the front. Interior-facing
            // sides (any cubelet face touching a neighboring cubelet, i.e.
            // every side that ISN'T at the ±1 boundary) stay plain dark,
            // same as before.
            if (gx === 1) materials[0] = logoFaceMaterial(1 - gy, 1 - gz);
            if (gx === -1) materials[1] = logoFaceMaterial(1 - gy, gz + 1);
            if (gy === 1) materials[2] = logoFaceMaterial(1 - gz, gx + 1);
            if (gy === -1) materials[3] = logoFaceMaterial(gz + 1, gx + 1);
            if (gz === 1) materials[4] = logoFaceMaterial(1 - gy, gx + 1);
            if (gz === -1) materials[5] = logoFaceMaterial(1 - gy, 1 - gx);

            const mesh = new Mesh(geometry, materials);
            mesh.position.set(gx * SPACING, gy * SPACING, gz * SPACING);
            cubeGroup.add(mesh);
            cubelets.push({ mesh });
          }
        }
      }

      // ---- Sizing (ResizeObserver, not per-frame) ----
      function resize() {
        const rect = container!.getBoundingClientRect();
        const w = Math.max(1, rect.width * OVERSCAN);
        const h = Math.max(1, rect.height * OVERSCAN);
        renderer!.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container!);
      resize();
      cleanupFns.push(() => resizeObserver.disconnect());

      // ---- Move engine ----
      function performMove(move: Move): Promise<void> {
        return new Promise((resolve) => {
          const selected = cubelets.filter(
            (c) => Math.round(c.mesh.position[move.axis] / SPACING) === move.layer
          );
          const pivot = new Group();
          cubeGroup.add(pivot);
          selected.forEach((c) => pivot.attach(c.mesh));

          const target: Record<string, number> = {};
          target[move.axis] = move.dir * (Math.PI / 2);

          gsap.to(pivot.rotation, {
            ...target,
            duration: 0.42,
            ease: "power2.inOut",
            onComplete: () => {
              selected.forEach((c) => {
                cubeGroup.attach(c.mesh);
                snapOrientation(c.mesh);
              });
              cubeGroup.remove(pivot);
              resolve();
            },
          });
        });
      }

      function randomMove(exclude?: Move): Move {
        let move: Move;
        do {
          const axis = AXES[Math.floor(Math.random() * 3)];
          const layer = LAYERS[Math.floor(Math.random() * 3)];
          const dir = Math.random() < 0.5 ? 1 : -1;
          move = { axis, layer, dir: dir as 1 | -1 };
        } while (exclude && move.axis === exclude.axis && move.layer === exclude.layer);
        return move;
      }

      async function scrambleAndSolve() {
        if (disposed) return;
        const scrambleLength = 12;
        const moves: Move[] = [];
        let last: Move | undefined;
        for (let i = 0; i < scrambleLength; i++) {
          const move = randomMove(last);
          moves.push(move);
          last = move;
        }
        for (const move of moves) {
          if (disposed) return;
          await performMove(move);
        }
        for (let i = moves.length - 1; i >= 0; i--) {
          if (disposed) return;
          const m = moves[i];
          await performMove({ axis: m.axis, layer: m.layer, dir: (m.dir * -1) as 1 | -1 });
        }
        if (!disposed) scheduleIdleRescramble();
      }

      function scheduleIdleRescramble() {
        if (reduced) return;
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (!disposed && !isDragging) scrambleAndSolve();
        }, 15000);
      }
      cleanupFns.push(() => {
        if (idleTimer) clearTimeout(idleTimer);
      });

      // ---- Drag interaction ----
      let isDragging = false;
      let dragPointerType = "mouse";
      let lastX = 0;
      let lastY = 0;
      let velocityX = 0;
      let velocityY = 0;
      let autoIdleSpin = !reduced;

      function onPointerDown(e: PointerEvent) {
        isDragging = true;
        dragPointerType = e.pointerType;
        lastX = e.clientX;
        lastY = e.clientY;
        velocityX = 0;
        velocityY = 0;
        autoIdleSpin = false;
        if (idleTimer) clearTimeout(idleTimer);
        renderer!.domElement.setPointerCapture(e.pointerId);
      }
      function onPointerMove(e: PointerEvent) {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        const sensitivity = 0.008;
        orbit.rotation.y += dx * sensitivity;
        velocityX = dx * sensitivity;
        // Touch: horizontal-only rotation, so vertical drags remain page
        // scroll (native, via touch-action: pan-y — this handler never
        // calls preventDefault, so the browser's own vertical pan proceeds
        // unimpeded regardless of what we do with dy here).
        if (dragPointerType === "mouse") {
          orbit.rotation.x = MathUtils.clamp(orbit.rotation.x + dy * sensitivity, -1.1, 1.1);
          velocityY = dy * sensitivity;
        }
      }
      function onPointerUp() {
        isDragging = false;
        idleSettleTimeout();
      }
      function idleSettleTimeout() {
        if (reduced) return;
        // Let momentum decay, then resume idle auto-rotate + the periodic
        // re-scramble timer.
        setTimeout(() => {
          if (!isDragging) {
            autoIdleSpin = true;
            scheduleIdleRescramble();
          }
        }, 600);
      }

      const el = renderer.domElement;
      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerup", onPointerUp);
      el.addEventListener("pointercancel", onPointerUp);
      cleanupFns.push(() => {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", onPointerUp);
        el.removeEventListener("pointercancel", onPointerUp);
      });

      // ---- Render loop ----
      function tick() {
        if (disposed) return;
        // Off-screen or tab backgrounded: stop rendering and stop
        // rescheduling — the loop simply halts here (rafId reset to 0) until
        // resumeTick() restarts it from whichever visibility handler fires
        // next. Never more than one requestAnimationFrame in flight at once.
        if (!isVisible()) {
          rafId = 0;
          return;
        }
        if (!isDragging) {
          // Inertia decay.
          if (Math.abs(velocityX) > 0.0002 || Math.abs(velocityY) > 0.0002) {
            orbit.rotation.y += velocityX;
            orbit.rotation.x = MathUtils.clamp(orbit.rotation.x + velocityY, -1.1, 1.1);
            velocityX *= 0.94;
            velocityY *= 0.94;
          } else if (autoIdleSpin) {
            orbit.rotation.y += 0.0016;
          }
        }
        renderer!.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      }

      resumeTick = () => {
        if (!disposed && rafId === 0) {
          rafId = requestAnimationFrame(tick);
        }
      };

      // The render loop always runs while visible — reduced motion still
      // needs it to reflect user-initiated drag/inertia, it just never
      // starts the automatic scramble/solve/idle-spin cycle (gated above via
      // `reduced`).
      tick();
      if (!reduced) scrambleAndSolve();

      cleanupFns.push(() => {
        geometry.dispose();
        cubelets.forEach((c) => {
          (Array.isArray(c.mesh.material) ? c.mesh.material : [c.mesh.material]).forEach((m) => m.dispose());
        });
        stickerTextures.forEach((t) => t.dispose());
        renderer!.dispose();
        container!.removeChild(renderer!.domElement);
      });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanupFns.forEach((fn) => fn());
    };
  }, [logoSrc]);

  if (!logoSrc) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="relative mx-auto aspect-square overflow-visible w-[300px] md:w-[460px] lg:w-[540px]"
      style={{
        // Very soft halo separating the cube from the Hero background —
        // decorative only (behind the canvas, doesn't affect layout/size).
        background: "radial-gradient(circle at 50% 50%, rgba(216,211,200,0.1), transparent 68%)",
      }}
    />
  );
}
