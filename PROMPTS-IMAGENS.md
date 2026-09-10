# Prompts para gerar as imagens

Prompts prontos para colar no Codex (ou qualquer gerador de imagem). Cada bloco traz
o **caminho exato** onde o arquivo precisa ser salvo e as **dimensões** que o layout espera.

Os prompts estão em inglês porque modelos de imagem respondem melhor assim —
o resultado não muda por causa disso.

> **Não gere por IA:** os logos das plataformas (seção 4 do `IMAGES.md`) e a
> `perfil.jpg`. Logo de marca inventado e foto de rosto falsa desqualificam o
> portfólio na hora. Veja o final deste arquivo.

---

## Base de estilo (colar junto com TODO prompt)

Isso é o que mantém as 11 imagens parecendo do mesmo site. Cole antes do prompt específico:

```
STYLE BASE — apply to every image:
Dark UI aesthetic on near-black background (#050505 to #0a0a0a).
Neon accent palette, used sparingly: mint green #00FF88, cyan blue #00BFFF, violet #8A2BE2.
Cinematic rim lighting, deep shadows, high contrast, subtle volumetric glow.
Clean modern composition, generous negative space, shallow depth of field.
Photorealistic render quality, sharp focus on the subject.
No embedded text, no logos, no watermarks, no UI copy, no lorem ipsum.
```

```
NEGATIVE PROMPT (universal):
text, letters, words, typography, watermark, signature, logo, brand marks,
lowres, blurry, jpeg artifacts, oversaturated, rainbow colors, cluttered,
busy background, stock photo look, distorted hands, extra fingers
```

---

## 1. Projetos — `public/assets/images/projects/`

**Formato: 1600 × 1000 px (16:10), JPG.** O elemento principal no terço superior —
o card corta a base da imagem em telas pequenas.

### `loja-premium.jpg`
```
A premium e-commerce storefront shown on a floating laptop screen and a phone
beside it, angled three-quarter view. The screen shows a minimal dark product
page: large product photo, price, and a green call-to-action button. Mint green
#00FF88 rim light along the device edges, soft cyan glow reflecting on the desk
surface. Clean, high-end, editorial product-shot feel.
```

### `plataforma-gestao.jpg`
```
A dark analytics dashboard floating in space, seen at a slight angle. Visible
elements: a data table with rows, a bar chart, a line chart trending upward, and
three KPI cards. Cyan blue #00BFFF as the primary data color, mint green accents
on the positive trend line. Layered glass panels with depth, soft shadows between
them. Abstract enough that no text is readable.
```

### `landing-conversao.jpg`
```
A long single-page website scroll shown in perspective, tilted away from the
camera like a ribbon of screen. Top section is a bold hero area, lower sections
show a form and content blocks. Violet #8A2BE2 to cyan #00BFFF gradient washing
across the surface. Sense of motion and flow, subtle glow trail along the edges.
```

### `automacao-n8n.jpg`
```
An abstract automation workflow: rounded rectangular nodes connected by smooth
curved cables on a dark canvas, arranged left to right. Small icons inside the
nodes suggest database, message, and cloud without being readable. The connecting
cables glow mint green #00FF88, with data pulses traveling along them. Technical,
elegant, like a high-end node editor.
```

---

## 2. Galeria (seção Sobre) — `public/assets/images/gallery/`

### `workspace.jpg` — **1600 × 1000 px (16:10)**
```
A developer workstation at night, shot from a low three-quarter angle. Ultrawide
monitor showing a dark code editor (code unreadable, just syntax-colored shapes),
mechanical keyboard, a plant, and a coffee cup. Mint green and cyan bias lighting
washing the wall behind the monitor. Warm practical lamp on one side for contrast.
Cozy but professional. No person in frame.
```

### `codigo.jpg` — **900 × 1200 px (3:4, vertical)**
```
Extreme close-up of code on a dark screen, shot at a sharp angle with very shallow
depth of field. Only a few lines are in focus; the rest melts into colored bokeh.
Syntax highlighting in mint green, cyan and violet on near-black. The code itself
is abstract and unreadable. Macro lens feel, visible screen grain.
```

### `perfil.jpg` — **900 × 1200 px (3:4, vertical)**
**Não gere.** Use uma foto sua real. Ver seção "Não gere por IA" no fim.

