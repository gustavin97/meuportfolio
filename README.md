# DEV GUZ — Portfólio

Portfólio pessoal com cena WebGL interativa, scroll suave e animações guiadas por scroll.
JavaScript puro (sem framework de UI), empacotado com Vite.

**Stack:** Vite · Three.js · GSAP + ScrollTrigger · Lenis · SplitType · Lucide

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
src/
  main.js               Ponto de entrada: orquestra a ordem de inicialização
  data/site.js          ← TODO O CONTEÚDO
  core/
    env.js              Detecta WebGL, potência do device, prefers-reduced-motion
    scroll.js           Lenis + ScrollTrigger no mesmo ticker
  three/
    HeroScene.js        Cena 3D do hero
    shaders.js          GLSL (ruído simplex, fresnel, partículas)
  animations/
    reveal.js           Entradas por [data-reveal] / [data-split] / [data-counter]
    scroll-scenes.js    Parallax, timeline, projetos horizontais
    interactions.js     Cursor, botões magnéticos, tilt dos cards
  components/           header, form, preloader, icons
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

**A carga visual se adapta ao aparelho.** `core/env.js` classifica o device em
`high`/`medium`/`low` e ajusta contagem de partículas (2600 → 500), subdivisão da
geometria e pixel ratio.

**`prefers-reduced-motion` é respeitado de verdade.** Não é só desligar transição:
o Lenis não inicializa, nenhum ScrollTrigger é criado e o WebGL nem carrega.

**Acessibilidade.** Skip link, foco visível, `inert` no menu fechado, `aria-invalid`
+ `role="alert"` no formulário, e o título fatiado pelo SplitType ganha `aria-label`
com o texto original (senão o leitor de tela soletra letra por letra).

---

## Pendências antes de publicar

- [ ] Trocar e-mail, telefone e URLs sociais em `src/data/site.js` (marcados com `TODO`)
- [ ] Substituir os números dos projetos por métricas reais — hoje são exemplos
- [ ] Preencher `liveUrl` / `repoUrl` dos projetos (sem eles, o card mostra "Estudo de caso em breve")
- [ ] Gerar as imagens de [`IMAGES.md`](IMAGES.md)
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
