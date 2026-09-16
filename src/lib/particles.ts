// ─────────────────────────────────────────────────────────────
// particles — WebGL particle field (home hero background)
// ─────────────────────────────────────────────────────────────
// Port of React Bits `Particles` (https://reactbits.dev, DavidHDev/react-bits).
// The shaders, the sphere sampling, the drift and rotation math and the option
// names are upstream's. Only the React wrapper changed: the useRef/useEffect
// body became mountParticles(), which returns a controller. A React island
// would pull the React runtime into the hero's first viewport; on the home,
// React otherwise loads only when the contact form scrolls into view.
//
// Additions to upstream, each needed by the hero:
// - `hoverTarget`: the canvas sits behind the copy with pointer-events off, so
//   mousemove is read from the section (upstream listens on the container).
// - ResizeObserver instead of the window resize event: web fonts can change
//   the hero's height without the window resizing.
// - The loop pauses while the container is off-screen and resumes without a
//   time jump; the frame delta is clamped so a background tab doesn't jump
//   the field forward when it comes back.
// - `reducedMotion` / setReducedMotion(): one still frame, no loop.
// - No WebGL: mountParticles() returns null and the page stays as it was.
// - destroy() also disconnects the observers and releases the GL context.
//
// ⛔ Licence below: MIT + Commons Clause. Use this file inside this site only.
// Never extract it into a shared template or a standalone package.
//
// MIT + Commons Clause License Condition v1.0
//
// Copyright (c) 2026 David Haz
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, and distribute the Software **as part of
// an application, website, or product**, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// Commons Clause Restriction
//
// You may use this Software, including for any commercial purpose, **so long as
// you do not sell, sublicense, or redistribute the components themselves-whether
// alone, in a bundle, or as a ported version.**
//
// No Warranty
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";

export interface ParticlesOptions {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
  /** Element whose mousemove drives the parallax. Defaults to the container. */
  hoverTarget?: HTMLElement;
  /** Render one still frame instead of animating. */
  reducedMotion?: boolean;
}

export interface ParticlesController {
  /** true stops the animation (the canvas keeps its last frame); false resumes it. */
  setReducedMotion(reduce: boolean): void;
  destroy(): void;
}

const defaultColors: string[] = ["#ffffff", "#ffffff", "#ffffff"];

// Longest step (ms) a single frame may advance the field. rAF stops in a
// background tab, so the first frame back would otherwise cover the whole gap.
const MAX_FRAME_DELTA = 100;

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex.slice(0, 6), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;
    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

/**
 * Appends the particle canvas to `container` and starts it. Returns null
 * (and appends nothing) when the browser can't create a WebGL context.
 */
export function mountParticles(
  container: HTMLElement,
  {
    particleCount = 200,
    particleSpread = 10,
    speed = 0.1,
    particleColors,
    moveParticlesOnHover = false,
    particleHoverFactor = 1,
    alphaParticles = false,
    particleBaseSize = 100,
    sizeRandomness = 1,
    cameraDistance = 20,
    disableRotation = false,
    pixelRatio = 1,
    hoverTarget = container,
    reducedMotion = false,
  }: ParticlesOptions = {},
): ParticlesController | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      dpr: pixelRatio,
      depth: false,
      alpha: true,
    });
  } catch {
    // ogl logs "unable to create webgl context", then throws on the null context.
    return null;
  }
  const gl = renderer.gl;
  container.appendChild(gl.canvas);
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 15 });
  camera.position.set(0, 0, cameraDistance);

  let mouse = { x: 0, y: 0 };
  const handleMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouse = { x, y };
  };

  if (moveParticlesOnHover) {
    hoverTarget.addEventListener("mousemove", handleMouseMove);
  }

  const count = particleCount;
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);
  const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number, len: number;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      len = x * x + y * y + z * z;
    } while (len > 1 || len === 0);
    const r = Math.cbrt(Math.random());
    positions.set([x * r, y * r, z * r], i * 3);
    randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
    colors.set(col, i * 3);
  }

  const geometry = new Geometry(gl, {
    position: { size: 3, data: positions },
    random: { size: 4, data: randoms },
    color: { size: 3, data: colors },
  });

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uSpread: { value: particleSpread },
      uBaseSize: { value: particleBaseSize * pixelRatio },
      uSizeRandomness: { value: sizeRandomness },
      uAlphaParticles: { value: alphaParticles ? 1 : 0 },
    },
    transparent: true,
    depthTest: false,
  });

  const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

  // Sizing runs after the mesh exists (upstream sizes first) because resizing
  // clears the canvas: it redraws right away so no blank frame gets painted.
  let size = "";
  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (`${width}x${height}` === size) return;
    size = `${width}x${height}`;
    renderer.setSize(width, height);
    camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    renderer.render({ scene: particles, camera });
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let animationFrameId = 0;
  let running = false;
  let visible = true;
  let reduced = reducedMotion;
  let lastTime = performance.now();
  let elapsed = 0;

  const update = (t: number) => {
    const delta = Math.min(Math.max(t - lastTime, 0), MAX_FRAME_DELTA);
    lastTime = t;
    elapsed += delta * speed;

    program.uniforms.uTime.value = elapsed * 0.001;

    if (moveParticlesOnHover) {
      particles.position.x = -mouse.x * particleHoverFactor;
      particles.position.y = -mouse.y * particleHoverFactor;
    } else {
      particles.position.x = 0;
      particles.position.y = 0;
    }

    if (!disableRotation) {
      particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
      particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
      particles.rotation.z += 0.01 * speed;
    }

    renderer.render({ scene: particles, camera });
  };

  const frame = (t: number) => {
    animationFrameId = requestAnimationFrame(frame);
    update(t);
  };

  // The loop runs only while the canvas is on screen and motion is allowed.
  const sync = () => {
    const shouldRun = visible && !reduced;
    if (shouldRun === running) return;
    running = shouldRun;
    if (running) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  };

  const intersectionObserver = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    sync();
  });
  intersectionObserver.observe(container);

  if (reduced) update(performance.now());
  sync();

  return {
    setReducedMotion(reduce) {
      reduced = reduce;
      sync();
    },
    destroy() {
      visible = false;
      sync();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (moveParticlesOnHover) {
        hoverTarget.removeEventListener("mousemove", handleMouseMove);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    },
  };
}
