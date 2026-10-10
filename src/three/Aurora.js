/**
 * ==========================================
 * AURORA.JS — CORTINAS DE LUZ NO FUNDO
 * ==========================================
 * Faixas largas e distantes que ondulam como aurora boreal.
 * Ficam bem atrás de tudo, com opacidade baixa: dão cor
 * e movimento ao "céu" da página sem disputar atenção.
 *
 * Cada faixa é um plano subdividido; o vertex shader dobra
 * o plano com ruído (onda lenta + dobra fina) e o fragment
 * desenha a cortina — forte na base, se dissolvendo para cima,
 * com estrias verticais.
 *
 * O capítulo atual desloca o tom: a aurora "acompanha" a
 * história, mais verde no começo e mais roxa no fim.
 * ==========================================
 */

import {
  AdditiveBlending,
  DoubleSide,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';

import { auroraFragmentShader, auroraVertexShader } from './shaders.js';

const RIBBONS = { high: 3, medium: 2, low: 0 };

/** Altura, profundidade, inclinação e semente de cada cortina. */
const LAYOUT = [
  { y: 4.5, z: -18, tilt: -0.08, seed: 1.3, colors: ['green', 'blue'] },
  { y: -1.5, z: -22, tilt: 0.06, seed: 4.7, colors: ['blue', 'purple'] },
  { y: 8, z: -26, tilt: 0.12, seed: 8.1, colors: ['purple', 'green'] },
];

export class Aurora {
  constructor({ tier, palette }) {
    this.group = new Group();
    this.materials = [];

    const count = RIBBONS[tier] ?? RIBBONS.medium;
    if (!count) return;

    this.geometry = new PlaneGeometry(70, 9, 220, 12);

    LAYOUT.slice(0, count).forEach((ribbon) => {
      const material = new ShaderMaterial({
        vertexShader: auroraVertexShader,
        fragmentShader: auroraFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: ribbon.seed },
          uOpacity: { value: 0 },
          uShift: { value: 0 },
          uColorA: { value: palette[ribbon.colors[0]].clone() },
          uColorB: { value: palette[ribbon.colors[1]].clone() },
          uColorC: { value: palette.purple.clone() },
        },
      });

      const mesh = new Mesh(this.geometry, material);
      mesh.position.set(0, ribbon.y, ribbon.z);
      mesh.rotation.z = ribbon.tilt;
      mesh.frustumCulled = false;
      this.group.add(mesh);
      this.materials.push(material);
    });
  }

  /**
   * @param {number} elapsed segundos desde o início
   * @param {number} opacity visibilidade global
   * @param {number} chapter 0..1 progresso na narrativa (desloca o tom)
   * @param {number} velocity 0..1 scroll rápido acende a aurora
   */
  update(elapsed, opacity, chapter, velocity) {
    this.materials.forEach((material) => {
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uOpacity.value = opacity * (0.55 + velocity * 0.6);
      material.uniforms.uShift.value = chapter;
    });
  }
}