---

## 3. Formações — `public/assets/images/formations/`

**Formato: 1200 × 750 px (16:10), JPG.** São imagens temáticas, não fotos de diploma.

### `ads.jpg` — Análise e Desenvolvimento de Sistemas
```
An abstract software architecture diagram floating in dark space: geometric
blocks and layers connected by thin lines, suggesting system design and data
structures. Isometric perspective. Cyan blue #00BFFF wireframe glow, violet
accents at the connection points. Precise, structural, academic feel.
```

### `fullstack.jpg` — Programação Full Stack
```
Two glowing layers stacked in dark space, connected by vertical light beams:
the upper layer is a grid of interface panels, the lower layer is a cluster of
server and database shapes. Mint green #00FF88 on the top layer, cyan #00BFFF
on the bottom. Represents front-end and back-end joined. Isometric, clean.
```

### `frontend.jpg` — Programação Front-End
```
Abstract responsive interface components floating at different depths: cards,
buttons, a navigation bar and a grid, rendered as glass panels on near-black.
The same layout appears at three widths, suggesting responsive design. Mint green
#00FF88 accent edges, soft violet glow behind. Elegant, airy, lots of space.
```

### `automacao.jpg` — Automação com n8n
```
Interlocking mechanical gears rendered as glowing wireframe outlines on dark
background, with thin data streams flowing between them like circuitry. Mint
green #00FF88 gear outlines, cyan #00BFFF data streams. Represents automated
processes. Technical, minimal, no clutter.
```

---

## 4. Open Graph — `public/assets/images/og/og-image.jpg`

**1200 × 630 px exatos.** É a miniatura que aparece ao compartilhar o link no
WhatsApp e LinkedIn — **esta é a única que leva texto**, e ele precisa ser grande.

```
A social share card, 1200x630. Near-black background (#050505) with a soft
diagonal gradient glow from mint green #00FF88 (top left) to cyan blue #00BFFF
(bottom right). Centered composition. Large bold sans-serif text reading
"DEV GUZ" as the headline, and smaller text below reading
"Desenvolvedor Full Stack". A thin glowing horizontal line separates them.
Subtle grid pattern in the background, fading at the edges. Minimal, high
contrast, text must be large and perfectly legible at thumbnail size.
```

> Se o gerador errar o texto (é comum), gere só o fundo e escreva o texto por cima
> no Figma ou Canva. Texto torto na OG image é o tipo de detalhe que recrutador nota.

---

## 5. Ícone — `public/assets/icons/apple-touch-icon.png`

**Não precisa de IA.** É só exportar o favicon que já existe:

```bash
npx sharp-cli -i public/assets/icons/favicon.svg -o public/assets/icons/apple-touch-icon.png resize 180 180
```

Ou abra `public/assets/icons/favicon.svg` no navegador, dê print e redimensione para 180×180.

---

## Não gere por IA

| Arquivo | Por quê | O que fazer |
|---|---|---|
| `public/assets/images/platforms/*.svg` | São marcas registradas. Logo de WordPress ou Shopify "quase igual" passa impressão de fraude. | Baixe os oficiais em [worldvectorlogo.com](https://worldvectorlogo.com) ou na página de imprensa de cada empresa. |
| `public/assets/images/gallery/perfil.jpg` | É **você**. Recrutador quer ver a pessoa que vai contratar. | Foto real, boa luz, fundo simples. Não precisa ser estúdio — celular na janela resolve. |

---

## Depois de gerar

1. **Confira as dimensões.** O layout usa `object-fit: cover`; proporção errada corta o assunto.
2. **Comprima.** Alvo: **abaixo de 250 KB por JPG**. Use [squoosh.app](https://squoosh.app).
   Imagem de 3 MB destrói o LCP e joga o Lighthouse para baixo — num portfólio de
   dev isso é contraditório com o que você está vendendo.
3. **Solte no caminho exato** listado em cada bloco. O site troca o placeholder pela
   imagem automaticamente, sem mexer em código.
4. Rodou tudo? `npm run dev` e confira que nenhum bloco com gradiente sobrou.

> Quer usar WebP (menor e melhor)? Pode — só troque a extensão no
> `src/data/site.js`, que é de onde os caminhos saem.
