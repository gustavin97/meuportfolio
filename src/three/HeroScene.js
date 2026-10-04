/**
 * ==========================================
 * HEROSCENE.JS — CENA 3D DA PÁGINA
 * ==========================================
 * Nasceu como a cena do hero e virou o "mundo" da página:
 * o canvas é fixo atrás de todas as seções.
 *
 *  - Hero: núcleo orgânico deformado por ruído + casca wireframe
 *    contrarrotativa + halo, com parallax de mouse.
 *  - Campo de partículas: poeira que acompanha o site inteiro.
 *  - MorphField: ao sair do hero o núcleo se dissolve numa nuvem
 *    que assume uma forma por seção (ver three/MorphField.js).
 *
 * A cena NÃO tem loop próprio: `update()` é chamado pelo ticker
 * central (GSAP) em src/core/app.js, para existir um único
 * requestAnimationFrame na página inteira.
 *
 * Uso:
 *   const scene = new HeroScene(container);
 *   scene.update(delta, elapsed);
 *   scene.setScrollProgress(0..1);   // progresso dentro do hero
 *   scene.setMorphTarget(0..7);      // capítulo atual (contínuo)
 *   scene.dispose();
 * ==========================================
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
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
import { CHAPTERS, MorphField } from './MorphField.js';

/** Orçamento visual por classe de dispositivo. */
const TIER_SETTINGS = {
  high: { particles: 2600, field: 3400, coreDetail: 48, wireDetail: 2 },
  medium: { particles: 1200, field: 1500, coreDetail: 32, wireDetail: 1 },
  low: { particles: 500, field: 600, coreDetail: 16, wireDetail: 1 },
};

const PALETTE = {
  green: new Color('#00FF88'),
  blue: new Color('#00BFFF'),
  purple: new Color('#8A2BE2'),
};

export class HeroScene {
  constructor(container, { anchor = null } = {}) {
    // container: camada fixa do tamanho da viewport (o canvas).
    // anchor: elemento que dita ONDE a esfera fica no topo da página.
    this.container = container;
    this.anchor = anchor ?? container;
    this.settings = TIER_SETTINGS[env.tier] ?? TIER_SETTINGS.medium;

    this.scrollProgress = 0;
    this.introOpacity = 0;
    // Alvo vindo do scroll vs. valor suavizado, como no mouse.
    this.morphTarget = 0;
    this.morphValue = 0;
    this.isVisible = true;
    this.isDisposed = false;

    // Alvo do mouse vs. valor suavizado — a diferença é o que dá a inércia.
    this.pointer = { x: 0, y: 0 };
    this.pointerTarget = { x: 0, y: 0 };

    this._initRenderer();
    this._initCamera();
    // Núcleo, casca e halo vivem num grupo que é reposicionado no resize.
    this.coreGroup = new Group();
    this.scene.add(this.coreGroup);

    this._initCore();
    this._initWireframe();
    this._initParticles();
    this._initField();
    this._initMorph();
    this._bindEvents();
    this._positionCoreGroup();
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
    this.coreGroup.add(this.core);
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
    this.coreGroup.add(this.wireframe);
  }

