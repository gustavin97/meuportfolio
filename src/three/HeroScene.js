/**
 * ==========================================
 * HEROSCENE.JS — CENA 3D DO HERO
 * ==========================================
 * Núcleo orgânico deformado por ruído + casca wireframe
 * contrarrotativa + campo de partículas com parallax de mouse
 * e mergulho guiado por scroll.
 *
 * A cena NÃO tem loop próprio: `update()` é chamado pelo ticker
 * central (GSAP) em src/core/app.js, para existir um único
 * requestAnimationFrame na página inteira.
 *
 * Uso:
 *   const scene = new HeroScene(container);
 *   scene.update(delta, elapsed);
 *   scene.setScrollProgress(0..1);
 *   scene.dispose();
 * ==========================================
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WireframeGeometry,
  WebGLRenderer,
} from 'three';

import { env } from '../core/env.js';
import {
  coreFragmentShader,
  coreVertexShader,
  particlesFragmentShader,
  particlesVertexShader,
} from './shaders.js';

/** Orçamento visual por classe de dispositivo. */
const TIER_SETTINGS = {
  high: { particles: 2600, coreDetail: 48, wireDetail: 2 },
  medium: { particles: 1200, coreDetail: 32, wireDetail: 1 },
  low: { particles: 500, coreDetail: 16, wireDetail: 1 },
};

const PALETTE = {
  green: new Color('#00FF88'),
  blue: new Color('#00BFFF'),
  purple: new Color('#8A2BE2'),
};

export class HeroScene {
  constructor(container) {
    this.container = container;
    this.settings = TIER_SETTINGS[env.tier] ?? TIER_SETTINGS.medium;

    this.scrollProgress = 0;
    this.isVisible = true;
    this.isDisposed = false;

    // Alvo do mouse vs. valor suavizado — a diferença é o que dá a inércia.
    this.pointer = { x: 0, y: 0 };
    this.pointerTarget = { x: 0, y: 0 };

    this._initRenderer();
    this._initCamera();
    this._initCore();
    this._initWireframe();
    this._initParticles();
    this._bindEvents();
  }

  /* ==================== SETUP ==================== */

  _initRenderer() {
    this.renderer = new WebGLRenderer({
      antialias: env.tier === 'high',
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(env.pixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.classList.add('hero-canvas');
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.renderer.domElement);

    this.scene = new Scene();
  }

  _initCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new PerspectiveCamera(50, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 10);
    this.cameraBaseZ = 10;
  }

  _initCore() {
    const geometry = new IcosahedronGeometry(2.4, this.settings.coreDetail);

    this.coreMaterial = new ShaderMaterial({
      vertexShader: coreVertexShader,
      fragmentShader: coreFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uDistortion: { value: 0.55 },
        uScroll: { value: 0 },
        uOpacity: { value: 0 }, // sobe na animação de entrada
        uColorA: { value: PALETTE.green.clone() },
        uColorB: { value: PALETTE.blue.clone() },
        uColorC: { value: PALETTE.purple.clone() },
      },
    });

    this.core = new Mesh(geometry, this.coreMaterial);
    this.scene.add(this.core);
  }

  _initWireframe() {
    // Casca externa: dá leitura de "objeto" para o núcleo difuso.
    const base = new IcosahedronGeometry(3.5, this.settings.wireDetail);
    const geometry = new WireframeGeometry(base);
    base.dispose();

    this.wireMaterial = new LineBasicMaterial({
      color: PALETTE.blue.clone(),
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    this.wireframe = new LineSegments(geometry, this.wireMaterial);
    this.scene.add(this.wireframe);
  }

  _initParticles() {
    const count = this.settings.particles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    const colorKeys = Object.values(PALETTE);

    for (let i = 0; i < count; i += 1) {
      // Distribuição em casca esférica: mantém o centro livre para o núcleo.
      const radius = 5 + Math.random() * 13;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = 0.4 + Math.random() * 1.6;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
    geometry.setAttribute('aSpeed', new BufferAttribute(speeds, 1));

    this.particlesMaterial = new ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2.6 },
        uPixelRatio: { value: env.pixelRatio },
        uMouse: { value: { x: 0, y: 0 } },
        uScroll: { value: 0 },
      },
    });

