---
name: immersive-motion
description: Motion design e WebGL deste portfólio (Three.js + GSAP 3.15 + Lenis). Use ao criar ou ajustar qualquer animação, efeito de scroll, shader, objeto 3D, microinteração, cursor, preloader ou transição — garante que o novo efeito siga as regras de performance, acessibilidade e o "ritmo" visual da casa.
---

# Immersive Motion — guia da casa

Este projeto é uma experiência imersiva: um canvas WebGL fixo (`.world-scene`) atrás de todas
as seções, conteúdo DOM por cima, scroll suavizado por Lenis e animações GSAP. Toda animação
nova precisa encaixar nestas regras.

## 1. Arquitetura (onde cada coisa vive)

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Ambiente | `src/core/env.js` | `env.tier` (`high/medium/low`), `env.isTouch`, `prefersReducedMotion`, `shouldRenderImmersive()` |
| GSAP | `src/core/gsap.js` | **Único** lugar que registra plugins. Eases `guz` e `guzInOut`, `DURATION` |
| Scroll | `src/core/scroll.js` | Lenis conduzido pelo `gsap.ticker`; `scrollTo`, `stopScroll`, `startScroll` |
| Mundo 3D | `src/three/HeroScene.js` | Renderer, câmera, núcleo, partículas; recebe `update(delta, elapsed)` do ticker |
| Formas por seção | `src/three/MorphField.js` + `shapes.js` | `CHAPTERS`: seção → forma de partículas |
| Shaders | `src/three/shaders.js` | GLSL em template strings (`/* glsl */`), ruído simplex compartilhado |
| Scroll scenes | `src/animations/scroll-scenes.js` | Tudo que é `ScrollTrigger` com scrub/pin |
| Reveals | `src/animations/reveal.js` | `data-reveal`, `data-split`, `data-scramble`, `data-counter` |
| Mídia | `src/animations/media.js` | Wipe de imagem, parallax interno, fundos de seção |
| Micro | `src/animations/interactions.js` | `data-magnetic`, `data-tilt`, hover de mídia |

## 2. Regras inegociáveis

1. **Um único requestAnimationFrame**: o do `gsap.ticker`. Nada de `requestAnimationFrame`
   próprio. Loops só rodam enquanto o elemento está na tela (`ScrollTrigger.onToggle`
   adicionando/removendo do ticker).
2. **Delta travado**: `Math.min(deltaMs / 1000, 0.05)` — evita saltos após aba inativa.
3. **Damping independente de framerate**: `value += (target - value) * (1 - Math.exp(-k * delta))`.
   Nunca `value += (target - value) * 0.1`.
4. **Reduced motion**: todo efeito checa `env.prefersReducedMotion` e entrega o estado final
   estático. WebGL só existe se `shouldRenderImmersive()`.
5. **Orçamento por tier**: contagem de partículas, pós-processamento, tilt e parallax escalam
   por `env.tier`. Em `low`, efeitos caros simplesmente não são criados.
6. **Touch**: sem cursor customizado, sem magnetismo, sem parallax de mouse. Não sequestrar
   gestos (scroll horizontal vira swipe nativo).
7. **Um dono por propriedade**: duas animações nunca escrevem a mesma propriedade no mesmo
   elemento. Use timeline única com keyframes, ou propriedades diferentes (`scale` vs `yPercent`).
8. **Reveal depois do preloader**: animações de entrada são criadas em `main.js` após
   `runPreloader()`; `ScrollTrigger` com `once: true` dispara na criação se já estiver visível.
9. **Decorativo = `aria-hidden="true"`** e `pointer-events: none`. Conteúdo nunca depende
   de animação para ser legível.
10. **Dispose**: todo objeto 3D novo libera geometry/material e listeners em `dispose()`.

## 3. Ritmo visual

- Eases: `guz` (saída longa, para entradas) e `guzInOut` (mudanças de estado). Evite
  inventar curvas novas; `power3.out` e `back.out(1.6)` são aceitáveis para micro.
- Durações: `DURATION.fast 0.4`, `base 0.8`, `slow 1.2`, `reveal 1.4`.
- Stagger: prefira `stagger: { amount }` a `each` — o grupo termina no mesmo tempo
  independente do número de itens.
- Paleta: verde `#00FF88`, azul `#00BFFF`, roxo `#8A2BE2` sobre preto `#050505`.
  Brilho por `AdditiveBlending`, nunca por cor saturada chapada.

## 4. Receitas

### Objeto 3D novo
1. Crie uma classe em `src/three/` com `group`, `update(delta, elapsed, state)`,
   `setPixelRatio()` (se usar pontos) e `dispose()`.
2. Instancie em `HeroScene` (`_init*`), chame no `update()` e no `dispose()`.
3. Materiais: `transparent: true`, `depthWrite: false`, `blending: AdditiveBlending`.
4. Opacidade multiplicada por `this.introOpacity` para entrar com o preloader.

### Uniform guiado por scroll
- Calcule no JS (ScrollTrigger `onUpdate`) e passe por setter na cena (`setX(value)`).
- Na cena, suavize alvo → valor com damping exponencial antes de mandar ao shader.

### Velocidade de scroll
- `self.getVelocity()` (px/s) no `onUpdate`; normalize dividindo (~1500–3000) e
  faça decair sozinha no `update()` com `Math.exp(-k * delta)`.

### Shader de pontos
- `gl_PointSize = uSize * aScale * uPixelRatio * (14.0 / -mvPosition.z)`.
- Fragment: disco com `discard` fora de 0.5 e glow `pow(1 - smoothstep(0, .5, d), n)`.

## 5. Checklist antes do commit

- [ ] `npm test` (smoke test do render) e `npm run build` passam
- [ ] Efeito some/estatiza com `prefers-reduced-motion: reduce`
- [ ] Nenhum `requestAnimationFrame` novo; loops param fora da tela
- [ ] Tier `low` não cria o efeito caro
- [ ] Elementos decorativos com `aria-hidden` e sem capturar clique