  _initParticles() {
    const count = this.settings.particles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    const colorKeys = Object.values(PALETTE);

    for (let i = 0; i < count; i += 1) {
      // Halo da esfera: casca esférica que mantém o centro livre para o núcleo.
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
        uOpacity: { value: 1 },
      },
    });

    this.particles = new Points(geometry, this.particlesMaterial);
    this.coreGroup.add(this.particles);
  }

  /**
   * Campo de partículas do hero inteiro.
   * Ao contrário do halo, não orbita a esfera: preenche uma caixa larga
   * o bastante para cobrir o frustum em qualquer aspecto, então o hero
   * fica com micropartículas de ponta a ponta, inclusive atrás do texto.
   */
  _initField() {
    const count = this.settings.field;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    const colorKeys = Object.values(PALETTE);

    for (let i = 0; i < count; i += 1) {
      // X generoso cobre até ultrawide; Z em camadas dá o parallax de profundidade.
      positions[i * 3] = (Math.random() * 2 - 1) * 26;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 13;
      positions[i * 3 + 2] = -16 + Math.random() * 22;

      const color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Menores que as do halo: viram poeira de fundo, não competem com a esfera.
      scales[i] = 0.25 + Math.random() * 0.95;
      speeds[i] = 0.3 + Math.random() * 1.1;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
    geometry.setAttribute('aSpeed', new BufferAttribute(speeds, 1));

    this.fieldMaterial = new ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2.2 },
        uPixelRatio: { value: env.pixelRatio },
        uMouse: { value: { x: 0, y: 0 } },
        uScroll: { value: 0 },
        uOpacity: { value: 1 },
      },
    });

    this.field = new Points(geometry, this.fieldMaterial);
    this.scene.add(this.field);
  }

  /** Nuvem que vira as formas de cada capítulo. */
  _initMorph() {
    this.morph = new MorphField({
      tier: env.tier,
      palette: PALETTE,
      pixelRatio: env.pixelRatio,
    });
    this.scene.add(this.morph.group);
  }

  /** Tamanho do plano z=0 visto de uma distância — converte NDC em unidades de mundo. */
  _visibleSize(distance) {
    const height = 2 * distance * Math.tan((this.camera.fov * Math.PI) / 360);
    return { width: height * this.camera.aspect, height };
  }

  /**
   * Move o grupo da esfera para o centro do elemento âncora.
   * O canvas cobre a viewport toda, então sem isso a esfera cairia no
   * meio da tela, por cima do texto.
   *
   * O canvas é fixo: a posição é calculada como se a página estivesse
   * no topo (scrollY somado), e a esfera fica parada enquanto o texto
   * do hero sobe — é ela que se desfaz nas formas seguintes.
   */
  _positionCoreGroup() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    const anchorRect = this.anchor.getBoundingClientRect();
    const top = anchorRect.top + window.scrollY;
    // Centro da âncora em coordenadas normalizadas do canvas (-1..1).
    const ndcX = ((anchorRect.left + anchorRect.width / 2) / width) * 2 - 1;
    const ndcY = -(((top + anchorRect.height / 2) / height) * 2 - 1);

    const hero = this._visibleSize(this.cameraBaseZ);
    this.coreGroup.position.set((ndcX * hero.width) / 2, (ndcY * hero.height) / 2, 0);

    // As formas aparecem com a câmera já recuada (fim do hero).
    const world = this._visibleSize(this.cameraBaseZ + 4);
    this.morph.layout({
      heroPosition: this.coreGroup.position,
      halfWidth: world.width / 2,
      halfHeight: world.height / 2,
      isWide: width >= 1024,
    });
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
    // O canvas tem pointer-events: none, então a saída é medida no documento.
    if (!env.isTouch) {
      window.addEventListener('pointermove', this._onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', this._onPointerLeave);
    }

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

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

  /** Posição no roteiro de formas: 0 = hero, 1 = Sobre ... (contínuo). */
  setMorphTarget(value) {
    this.morphTarget = value;
  }

  /** Seções do roteiro, na ordem — para quem liga o scroll à cena. */
  get chapters() {
    return CHAPTERS.map((chapter) => chapter.section);
  }

  /** Opacidade global da cena — usada pelo GSAP na entrada. */
  setOpacity(value) {
    this.introOpacity = value;
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

    // Mais lento que o mouse: a troca de forma tem que ser vista, não pulada.
    this.morphValue += (this.morphTarget - this.morphValue) * (1 - Math.exp(-3.2 * delta));

    // Núcleo e casca se apagam enquanto a nuvem assume; o halo vira resto de poeira.
    const coreFade = 1 - Math.min(Math.max(this.morphValue / 0.5, 0), 1);
    this.coreMaterial.uniforms.uOpacity.value = this.introOpacity * coreFade;
    this.wireMaterial.opacity = this.introOpacity * coreFade * 0.22;
    this.particlesMaterial.uniforms.uOpacity.value = 0.25 + coreFade * 0.75;
    this.core.visible = coreFade > 0;
    this.wireframe.visible = coreFade > 0;

    this.coreMaterial.uniforms.uTime.value = elapsed;
    this.coreMaterial.uniforms.uScroll.value = this.scrollProgress;

    this.particlesMaterial.uniforms.uTime.value = elapsed;
    this.particlesMaterial.uniforms.uMouse.value.x = this.pointer.x;
    this.particlesMaterial.uniforms.uMouse.value.y = this.pointer.y;
    this.particlesMaterial.uniforms.uScroll.value = this.scrollProgress;

    this.fieldMaterial.uniforms.uTime.value = elapsed;
    this.fieldMaterial.uniforms.uMouse.value.x = this.pointer.x;
    this.fieldMaterial.uniforms.uMouse.value.y = this.pointer.y;
    this.fieldMaterial.uniforms.uScroll.value = this.scrollProgress;

    // Núcleo e casca giram em sentidos opostos: cria profundidade sem pós-processamento.
    this.core.rotation.y += delta * 0.12;
    this.core.rotation.x = this.pointer.y * 0.25;
    this.core.rotation.z = this.pointer.x * 0.12;

    this.wireframe.rotation.y -= delta * 0.07;
    this.wireframe.rotation.x = this.pointer.y * -0.18;

    this.particles.rotation.y += delta * 0.015;

    this.morph.update(this.morphValue, elapsed, this.introOpacity);
    this.morph.group.rotation.y = this.pointer.x * 0.35;
    this.morph.group.rotation.x = this.pointer.y * -0.2;

    // Deriva lateral lenta: o campo atravessa o hero em vez de orbitar.
    this.field.position.x = Math.sin(elapsed * 0.04) * 1.4;
    this.field.rotation.z = Math.sin(elapsed * 0.03) * 0.03;

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
    this.fieldMaterial.uniforms.uPixelRatio.value = env.pixelRatio;
    this.morph.setPixelRatio(env.pixelRatio);

    this._positionCoreGroup();
  }

  /** Libera GPU e listeners. Chamado se a preferência de movimento mudar. */
  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;

    window.removeEventListener('resize', this._onResize);
    if (!env.isTouch) {
      window.removeEventListener('pointermove', this._onPointerMove);
      document.documentElement.removeEventListener('pointerleave', this._onPointerLeave);
    }
    this.renderer.domElement.removeEventListener('webglcontextlost', this._onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored);

    this.scene.traverse((object) => {
      object.geometry?.dispose();
      object.material?.dispose();
    });

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
