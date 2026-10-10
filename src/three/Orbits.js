/**
 * ==========================================
 * ORBITS.JS — ANÉIS ORBITAIS DO NÚCLEO
 * ==========================================
 * Três órbitas inclinadas em volta da esfera do hero.
 * Cada uma tem um traço fino (o anel) e um "cometa":
 * uma fila de pontos que percorre o anel deixando rastro.
 *
 * O JS só integra o ângulo da cabeça de cada cometa (uHead);
 * o shader posiciona o resto. Cada ponto sabe seu atraso no
 * rastro (aTrail, 0 = cabeça) — nenhum atributo é reescrito
 * por frame. O ângulo é integrado, e não `tempo × velocidade`,
 * para o boost do scroll acelerar sem o cometa dar salto.
 * ==========================================
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineLoop,
  Points,
  ShaderMaterial,
} from 'three';

import { orbitFragmentShader, orbitVertexShader } from './shaders.js';

/** Raio, inclinação (rad), velocidade (rad/s) e cor de cada órbita. */
const RINGS = [
  { radius: 3.15, tiltX: 1.2, tiltZ: 0.35, speed: 0.55, color: 'green' },
  { radius: 3.7, tiltX: -0.95, tiltZ: -0.6, speed: -0.38, color: 'blue' },
  { radius: 4.3, tiltX: 0.2, tiltZ: 1.15, speed: 0.26, color: 'purple' },
];

const TRAIL = { high: 90, medium: 60, low: 36 };
const RING_SEGMENTS = 160;

export class Orbits {
  constructor({ tier, palette, pixelRatio }) {
    this.group = new Group();
    this.materials = [];
    this.lineMaterials = [];
    // Cometas começam espalhados, não alinhados na largada.
    this.heads = RINGS.map((_, index) => index * 2.1);

    const trail = TRAIL[tier] ?? TRAIL.medium;

    RINGS.forEach((ring, index) => {
      const pivot = new Group();
      pivot.rotation.set(ring.tiltX, 0, ring.tiltZ);

      // Anel: círculo fechado, quase invisível — é guia, não protagonista.
      const circle = new Float32Array(RING_SEGMENTS * 3);
      for (let i = 0; i < RING_SEGMENTS; i += 1) {
        const angle = (i / RING_SEGMENTS) * Math.PI * 2;
        circle[i * 3] = Math.cos(angle) * ring.radius;
        circle[i * 3 + 1] = 0;
        circle[i * 3 + 2] = Math.sin(angle) * ring.radius;
      }
      const lineGeometry = new BufferGeometry();
      lineGeometry.setAttribute('position', new BufferAttribute(circle, 3));
      const lineMaterial = new LineBasicMaterial({
        color: palette[ring.color],
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      pivot.add(new LineLoop(lineGeometry, lineMaterial));
      this.lineMaterials.push(lineMaterial);

      // Cometa: `trail` pontos; o atributo diz a posição de cada um na fila.
      const trails = new Float32Array(trail);
      for (let i = 0; i < trail; i += 1) trails[i] = i / (trail - 1);

      const geometry = new BufferGeometry();
      // O shader posiciona; `position` existe só para o Three contar vértices.
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(trail * 3), 3));
      geometry.setAttribute('aTrail', new BufferAttribute(trails, 1));

      const material = new ShaderMaterial({
        vertexShader: orbitVertexShader,
        fragmentShader: orbitFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uRadius: { value: ring.radius },
          uHead: { value: this.heads[index] },
          uDirection: { value: Math.sign(ring.speed) },
          uLength: { value: 1.6 }, // comprimento do rastro, em radianos
          uBoost: { value: 0 },
          uSize: { value: 5.5 },
          uPixelRatio: { value: pixelRatio },
          uColor: { value: palette[ring.color].clone() },
          uOpacity: { value: 0 },
        },
      });

      const comet = new Points(geometry, material);
      comet.frustumCulled = false;
      pivot.add(comet);
      this.materials.push(material);

      this.group.add(pivot);
    });
  }

  /**
   * @param {number} delta segundos desde o último frame
   * @param {number} elapsed segundos desde o início
   * @param {number} opacity visibilidade (entrada × dissolução do núcleo)
   * @param {number} boost 0..1 — velocidade de scroll acelera os cometas
   */
  update(delta, elapsed, opacity, boost) {
    this.group.visible = opacity > 0.001;
    if (!this.group.visible) return;

    this.materials.forEach((material, index) => {
      this.heads[index] += delta * RINGS[index].speed * (1 + boost * 4);
      material.uniforms.uHead.value = this.heads[index];
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uOpacity.value = opacity;
      material.uniforms.uBoost.value = boost;
    });
    this.lineMaterials.forEach((material) => {
      material.opacity = opacity * 0.12;
    });

    // Precessão lenta: o conjunto de órbitas não fica num plano fixo.
    this.group.rotation.y = elapsed * 0.05;
  }

  setPixelRatio(value) {
    this.materials.forEach((material) => {
      material.uniforms.uPixelRatio.value = value;
    });
  }
}
