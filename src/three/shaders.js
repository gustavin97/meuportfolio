/**
 * ==========================================
 * SHADERS.JS — GLSL DA CENA DO HERO
 * ==========================================
 * Mantidos como template strings para funcionar sem
 * plugin de import .glsl no Vite.
 * ==========================================
 */

/**
 * Ruído simplex 3D (Ashima Arts / Stefan Gustavson, MIT).
 * Base para a deformação orgânica do núcleo e o drift das partículas.
 */
export const simplexNoise3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/* ==========================================
   NÚCLEO — esfera deformada com rim light
   ========================================== */

export const coreVertexShader = /* glsl */ `
uniform float uTime;
uniform float uDistortion;
uniform float uScroll;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

${simplexNoise3D}

void main() {
  // Duas oitavas de ruído: ondulação ampla + detalhe fino.
  float slow = snoise(position * 1.1 + vec3(0.0, uTime * 0.18, 0.0));
  float fast = snoise(position * 3.4 - vec3(uTime * 0.32, 0.0, 0.0)) * 0.35;
  float noise = slow + fast;
  vNoise = noise;

  // O scroll "acalma" o núcleo conforme o usuário desce a página.
  float amplitude = uDistortion * (1.0 - uScroll * 0.55);
  vec3 displaced = position + normal * noise * amplitude;

  // Normal recalculada por diferenças finitas para o rim light acompanhar a deformação.
  float eps = 0.08;
  vec3 tangent1 = normalize(cross(normal, vec3(0.0, 1.0, 0.0) + 0.001));
  vec3 tangent2 = normalize(cross(normal, tangent1));
  vec3 neighbor1 = position + tangent1 * eps;
  vec3 neighbor2 = position + tangent2 * eps;
  neighbor1 += normal * (snoise(neighbor1 * 1.1 + vec3(0.0, uTime * 0.18, 0.0))) * amplitude;
  neighbor2 += normal * (snoise(neighbor2 * 1.1 + vec3(0.0, uTime * 0.18, 0.0))) * amplitude;
  vec3 newNormal = normalize(cross(neighbor1 - displaced, neighbor2 - displaced));

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = -mvPosition.xyz;
  vNormal = normalize(normalMatrix * newNormal);

  gl_Position = projectionMatrix * mvPosition;
}
`;

export const coreFragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uTime;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Fresnel: borda acende, centro escurece — dá volume sem luz real.
  float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 2.4);

  // Cor varia com o ruído: mistura verde → azul → roxo.
  float mixFactor = clamp(vNoise * 0.5 + 0.5, 0.0, 1.0);
  vec3 base = mix(uColorA, uColorB, mixFactor);
  vec3 color = mix(base, uColorC, fresnel * 0.65);

  // Pulso lento de energia.
  float pulse = 0.85 + 0.15 * sin(uTime * 1.2 + vNoise * 3.0);

  float alpha = clamp(fresnel * 1.15 + 0.08, 0.0, 1.0) * uOpacity;
  gl_FragColor = vec4(color * pulse * (fresnel + 0.25), alpha);
}
`;

/* ==========================================
   PARTÍCULAS — campo estelar com drift
   ========================================== */

export const particlesVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform vec2 uMouse;
uniform float uScroll;

attribute float aScale;
attribute float aSpeed;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;

${simplexNoise3D}

void main() {
  vColor = aColor;
  vec3 pos = position;

  // Drift turbulento: cada partícula segue o campo de ruído no seu ritmo.
  float t = uTime * aSpeed * 0.12;
  pos.x += snoise(pos * 0.16 + vec3(t, 0.0, 0.0)) * 2.2;
  pos.y += snoise(pos * 0.16 + vec3(0.0, t, 0.0)) * 2.2;
  pos.z += snoise(pos * 0.16 + vec3(0.0, 0.0, t)) * 2.2;

  // Parallax: partículas distantes reagem menos ao mouse.
  float depth = smoothstep(-14.0, 14.0, pos.z);
  pos.xy += uMouse * mix(0.4, 2.4, depth);

  // Scroll empurra o campo em direção à câmera, criando sensação de mergulho.
  pos.z += uScroll * 12.0;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // Fade nas pontas do volume para não haver "pop" de partícula surgindo.
  // Medido em profundidade, não em raio: o campo se espalha por todo o hero
  // e um fade radial apagaria tudo que está longe do centro da tela.
  float distanceFade = 1.0 - smoothstep(20.0, 40.0, -mvPosition.z);
  vAlpha = distanceFade * mix(0.25, 1.0, depth);

  gl_Position = projectionMatrix * mvPosition;
  // Tamanho atenuado pela distância — perspectiva correta em pontos.
  gl_PointSize = uSize * aScale * uPixelRatio * (14.0 / -mvPosition.z);
}
`;

export const particlesFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Recorta o quad do ponto em um disco com falloff suave.
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;

  float glow = 1.0 - smoothstep(0.0, 0.5, dist);
  glow = pow(glow, 2.0);

  gl_FragColor = vec4(vColor, glow * vAlpha);
}
`;
