/**
 * ==========================================
 * GSAP.JS — REGISTRO CENTRAL DE PLUGINS
 * ==========================================
 * Um único lugar registra os plugins e define as curvas
 * de easing da casa. Todo módulo importa daqui em vez de
 * chamar registerPlugin por conta própria — registrar duas
 * vezes o mesmo plugin é fonte silenciosa de bug.
 *
 * A versão 3.15 do GSAP liberou todos os plugins antes pagos,
 * então Flip, DrawSVG, SplitText e ScrambleText estão em uso.
 * ==========================================
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin,
  Flip,
  Observer,
  DrawSVGPlugin,
  SplitText,
  ScrambleTextPlugin,
  CustomEase,
);

/* ==================== CONFIGURAÇÃO ==================== */

/*
  No mobile, mostrar/esconder a barra de URL muda a altura da viewport e
  dispara refresh do ScrollTrigger, o que faz as animações pularem no meio
  do scroll. ignoreMobileResize trata isso como o mesmo viewport.
*/
ScrollTrigger.config({ ignoreMobileResize: true });

/* ==================== CURVAS DA CASA ==================== */

/*
  Duas curvas usadas no site inteiro. Ter nome próprio evita
  o "cada animação com um ease diferente", que é o que faz um
  site parecer montado por partes.
*/

// Saída longa e macia: entradas de elemento, reveals.
CustomEase.create('guz', '0.16, 1, 0.3, 1');

// Entra rápido e freia forte: transições de estado, Flip.
CustomEase.create('guzInOut', '0.76, 0, 0.24, 1');

/** Durações padronizadas, para o ritmo ficar coerente. */
export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
  reveal: 1.4,
};

export {
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  Flip,
  Observer,
  DrawSVGPlugin,
  SplitText,
  ScrambleTextPlugin,
  CustomEase,
};