    this.particles = new Points(geometry, this.particlesMaterial);
    this.scene.add(this.particles);
  }

  _bindEvents() {
    this._onPointerMove = (event) => {
      const rect = this.container.getBoundingClientRect();
      // Normaliza para -1..1 com origem no centro do container.
      this.pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    this._onPointerLeave = () => {
      this.pointerTarget.x = 0;
      this.pointerTarget.y = 0;
    };

    // Em touch o parallax de mouse não existe; poupa listeners.
    if (!env.isTouch) {
      window.addEventListener('pointermove', this._onPointerMove, { passive: true });
      this.container.addEventListener('pointerleave', this._onPointerLeave);
    }

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    // Não renderiza o que ninguém está vendo.
    this._observer = new IntersectionObserver(
      ([entry]) => {
        this.isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    this._observer.observe(this.container);

    // Perda de contexto WebGL (troca de GPU, aba suspensa) não deve quebrar a página.
    this._onContextLost = (event) => {
      event.preventDefault();
      this.isVisible = false;
    };
    this._onContextRestored = () => {
      this.isVisible = true;
    };
    this.renderer.domElement.addEventListener('webglcontextlost', this._onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this._onContextRestored);
  }

  /* ==================== API PÚBLICA ==================== */

  /** Progresso do scroll dentro do hero, de 0 (topo) a 1 (saindo). */
  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  /** Opacidade global da cena — usada pelo GSAP na entrada. */
  setOpacity(value) {
    if (this.isDisposed) return;
    this.coreMaterial.uniforms.uOpacity.value = value;
    this.wireMaterial.opacity = value * 0.22;
  }

  /**
   * Avança um frame. Chamado pelo ticker central.
   * @param {number} delta segundos desde o último frame
   * @param {number} elapsed segundos desde o início
   */
  update(delta, elapsed) {
    if (this.isDisposed || !this.isVisible) return;

    // Damping exponencial independente de framerate.
    const damping = 1 - Math.exp(-6 * delta);
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * damping;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * damping;

    this.coreMaterial.uniforms.uTime.value = elapsed;
    this.coreMaterial.uniforms.uScroll.value = this.scrollProgress;

    this.particlesMaterial.uniforms.uTime.value = elapsed;
    this.particlesMaterial.uniforms.uMouse.value.x = this.pointer.x;
    this.particlesMaterial.uniforms.uMouse.value.y = this.pointer.y;
    this.particlesMaterial.uniforms.uScroll.value = this.scrollProgress;

    // Núcleo e casca giram em sentidos opostos: cria profundidade sem pós-processamento.
    this.core.rotation.y += delta * 0.12;
    this.core.rotation.x = this.pointer.y * 0.25;
    this.core.rotation.z = this.pointer.x * 0.12;

    this.wireframe.rotation.y -= delta * 0.07;
    this.wireframe.rotation.x = this.pointer.y * -0.18;

    this.particles.rotation.y += delta * 0.015;

    // Câmera recua levemente e sobe conforme o scroll: sensação de afastar do objeto.
    this.camera.position.x += (this.pointer.x * 0.6 - this.camera.position.x) * damping;
    this.camera.position.y += (this.pointer.y * 0.4 - this.camera.position.y) * damping;
    this.camera.position.z = this.cameraBaseZ + this.scrollProgress * 4;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(env.pixelRatio);
    this.renderer.setSize(width, height);
    this.particlesMaterial.uniforms.uPixelRatio.value = env.pixelRatio;
  }

  /** Libera GPU e listeners. Chamado se a preferência de movimento mudar. */
  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;

    window.removeEventListener('resize', this._onResize);
    if (!env.isTouch) {
      window.removeEventListener('pointermove', this._onPointerMove);
      this.container.removeEventListener('pointerleave', this._onPointerLeave);
    }
    this.renderer.domElement.removeEventListener('webglcontextlost', this._onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored);
    this._observer?.disconnect();

    this.scene.traverse((object) => {
      object.geometry?.dispose();
      object.material?.dispose();
    });

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
