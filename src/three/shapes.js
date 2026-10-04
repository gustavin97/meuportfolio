/**
 * ==========================================
 * SHAPES.JS — FORMAS DA NARRATIVA 3D
 * ==========================================
 * Cada capítulo da página tem uma forma feita de partículas.
 * Todas as funções recebem a quantidade de pontos e devolvem
 * um Float32Array (x, y, z) com EXATAMENTE essa quantidade —
 * é o que permite interpolar qualquer forma em qualquer outra.
 *
 * Matemática pura, sem Three.js: barato de testar e de ler.
 * Escala de referência: cabem num raio de ~3 unidades.
 * ==========================================
 */

const TAU = Math.PI * 2;

/* ==================== UTILITÁRIOS ==================== */

const jitter = (amount) => (Math.random() * 2 - 1) * amount;

/** Gira todos os pontos em X e depois em Y — dá ângulo de leitura à forma. */
function tilt(points, rx = 0, ry = 0) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);

  for (let i = 0; i < points.length; i += 3) {
    const x = points[i];
    const y = points[i + 1] * cx - points[i + 2] * sx;
    const z = points[i + 1] * sx + points[i + 2] * cx;
    points[i] = x * cy + z * sy;
    points[i + 1] = y;
    points[i + 2] = -x * sy + z * cy;
  }
  return points;
}

/** Ponto uniforme sobre um triângulo (coordenadas baricêntricas com raiz). */
function pointInTriangle(a, b, c) {
  const r1 = Math.sqrt(Math.random());
  const r2 = Math.random();
  const wa = 1 - r1;
  const wb = r1 * (1 - r2);
  const wc = r1 * r2;
  return [0, 1, 2].map((k) => a[k] * wa + b[k] * wb + c[k] * wc);
}

const lerp3 = (a, b, t) => [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * t);

/* ==================== FORMAS ==================== */

/** Hero — mesma esfera do núcleo, para a troca ser invisível. */
export function sphere(count, radius = 2.4) {
  const points = new Float32Array(count * 3);
  // Espiral de Fibonacci: distribuição uniforme sem aglomerar nos polos.
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const angle = i * golden;
    const r = radius * (0.92 + Math.random() * 0.08);
    points[i * 3] = Math.cos(angle) * ring * r;
    points[i * 3 + 1] = y * r;
    points[i * 3 + 2] = Math.sin(angle) * ring * r;
  }
  return points;
}

/**
 * Sobre — a marca (o "D" com o ponto do favicon).
 * Desenha o mesmo path do favicon.svg num canvas 2D e amostra
 * os pixels pintados: a forma 3D é literalmente o logo.
 */
export function logo(count, size = 6.4) {
  const resolution = 256;
  const scale = resolution / 64; // o viewBox do favicon é 64×64

  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.scale(scale, scale);
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D('M20 20h10a12 12 0 0 1 0 24H20z'));
  ctx.beginPath();
  ctx.arc(46, 22, 4, 0, TAU);
  ctx.fill();

  const { data } = ctx.getImageData(0, 0, resolution, resolution);
  const filled = [];
  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      if (data[(y * resolution + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }

  const points = new Float32Array(count * 3);
  const pixels = filled.length / 2;
  for (let i = 0; i < count; i += 1) {
    const p = Math.floor(Math.random() * pixels) * 2;
    // Centro visual do desenho fica perto de (33, 32) no viewBox.
    points[i * 3] = ((filled[p] + Math.random()) / resolution - 0.52) * size;
    points[i * 3 + 1] = -((filled[p + 1] + Math.random()) / resolution - 0.5) * size;
    // Espessura: o logo vira um objeto, não um adesivo.
    points[i * 3 + 2] = jitter(0.22);
  }
  return points;
}

/** Jornada — hélice dupla cônica: começa estreita e se abre ao subir. */
export function helix(count, height = 6.2, turns = 3.2) {
  const points = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const u = Math.random();
    const strand = i % 2 === 0 ? 0 : Math.PI;
    const angle = u * turns * TAU + strand;
    const radius = 0.5 + u * 2.3;
    // 15% dos pontos viram "degraus" ligando as duas fitas.
    const rung = Math.random() < 0.15 ? Math.random() * 2 - 1 : 1;
    points[i * 3] = Math.cos(angle) * radius * rung + jitter(0.06);
    points[i * 3 + 1] = -height / 2 + u * height + jitter(0.06);
    points[i * 3 + 2] = Math.sin(angle) * radius * rung + jitter(0.06);
  }
  return points;
}

