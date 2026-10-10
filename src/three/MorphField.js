/**
 * ==========================================
 * MORPHFIELD.JS — PARTÍCULAS QUE CONTAM A HISTÓRIA
 * ==========================================
 * Uma nuvem de pontos que assume uma forma por capítulo
 * (ver CHAPTERS). O scroll entrega um valor contínuo:
 *   0 = forma do hero, 1 = forma do Sobre, 2.5 = metade
 *   do caminho entre Jornada e Formações, etc.
 *
 * A parte inteira escolhe o par de formas (aFrom → aTo),
 * a fração vira o uProgress do shader.
 * ==========================================
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Points,
  ShaderMaterial,
} from 'three';

import { morphFragmentShader, morphVertexShader } from './shaders.js';
import { atom, cube, globe, helix, layers, logo, paperPlane, sphere } from './shapes.js';

/**
 * Roteiro: seção da página → forma.
 *
 * Em tela larga, `x` e `y` posicionam a forma em frações da meia-tela
 * (-1..1, centro = 0, y positivo = para cima) e `scale` a dimensiona.
 * Os valores miram o espaço VAZIO de cada seção no momento em que a
 * forma termina de se montar (topo da seção perto do topo da tela):
 * ao lado do título, num canto livre do grid — nunca atrás de foto ou
 * card opaco, que a esconderiam.
 * `opacity` calibra quanto ela pode brilhar atrás do conteúdo.
 */
export const CHAPTERS = [
  { section: 'hero', build: sphere, x: 0, y: 0, scale: 1, opacity: 1 },
  // Canto superior direito, ao lado do título — abaixo dele fica a foto.
  { section: 'about', build: logo, x: 0.58, y: 0.48, scale: 0.6, opacity: 1 },
  // Atrás do trilho central da jornada.
  { section: 'timeline', build: helix, x: 0, y: 0, scale: 1, opacity: 0.6 },
  { section: 'formations', build: layers, x: 0.62, y: 0.5, scale: 0.55, opacity: 0.9 },
  { section: 'technologies', build: atom, x: 0.5, y: 0, scale: 1, opacity: 0.8 },
  // A última linha do grid de plataformas tem uma célula livre à direita.
  { section: 'platforms', build: globe, x: 0.6, y: -0.45, scale: 0.65, opacity: 0.85 },
  // Ao lado do título fixado: fica visível durante todo o carrossel.
  { section: 'projects', build: cube, x: 0.6, y: 0.48, scale: 0.6, opacity: 0.9 },
  { section: 'contact', build: paperPlane, x: 0.55, y: 0.08, scale: 0.9, opacity: 0.95 },
];

const PARTICLE_COUNT = { high: 6000, medium: 3200, low: 1500 };

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

export class MorphField {
  constructor({ tier, palette, pixelRatio, interaction }) {
    this.count = PARTICLE_COUNT[tier] ?? PARTICLE_COUNT.medium;
    // Formas são geradas sob demanda: o logo precisa de canvas 2D
    // e nenhuma delas é necessária antes do primeiro scroll.
    this.shapes = new Array(CHAPTERS.length).fill(null);
    this.pair = -1;
    this.value = 0;

    this.group = new Group();
    this.anchors = CHAPTERS.map(() => ({ x: 0, y: 0, scale: 1 }));

    const colors = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);
    const randoms = new Float32Array(this.count);
    const colorKeys = Object.values(palette);

    for (let i = 0; i < this.count; i += 1) {
      const color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      scales[i] = 0.5 + Math.random() * 1.1;
      randoms[i] = Math.random();
    }

    const geometry = new BufferGeometry();
    // `position` é exigido pelo Three para o bounding sphere; o shader usa aFrom/aTo.
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.count * 3), 3));
    geometry.setAttribute('aFrom', new BufferAttribute(new Float32Array(this.count * 3), 3));
    geometry.setAttribute('aTo', new BufferAttribute(new Float32Array(this.count * 3), 3));
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
    geometry.setAttribute('aRandom', new BufferAttribute(randoms, 1));

    this.material = new ShaderMaterial({
      vertexShader: morphVertexShader,
      fragmentShader: morphFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uSize: { value: 2.4 },
        uPixelRatio: { value: pixelRatio },
        uOpacity: { value: 0 },
        // Cursor e onda do clique: uniforms compartilhados com a HeroScene.
        ...interaction,
      },
    });

    this.points = new Points(geometry, this.material);
    // Os pontos se espalham além da forma na transição; o culling cortaria a nuvem.
    this.points.frustumCulled = false;
    this.group.add(this.points);
  }

  _shape(index) {
    this.shapes[index] ??= CHAPTERS[index].build(this.count);
    return this.shapes[index];
  }

  /** Carrega o par de formas [index → index + 1] nos atributos. */
  _loadPair(index) {
    if (index === this.pair) return;
    this.pair = index;

    const { aFrom, aTo } = this.points.geometry.attributes;
    aFrom.array.set(this._shape(index));
    aTo.array.set(this._shape(index + 1));
    aFrom.needsUpdate = true;
    aTo.needsUpdate = true;
  }

  /**
   * Onde cada forma fica na tela. Recebe a posição do núcleo do hero
   * (a esfera nasce exatamente onde ele está) e a meia-tela visível
   * em unidades de mundo.
   */
  layout({ heroPosition, halfWidth, halfHeight, isWide }) {
    this.anchors.forEach((anchor, index) => {
      if (index === 0) {
        anchor.x = heroPosition.x;
        anchor.y = heroPosition.y;
        anchor.scale = 1;
        return;
      }
      // Em tela estreita o conteúdo ocupa a largura toda: forma no centro e menor.
      const chapter = CHAPTERS[index];
      anchor.x = isWide ? chapter.x * halfWidth : 0;
      anchor.y = isWide ? chapter.y * halfHeight : 0;
      anchor.scale = isWide ? chapter.scale : 0.62;
    });
  }

  /**
   * @param {number} value posição contínua no roteiro (0..CHAPTERS.length-1)
   * @param {number} elapsed segundos desde o início
   * @param {number} intro opacidade de entrada da cena (0..1)
   */
  update(value, elapsed, intro) {
    const last = CHAPTERS.length - 1;
    this.value = Math.min(Math.max(value, 0), last);

    const index = Math.min(Math.floor(this.value), last - 1);
    const progress = this.value - index;
    this._loadPair(index);

    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uProgress.value = progress;

    // Posição e escala seguem a mesma curva da troca de forma.
    const eased = smoothstep(0, 1, progress);
    const from = this.anchors[index];
    const to = this.anchors[index + 1];
    this.group.position.x = from.x + (to.x - from.x) * eased;
    this.group.position.y = from.y + (to.y - from.y) * eased;
    this.group.scale.setScalar(from.scale + (to.scale - from.scale) * eased);

    // No hero quem aparece é o núcleo; a nuvem acende enquanto ele se desfaz.
    const chapterOpacity =
      CHAPTERS[index].opacity + (CHAPTERS[index + 1].opacity - CHAPTERS[index].opacity) * eased;
    this.material.uniforms.uOpacity.value =
      intro * smoothstep(0.05, 0.45, this.value) * chapterOpacity;

    // Balanço lento em vez de rotação completa: logo e avião não podem ficar de costas.
    this.points.rotation.y = Math.sin(elapsed * 0.25) * 0.45;
    this.points.rotation.x = Math.sin(elapsed * 0.18) * 0.12;
  }

  setPixelRatio(value) {
    this.material.uniforms.uPixelRatio.value = value;
  }
}
