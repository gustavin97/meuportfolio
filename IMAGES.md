# Imagens do portfólio

Lista exata dos arquivos que o site espera. **Enquanto o arquivo não existe, o site
não quebra**: aparece um bloco com gradiente e o rótulo do item no lugar. Basta
soltar o arquivo no caminho certo com o nome certo e ele passa a aparecer.

Os caminhos vêm de `src/data/site.js` — se quiser outro nome, mude lá.

---

## 1. Projetos — `assets/images/projects/`

Formato: **1600×1000 px** (16:10), JPG, o mais importante da tela no terço superior.

| Arquivo | Projeto | Sugestão de prompt |
|---|---|---|
| `loja-premium.jpg` | Loja Virtual Premium | Mockup de e-commerce em desktop e celular, tema escuro, produto em destaque, acentos verde-neon |
| `plataforma-gestao.jpg` | Plataforma de Gestão | Dashboard escuro com tabela, gráfico de barras e cards de KPI, acentos azul-ciano |
| `landing-conversao.jpg` | Landing Page de Conversão | Landing page longa vista em perspectiva, hero + formulário, fundo escuro |
| `automacao-n8n.jpg` | Sistema de Automação | Diagrama de fluxo de nós conectados estilo n8n, fundo escuro, linhas neon |

## 2. Galeria (seção Sobre) — `assets/images/gallery/`

| Arquivo | Proporção | Conteúdo |
|---|---|---|
| `workspace.jpg` | 16:10 (1600×1000) | Setup de trabalho: monitor com código, teclado, iluminação neon |
| `codigo.jpg` | 3:4 (900×1200) | Close de código em tela escura, desfoque suave |
| `perfil.jpg` | 3:4 (900×1200) | **Sua foto real.** Não gere por IA — recrutador quer ver você |

> `perfil.jpg` também é usada no `schema.org` do `index.html`.

## 3. Formações — `assets/images/formations/`

Formato: **1200×750 px** (16:10), JPG. Podem ser abstratas/temáticas.

| Arquivo | Curso |
|---|---|
| `ads.jpg` | Análise e Desenvolvimento de Sistemas (FATEC) |
| `fullstack.jpg` | Programação Full Stack (Rocketseat) |
| `frontend.jpg` | Programação Front-End (DIO) |
| `automacao.jpg` | Automação com n8n (Hashtag) |

## 4. Plataformas — `assets/images/platforms/`

Formato: **SVG** (ou PNG 256×256 com fundo transparente). São logos oficiais —
**baixe do site da marca, não gere por IA**. Marca inventada desqualifica o portfólio.

`wordpress.svg` · `shopify.svg` · `nuvemshop.svg` · `tray.svg` · `bagy.svg`

> Renderizados com `object-fit: contain`, então logo horizontal também funciona.

## 5. Open Graph — `assets/images/og/`

| Arquivo | Formato | Conteúdo |
|---|---|---|
| `og-image.jpg` | **1200×630 px** exatos | "DEV GUZ / Desenvolvedor Full Stack" sobre fundo escuro com gradiente verde→azul |

É a imagem que aparece quando alguém compartilha o link no WhatsApp/LinkedIn.
Texto grande — vira miniatura.

## 6. Ícones — `assets/icons/`

| Arquivo | Status |
|---|---|
| `favicon.svg` | ✅ já criado |
| `apple-touch-icon.png` | 180×180 px — falta gerar (pode exportar do favicon) |

## 7. Currículo — `assets/`

| Arquivo | Observação |
|---|---|
| `curriculo-devguz.pdf` | O botão "Baixar currículo" na seção Sobre aponta para cá |

---

## Direção de arte (para manter tudo coerente)

- **Fundo:** quase preto (`#050505` a `#0a0a0a`)
- **Acentos:** verde-neon `#00FF88`, azul `#00BFFF`, roxo `#8A2BE2`
- **Luz:** contraluz neon, sombras profundas, alto contraste
- **Sem** texto embutido nas imagens de projeto (o card já traz o título)
- **Peso:** comprima antes de subir. Alvo: **< 250 KB** por JPG
  ([squoosh.app](https://squoosh.app) resolve). WebP é ainda melhor — se usar,
  troque a extensão em `src/data/site.js`.