/** Formações — quatro anéis empilhados, cada um menor: camadas de conhecimento. */
export function layers(count, levels = 4) {
  const points = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const level = i % levels;
    const radius = 2.7 - level * 0.55;
    const angle = Math.random() * TAU;
    // Borda nítida + preenchimento esparso: lê como disco, não como linha.
    const r = Math.random() < 0.72 ? radius + jitter(0.05) : radius * Math.sqrt(Math.random());
    points[i * 3] = Math.cos(angle) * r;
    points[i * 3 + 1] = -2.1 + level * 1.4 + jitter(0.04);
    points[i * 3 + 2] = Math.sin(angle) * r;
  }
  return tilt(points, 0.42, 0);
}

/** Tecnologias — átomo: núcleo denso e três órbitas cruzadas. */
export function atom(count) {
  const points = new Float32Array(count * 3);
  const nucleus = Math.floor(count * 0.16);

  for (let i = 0; i < count; i += 1) {
    if (i < nucleus) {
      const r = 0.55 * Math.cbrt(Math.random());
      const theta = Math.random() * TAU;
      const phi = Math.acos(2 * Math.random() - 1);
      points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      points[i * 3 + 2] = r * Math.cos(phi);
      continue;
    }

    const orbit = i % 3;
    const angle = Math.random() * TAU;
    const x = Math.cos(angle) * 3.1 + jitter(0.05);
    const y = Math.sin(angle) * 1.05 + jitter(0.05);
    // Cada órbita é a mesma elipse girada 60° no plano da tela.
    const rot = (orbit * Math.PI) / 3;
    points[i * 3] = x * Math.cos(rot) - y * Math.sin(rot);
    points[i * 3 + 1] = x * Math.sin(rot) + y * Math.cos(rot);
    points[i * 3 + 2] = jitter(0.05);
  }
  return tilt(points, 0.35, 0.3);
}

/** Plataformas — globo com paralelos e meridianos. */
export function globe(count, radius = 2.7) {
  const points = new Float32Array(count * 3);
  const parallels = 7;
  const meridians = 10;

  for (let i = 0; i < count; i += 1) {
    let lat;
    let lon;
    if (i % 2 === 0) {
      // Paralelos: latitude fixa, longitude livre.
      lat = (((i / 2) % parallels) + 1) / (parallels + 1) * Math.PI - Math.PI / 2;
      lon = Math.random() * TAU;
    } else {
      // Meridianos: longitude fixa, latitude livre.
      lon = (((i - 1) / 2) % meridians) / meridians * TAU;
      lat = Math.random() * Math.PI - Math.PI / 2;
    }
    const r = radius + jitter(0.03);
    points[i * 3] = Math.cos(lat) * Math.cos(lon) * r;
    points[i * 3 + 1] = Math.sin(lat) * r;
    points[i * 3 + 2] = Math.cos(lat) * Math.sin(lon) * r;
  }
  return tilt(points, 0.3, 0);
}

/** Projetos — cubo: arestas marcadas e faces em poeira. Construir. */
export function cube(count, size = 3.6) {
  const points = new Float32Array(count * 3);
  const h = size / 2;

  for (let i = 0; i < count; i += 1) {
    // Começa com um ponto aleatório numa face...
    const p = [jitter(h), jitter(h), jitter(h)];
    const axis = Math.floor(Math.random() * 3);
    p[axis] = Math.sign(p[axis] || 1) * h;

    // ...e 60% dos pontos são empurrados para a aresta mais próxima.
    if (Math.random() < 0.6) {
      const other = (axis + 1 + Math.floor(Math.random() * 2)) % 3;
      p[other] = Math.sign(p[other] || 1) * h;
    }

    points[i * 3] = p[0] + jitter(0.03);
    points[i * 3 + 1] = p[1] + jitter(0.03);
    points[i * 3 + 2] = p[2] + jitter(0.03);
  }
  return tilt(points, 0.55, 0.75);
}

/** Contato — avião de papel: a ideia saindo do papel, literalmente. */
export function paperPlane(count) {
  const nose = [3.3, 0.1, 0];
  const tail = [-2.3, 0.15, 0];
  const wingL = [-2.5, 0.55, 2.1];
  const wingR = [-2.5, 0.55, -2.1];
  const keel = [-2.3, -0.95, 0];

  const faces = [
    [nose, tail, wingL],
    [nose, tail, wingR],
    [nose, tail, keel],
  ];
  // Vincos e bordas: o que faz o olho reconhecer a dobradura.
  const edges = [
    [nose, wingL],
    [nose, wingR],
    [nose, keel],
    [nose, tail],
    [tail, wingL],
    [tail, wingR],
  ];

  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const p =
      Math.random() < 0.35
        ? lerp3(...edges[i % edges.length], Math.random())
        : pointInTriangle(...faces[i % faces.length]);
    points[i * 3] = p[0] + jitter(0.03);
    points[i * 3 + 1] = p[1] + jitter(0.03);
    points[i * 3 + 2] = p[2] + jitter(0.03);
  }
  // Nariz para cima e para a frente: em voo, não estacionado.
  return tilt(points, 0.8, -0.5);
}
