# DEV GUZ — Portfólio

Portfólio pessoal com cena WebGL interativa, scroll suave e animações guiadas por scroll.
JavaScript puro (sem framework de UI), empacotado com Vite.

**Stack:** Vite · Three.js · GSAP (ScrollTrigger, Flip, SplitText, DrawSVG, ScrambleText, CustomEase) · Lenis · Lucide

---

## Rodando

```bash
npm install
npm run dev      # servidor de desenvolvimento em http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve o dist/ para conferir o build
npm test         # smoke test da renderização (jsdom)
```

---

## Como mexer

### Mudar conteúdo
**Tudo** — textos, projetos, tecnologias, formações, links, contato — está em
[`src/data/site.js`](src/data/site.js). O HTML é só a casca; as seções são geradas
a partir desse arquivo. Não edite `index.html` para trocar texto.

### Adicionar imagens
Veja [`IMAGES.md`](IMAGES.md). Enquanto o arquivo não existe, aparece um placeholder
com gradiente — o layout nunca quebra.

### Ligar o formulário de contato
```bash
cp .env.example .env
```
Coloque a URL do seu endpoint em `VITE_CONTACT_ENDPOINT` (Formspree, Web3Forms,
Basin ou uma rota serverless sua). **Sem endpoint configurado, o botão abre o cliente
de e-mail do visitante** — um caminho que funciona, em vez de um sucesso falso.

---

## Estrutura

```
index.html              Casca semântica das seções
public/assets/          Imagens, ícones, currículo (copiado literalmente no build)
src/
  main.js               Ponto de entrada: orquestra a ordem de inicialização
  data/site.js          ← TODO O CONTEÚDO
  core/
    env.js              Detecta WebGL, potência do device, prefers-reduced-motion
    gsap.js             Registro dos plugins + curvas de easing da casa
    scroll.js           Lenis + ScrollTrigger no mesmo ticker
  three/
    HeroScene.js        Mundo 3D fixo: esfera do hero, poeira e nuvem de formas
    MorphField.js       Roteiro seção → forma (CHAPTERS) e a troca entre elas
    shapes.js           As formas: esfera, logo, hélice, anéis, átomo, globo, cubo, avião
    Orbits.js           Anéis com cometas em volta da esfera do hero
    Crystals.js         Poliedros de vidro à deriva nas laterais, reagem ao cursor
    Aurora.js           Cortinas de luz ao fundo, tom acompanha o capítulo
    shaders.js          GLSL (ruído, fresnel, partículas, morph, órbitas, cristais, aurora, interação)
  animations/
    reveal.js           [data-reveal] [data-split] [data-counter] [data-scramble], títulos cinéticos
    media.js            Wipe das imagens, parallax, fundos de seção, skew por velocidade
    scroll-scenes.js    Timeline, projetos horizontais, faixa cinética, vínculo com o 3D
    interactions.js     Botões magnéticos, tilt dos cards, letras magnéticas, glitch RGB
    footer.js           Assinatura gigante do rodapé com holofote
  components/           header, form, preloader, icons, cursor, lightbox,
                        hud (capítulos), sound (trilha sintetizada), easter-egg
  sections/render.js    Gera o HTML das seções a partir dos dados
  utils/dom.js          Template com escape + fallback de mídia
css/                    global/ · layout/ · sections/ · components/
scripts/smoke-test.mjs  Teste de renderização
```

---

## Decisões que valem saber

**Um só `requestAnimationFrame`.** Lenis, GSAP e Three.js rodam todos no
`gsap.ticker`. Três loops independentes é a causa mais comum de travamento em
sites com WebGL.

**A cena 3D é carregada sob demanda.** `HeroScene.js` entra por `import()`
dinâmico. Em device sem WebGL ou com "reduzir movimento" ligado, o chunk do
Three.js (~126 KB gzip) **nunca é baixado** — aparece um orbe estático no lugar.

**O 3D conta a história da página.** O canvas é fixo atrás de todas as seções.
Ao sair do hero, a esfera se dissolve numa nuvem de partículas que assume uma
forma por seção: a marca no Sobre, uma hélice na Jornada, um avião de papel no
Contato. Para trocar uma forma ou reposicioná-la, edite `CHAPTERS` em
`three/MorphField.js`. As camadas são: fotos de fundo (z 0) → mundo 3D (z 1) →
conteúdo (z 2). Por isso as seções **não** têm `z-index` próprio.

**A carga visual se adapta ao aparelho.** `core/env.js` classifica o device em
`high`/`medium`/`low` e ajusta contagem de partículas (2600 → 500), subdivisão da
geometria e pixel ratio.

**`prefers-reduced-motion` é respeitado de verdade.** Não é só desligar transição:
o Lenis não inicializa, nenhum ScrollTrigger é criado e o WebGL nem carrega.

**O mundo reage a quem visita.** As partículas abrem caminho para o cursor e um
clique solta uma onda de choque (uniforms compartilhados em `HeroScene._initInteraction`).
A velocidade do scroll acelera cometas, gira cristais, acende a poeira e a aurora.
Enviar o formulário faz o avião de papel decolar (evento `portfolio:launch`).

**Som é opt-in.** A trilha ambiente é sintetizada com Web Audio (nenhum arquivo
baixado) e só começa no clique do botão "Som", no canto inferior esquerdo.

**Easter egg.** Digite `guz` na página (fora do formulário) ou o código Konami
para um salto no hiperespaço. O console dá a dica.

**Skill de animação.** `.claude/skills/immersive-motion` documenta as regras de
motion e WebGL do projeto (um rAF só, damping por delta, orçamento por tier,
reduced motion). Use-a ao criar efeitos novos com o Claude Code.

**Acessibilidade.** Skip link, foco visível, `inert` no menu fechado, `aria-invalid`
+ `role="alert"` no formulário, e o título fatiado pelo SplitType ganha `aria-label`
com o texto original (senão o leitor de tela soletra letra por letra).

---

## Pendências antes de publicar

- [ ] Trocar e-mail, telefone e URLs sociais em `src/data/site.js` (marcados com `TODO`)
- [ ] Substituir os números dos projetos por métricas reais — hoje são exemplos
- [ ] Preencher `liveUrl` / `repoUrl` dos projetos (sem eles, o card mostra "Estudo de caso em breve")
- [ ] Foto real em `public/assets/images/gallery/perfil.jpg` (ver [`IMAGES.md`](IMAGES.md))
- [ ] Baixar os 5 logos oficiais em `public/assets/images/platforms/`
- [ ] Colocar o PDF em `public/assets/curriculo-devguz.pdf`
- [ ] Configurar `VITE_CONTACT_ENDPOINT`
- [ ] Trocar `devguz.com` pelo domínio real (`index.html` e `src/data/site.js`)

> **Sobre SEO:** o conteúdo é renderizado no cliente. O Google executa JS e indexa
> normalmente, e as meta tags + JSON-LD são estáticas no HTML. Mas se indexação for
> crítica, vale pré-renderizar o `dist/` (`vite-plugin-prerender` ou similar).

---

## Deploy

Saída estática em `dist/` — serve em qualquer lugar.

**Vercel / Netlify:** build `npm run build`, diretório `dist`. Lembre de cadastrar
`VITE_CONTACT_ENDPOINT` nas variáveis de ambiente do painel.
