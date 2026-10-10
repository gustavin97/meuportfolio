/**
 * ==========================================
 * CRYSTALS.JS — POLIEDROS À DERIVA
 * ==========================================
 * Cristais facetados espalhados pelas laterais da página.
 * Eles atravessam a tela no sentido do scroll, cada um numa
 * profundidade: os de perto andam mais rápido que os de longe,
 * e é essa diferença de velocidade que dá volume ao "espaço"
 * atrás do conteúdo.
 *
 * Posição vertical em frações da tela, com wrap: quando um
 * cristal sai por cima, reaparece embaixo (com fade nas bordas
 * para o salto não ser visto). Assim poucos objetos bastam
 * para a página inteira.
 *
 * A velocidade do scroll também gira os cristais — a página
 * "empurra" o ar.
 * ==========================================
 */

import {
  AdditiveBlending,
  Color,
  DodecahedronGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  OctahedronGeometry,
  ShaderMaterial,
  TetrahedronGeometry,
  TorusKnotGeometry,
} from 'three';

import { crystalFragmentShader, crystalVertexShader } from './shaders.js';

const COUNT = { high: 10, medium: 6, low: 0 };

/** Geometrias reaproveitadas: cada cristal só muda escala e material. */
const FACTORIES = [
  () => new OctahedronGeometry(1, 0),
  () => new IcosahedronGeometry(1, 0),
  () => new TetrahedronGeometry(1.1, 0),
  () => new DodecahedronGeometry(0.95, 0),
  () => new TorusKnotGeometry(0.62, 0.17, 96, 10),
];

const TORUS_KNOT = 4;
const COLOR_PAIRS = [
  ['green', 'blue'],
  ['blue', 'purple'],
  ['purple', 'green'],
];

const random = (min, max) => min + Math.random() * (max - min);
const wrap = (value, min, max) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};
const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Limite vertical do wrap, em meias-telas. Passa de 1 para nascer fora da vista. */
const WRAP_LIMIT = 1.35;

export class Crystals {
  constructor({ tier, palette }) {
    this.group = new Group();
    this.items = [];
    this.geometries = FACTORIES.map((factory) => factory());
    this.edgeGeometries = this.geometries.map((geometry, index) =>
      // O torus knot é liso: as arestas virariam uma malha densa e suja.
      index === TORUS_KNOT ? null : new EdgesGeometry(geometry),
    );
    this.spin = 0; // giro extra acumulado pela velocidade de scroll

    const count = COUNT[tier] ?? COUNT.medium;

    for (let i = 0; i < count; i += 1) {
      const shape = i % FACTORIES.length;
      const [a, b] = COLOR_PAIRS[i % COLOR_PAIRS.length];

      const material = new ShaderMaterial({
        vertexShader: crystalVertexShader,
        fragmentShader: crystalFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        // As faces de trás aparecem pelo vidro: dá espessura ao cristal.
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uColorA: { value: new Color(palette[a]) },
          uColorB: { value: new Color(palette[b]) },
        },
      });

      const pivot = new Group();
      pivot.add(new Mesh(this.geometries[shape], material));

      let edgeMaterial = null;
      if (this.edgeGeometries[shape]) {
        edgeMaterial = new LineBasicMaterial({
          color: palette[a],
          transparent: true,
          opacity: 0,
          blending: AdditiveBlending,
          depthWrite: false,
        });
        pivot.add(new LineSegments(this.edgeGeometries[shape], edgeMaterial));
      }

      // Alterna os lados; nunca no centro, onde está o texto.
      const side = i % 2 === 0 ? 1 : -1;
      const z = random(-9, -1);
      const item = {
        pivot,
        material,
        edgeMaterial,
        x: side * random(0.78, 0.98),
        // Espalhados ao longo do ciclo do wrap para não chegarem juntos.
        y: -WRAP_LIMIT + ((i + Math.random() * 0.5) / count) * WRAP_LIMIT * 2,
        z,
        // Perto anda mais: é o parallax de profundidade.
        parallax: 0.55 + ((z + 9) / 8) * 0.9,
        scale: random(0.35, 0.7),
        axis: { x: random(-1, 1), y: random(0.4, 1), z: random(-0.5, 0.5) },
        rate: random(0.15, 0.4),
        bob: random(0, Math.PI * 2),
      };
      pivot.scale.setScalar(item.scale);
      this.items.push(item);
      this.group.add(pivot);
    }
  }

  /**
   * @param {number} delta segundos desde o último frame
   * @param {number} elapsed segundos desde o início
   * @param {object} state
   * @param {number} state.scroll scroll em telas (scrollY / innerHeight)
   * @param {number} state.velocity 0..1 velocidade de scroll suavizada
   * @param {number} state.opacity visibilidade global
   * @param {(distance:number)=>{width:number,height:number}} state.visibleSize
   * @param {number} state.cameraZ
   */
  update(delta, elapsed, { scroll, velocity, opacity, visibleSize, cameraZ }) {
    if (!this.items.length) return;
    this.spin += delta * velocity * 3.5;

    this.items.forEach((item) => {
      const view = visibleSize(cameraZ - item.z);
      const yFrac = wrap(item.y + scroll * item.parallax, -WRAP_LIMIT, WRAP_LIMIT);

      item.pivot.position.set(
        (item.x * view.width) / 2,
        (yFrac * view.height) / 2 + Math.sin(elapsed * 0.6 + item.bob) * 0.15,
        item.z,
      );

      const angle = elapsed * item.rate + this.spin;
      item.pivot.rotation.set(item.axis.x * angle, item.axis.y * angle, item.axis.z * angle);

      // Some perto das bordas do wrap e longe: o salto nunca é visto.
      const edgeFade = 1 - smoothstep(1.0, WRAP_LIMIT, Math.abs(yFrac));
      const depthFade = 0.45 + ((item.z + 9) / 8) * 0.55;
      const alpha = opacity * edgeFade * depthFade;

      item.material.uniforms.uTime.value = elapsed;
      item.material.uniforms.uOpacity.value = alpha;
      if (item.edgeMaterial) item.edgeMaterial.opacity = alpha * 0.25;
      item.pivot.visible = alpha > 0.002;
    });
  }

  dispose() {
    this.geometries.forEach((geometry) => geometry.dispose());
    this.edgeGeometries.forEach((geometry) => geometry?.dispose());
    this.items.forEach((item) => {
      item.material.dispose();
      item.edgeMaterial?.dispose();
    });
  }
}
