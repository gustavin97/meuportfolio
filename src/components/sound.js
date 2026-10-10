/**
 * ==========================================
 * SOUND.JS — PAISAGEM SONORA SINTETIZADA
 * ==========================================
 * Trilha ambiente gerada em tempo real com Web Audio:
 * nenhum arquivo de áudio é baixado.
 *
 *  - Pad: acorde de osciladores levemente desafinados
 *    passando por um filtro passa-baixa que "respira"
 *    (LFO lento). O scroll abre o filtro: rolar rápido
 *    deixa o som mais brilhante.
 *  - Ar: ruído filtrado bem baixo, dá espaço ao som.
 *  - Interface: um "blip" curto no hover de botões e links.
 *
 * Sempre começa DESLIGADO: som só com gesto explícito
 * (o botão), por respeito e por política de autoplay.
 * ==========================================
 */

import { gsap, ScrollTrigger } from '../core/gsap.js';

/** Lá menor com nona: aberto, nem triste nem alegre. */
const CHORD = [110, 164.81, 220, 261.63, 329.63];

let context = null;
let master = null;
let filter = null;
let enabled = false;

function createNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Monta o grafo de áudio uma vez, no primeiro clique. */
function buildGraph() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  context = new AudioContextClass();

  master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  // Pad
  filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  filter.Q.value = 6;
  filter.connect(master);

  // Respiração: o LFO move o corte do filtro devagar.
  const lfo = context.createOscillator();
  const lfoDepth = context.createGain();
  lfo.frequency.value = 0.07;
  lfoDepth.gain.value = 260;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  CHORD.forEach((frequency, index) => {
    [-6, 6].forEach((detune) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.value = frequency;
      osc.detune.value = detune + (Math.random() * 4 - 2);
      // Notas graves mais presentes, agudas só como brilho.
      gain.gain.value = 0.05 / (index + 1);
      osc.connect(gain).connect(filter);
      osc.start();
    });
  });

  // Ar
  const noise = context.createBufferSource();
  noise.buffer = createNoiseBuffer(context);
  noise.loop = true;
  const band = context.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 900;
  band.Q.value = 0.6;
  const noiseGain = context.createGain();
  noiseGain.gain.value = 0.018;
  noise.connect(band).connect(noiseGain).connect(master);
  noise.start();
}

/** Blip curto de interface. */
function blip(frequency = 880, duration = 0.08, volume = 0.05) {
  if (!enabled || !context) return;
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(context.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Som público para outros módulos (ex.: envio do formulário). */
export function playCue(type = 'blip') {
  if (type === 'launch') {
    blip(330, 0.5, 0.07);
    setTimeout(() => blip(660, 0.4, 0.05), 120);
    return;
  }
  blip();
}

function setEnabled(value, button) {
  enabled = value;
  if (value && !context) buildGraph();
  if (value) context.resume();

  const now = context.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  // Entra e sai em rampa: corte seco de áudio soa como defeito.
  master.gain.linearRampToValueAtTime(value ? 0.55 : 0, now + (value ? 2 : 0.6));

  button.setAttribute('aria-pressed', String(value));
  button.setAttribute('aria-label', value ? 'Desligar som ambiente' : 'Ligar som ambiente');
  button.classList.toggle('is-on', value);
}

export function initSound() {
  if (!(window.AudioContext || window.webkitAudioContext)) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sound-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Ligar som ambiente');
  button.innerHTML = `
    <span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="sound-label" aria-hidden="true">Som</span>
  `;
  document.body.appendChild(button);

  button.addEventListener('click', () => setEnabled(!enabled, button));

  // Blips nos elementos interativos principais.
  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest?.('[data-magnetic], .nav-link, .btn');
    if (target && !target.contains(event.relatedTarget)) blip(1200 + Math.random() * 300, 0.06, 0.025);
  });

  // Scroll rápido abre o filtro do pad.
  ScrollTrigger.create({
    onUpdate: (self) => {
      if (!enabled || !filter) return;
      const speed = Math.min(Math.abs(self.getVelocity()) / 3000, 1);
      filter.frequency.setTargetAtTime(600 + speed * 2200, context.currentTime, 0.15);
    },
  });
  ScrollTrigger.addEventListener('scrollEnd', () => {
    if (enabled && filter) filter.frequency.setTargetAtTime(600, context.currentTime, 0.8);
  });

  gsap.fromTo(button, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, delay: 1, ease: 'guz' });
}
