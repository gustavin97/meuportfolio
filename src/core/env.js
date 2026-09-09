/**
 * ==========================================
 * ENV.JS — CAPACIDADES DO AMBIENTE
 * ==========================================
 * Decide, uma única vez, o quanto de experiência pesada
 * este dispositivo aguenta. Todo módulo consulta daqui
 * em vez de checar navigator/matchMedia por conta própria.
 * ==========================================
 */

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointerQuery = window.matchMedia('(pointer: coarse)');

/** WebGL2 disponível? Cria e descarta um contexto de teste. */
function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    // Libera imediatamente: contextos WebGL são recurso escasso.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Classifica o dispositivo em 'high' | 'medium' | 'low'.
 * Usado para dimensionar contagem de partículas e pixel ratio.
 */
function detectTier() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const isCoarse = coarsePointerQuery.matches;
  const isNarrow = window.innerWidth < 768;

  if (isCoarse || isNarrow || cores <= 4 || memory <= 4) {
    return cores <= 2 || memory <= 2 ? 'low' : 'medium';
  }
  return 'high';
}

export const env = {
  hasWebGL: detectWebGL(),
  tier: detectTier(),
  isTouch: coarsePointerQuery.matches,
  get prefersReducedMotion() {
    return reducedMotionQuery.matches;
  },
  /** Pixel ratio limitado: 3x em telas retina grandes derruba o FPS sem ganho visível. */
  get pixelRatio() {
    const cap = this.tier === 'high' ? 2 : 1.5;
    return Math.min(window.devicePixelRatio || 1, cap);
  },
};

/**
 * Roda a experiência completa em 3D/animação?
 * Falso em dispositivo sem WebGL ou com movimento reduzido ativado.
 */
export const shouldRenderImmersive = () => env.hasWebGL && !env.prefersReducedMotion;

/** Observa mudanças na preferência de movimento em tempo real. */
export function onMotionPreferenceChange(callback) {
  reducedMotionQuery.addEventListener('change', (e) => callback(e.matches));
}
