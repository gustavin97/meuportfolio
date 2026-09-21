/**
 * ==========================================
 * SITE.JS — FONTE ÚNICA DE CONTEÚDO
 * ==========================================
 * Todo o conteúdo do portfólio vive aqui.
 * Para atualizar o site, edite este arquivo — não o HTML.
 *
 * Campos `image` apontam para arquivos em /assets/images/.
 * Enquanto o arquivo não existir, a UI cai automaticamente
 * no fallback visual (gradiente + label). Veja IMAGES.md.
 * ==========================================
 */

/* ==== IDENTIDADE ==== */
export const profile = {
  name: 'DEV GUZ',
  fullName: 'Gustavo Costenaro Pereira',
  role: 'Desenvolvedor Full Stack',
  tagline:
    'Transformo boas ideias em produtos digitais que dão orgulho de mostrar e vontade de usar.',
  description:
    'Sou Gustavo Costenaro Pereira, o DEV GUZ. Gosto de transformar desafios em experiências digitais bonitas, rápidas e que realmente ajudam um negócio a crescer.',
  location: 'São Paulo — SP, Brasil',
  available: true,
  availabilityLabel: 'Disponível para tirar ideias do papel e fazer acontecer.',
  email: 'gustavoprogweb97@gmail.com',
  phone: '+55 (44) 99983-0226',
  phoneRaw: '5544999830226',
  resumeUrl: '/assets/curriculo-devguz.pdf',
  avatar: '/assets/images/gallery/perfil.jpg',
};

/* ==== WHATSAPP ==== */
/**
 * Link do WhatsApp com mensagem pré-preenchida.
 * Centralizado aqui para que todos os botões do site (hero,
 * contato, rodapé, menu mobile e botão flutuante) apontem
 * para o mesmo número e o mesmo texto de abertura.
 */
export const whatsappMessage = 'Olá, Gustavo! Vi seu portfólio e quero tirar uma ideia do papel com você.';

export function whatsappUrl(message = whatsappMessage) {
  return `https://wa.me/${profile.phoneRaw}?text=${encodeURIComponent(message)}`;
}

/* ==== REDES SOCIAIS ==== */
export const socials = [
  { id: 'github', label: 'GitHub', icon: 'github', url: 'https://github.com/gustavin97' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/in/SEU_USUARIO' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/SEU_USUARIO' },
];

/* ==== NAVEGAÇÃO ==== */
export const navigation = [
  { id: 'hero', label: 'Início' },
  { id: 'about', label: 'Sobre' },
  { id: 'timeline', label: 'Jornada' },
  { id: 'formations', label: 'Formações' },
  { id: 'technologies', label: 'Tecnologias' },
  { id: 'platforms', label: 'Plataformas' },
  { id: 'projects', label: 'Projetos' },
  { id: 'contact', label: 'Contato' },
];

/* ==== MÉTRICAS ==== */
export const stats = [
  { value: 5, suffix: '+', label: 'Projetos entregues' },
  { value: 3, suffix: '+', label: 'Anos de experiência' },
  { value: 100, suffix: '%', label: 'Clientes satisfeitos' },
];

/* ==== SOBRE ==== */
export const about = {
  heading: 'Vamos construir algo marcante?',
  paragraphs: [
    'Sou desenvolvedor full stack e adoro transformar ideias em experiências digitais que fazem sentido para pessoas de verdade. Comecei pelo front-end e fui puxando o fio até o back-end, integrações e automação.',
    'Hoje trabalho com e-commerce (Shopify, Nuvemshop, Tray), aplicações sob medida e automações que devolvem tempo para as equipes. Cada projeto é uma oportunidade de simplificar, aproximar e gerar resultado.',
    'Gosto de cuidar de cada detalhe: uma animação que convida a continuar, uma interface que dá prazer de usar e um site rápido para todo mundo. No fim, tecnologia boa é aquela que faz a vida ficar mais leve.',
  ],
  gallery: [
    { image: '/assets/images/eu2.jpg', alt: 'Dev Guz no ambiente de trabalho', label: 'Dev Guz' },
  ],
};

/* ==== JORNADA ==== */
export const timeline = [
  {
    year: '2021',
    title: 'O primeiro passo',
    description: 'HTML, CSS e JavaScript do zero. Primeiras interfaces e a descoberta de que criar na web podia ser muito mais do que um trabalho.',
  },
  {
    year: '2022',
    title: 'Ideias ganhando forma',
    description: 'Consolidei o front-end e comecei a explorar back-end com Node.js, banco de dados e deploy — sempre com muita curiosidade.',
  },
  {
    year: '2023',
    title: 'Projetos com histórias reais',
    description: 'Sites e aplicações para pequenos negócios. Aprendi a ouvir, fazer as perguntas certas e transformar desejos em caminhos claros.',
  },
  {
    year: '2024',
    title: 'Especialização em e-commerce',
    description: 'Shopify, Nuvemshop e Tray: temas customizados, integrações de pagamento e experiências que ajudam cada visita a virar oportunidade.',
  },
  {
    year: '2025',
    title: 'Automação para abrir espaço',
    description: 'n8n, integração de APIs e agentes de IA em fluxos internos — menos trabalho repetitivo e mais tempo para o que realmente importa.',
  },
];

/* ==== FORMAÇÕES ==== */
export const formations = [
  {
    name: 'Análise e Desenvolvimento de Sistemas',
    institution: 'FATEC — 4º semestre.',
    description: 'Arquitetura de software, estruturas de dados, banco de dados e engenharia de requisitos.',
    badge: 'Em andamento',
    status: 'progress',
    image: '/assets/images/formations/ads.jpg',
    fallback: 'ADS',
  },
  {
    name: 'Programação Full Stack',
    institution: 'Rocketseat',
    description: 'Bootcamp imersivo em React, Node.js, APIs REST e boas práticas de projeto.',
    badge: 'Concluído',
    status: 'done',
    image: '/assets/images/formations/fullstack.jpg',
    fallback: 'Full Stack',
  },
  {
    name: 'Programação Front-End',
    institution: 'DIO',
    description: 'Interfaces responsivas, acessibilidade, performance e experiência do usuário.',
    badge: 'Concluído',
    status: 'done',
    image: '/assets/images/formations/frontend.jpg',
    fallback: 'Front-End',
  },
  {
    name: 'Automação com n8n',
    institution: 'Hashtag Treinamentos',
    description: 'Workflows, integrações entre APIs e automação de processos de ponta a ponta.',
    badge: 'Concluído',
    status: 'done',
    image: '/assets/images/formations/automacao.jpg',
    fallback: 'Automação',
  },
];

/* ==== TECNOLOGIAS ====
   `icon` usa nomes de ícones do Lucide (https://lucide.dev/icons). */
export const techCategories = [
  {
    id: 'tecnologias',
    title: 'Tecnologias',
    accent: 'green',
    items: [
      { name: 'HTML', icon: 'file-code' },
      { name: 'CSS', icon: 'palette' },
      { name: 'JavaScript', icon: 'braces' },
      { name: 'TypeScript', icon: 'file-type-2' },
      { name: 'React', icon: 'atom' },
      { name: 'Tailwind CSS', icon: 'wind' },
      { name: 'Node.js', icon: 'hexagon' },
      { name: 'n8n', icon: 'workflow' },
      { name: 'GSAP', icon: 'sparkles' },
      { name: 'Three.js', icon: 'box' },
      { name: 'Docker', icon: 'container' },
      { name: 'SQLite', icon: 'database' },
      { name: 'Supabase', icon: 'cloud' },
    ],
  },
  {
    id: 'ias',
    title: 'IA & Copilotos',
    accent: 'blue',
    items: [
      { name: 'Claude Code', icon: 'terminal' },
      { name: 'ChatGPT', icon: 'message-square' },
      { name: 'Codex', icon: 'code-2' },
      { name: 'Gemini', icon: 'gem' },
      { name: 'Manus', icon: 'brain' },
      { name: 'DeepSeek', icon: 'search-code' },
    ],
  },
  {
    id: 'ferramentas',
    title: 'Ferramentas',
    accent: 'purple',
    items: [
      { name: 'VS Code', icon: 'code' },
      { name: 'Figma', icon: 'pen-tool' },
      { name: 'Git', icon: 'git-branch' },
      { name: 'Canva', icon: 'image' },
    ],
  },
];

/* ==== PLATAFORMAS ==== */
export const platforms = [
  {
    name: 'WordPress',
    description: 'Sites e blogs com tema customizado, blocos sob medida e performance otimizada.',
    badge: 'CMS',
    image: '/assets/images/platforms/wordpress.svg',
    fallback: 'WP',
  },
  {
    name: 'Shopify',
    description: 'Lojas de alto desempenho com Liquid, apps e otimização de checkout.',
    badge: 'E-commerce',
    image: '/assets/images/platforms/shopify.svg',
    fallback: 'SH',
  },
  {
    name: 'Nuvemshop',
    description: 'Lojas integradas, automações de pedido e ajustes finos de conversão.',
    badge: 'E-commerce',
    image: '/assets/images/platforms/nuvemshop.svg',
    fallback: 'NS',
  },
  {
    name: 'Tray',
    description: 'E-commerce enterprise com customizações avançadas e integrações de ERP.',
    badge: 'E-commerce',
    image: '/assets/images/platforms/tray.svg',
    fallback: 'TR',
  },
  {
    name: 'Bagy',
    description: 'Loja + marketplace com integração de catálogo e customização de vitrine.',
    badge: 'Marketplace',
    image: '/assets/images/platforms/bagy.svg',
    fallback: 'BG',
  },
];

/* ==== PROJETOS ====
   Estrutura pensada para venda: problema → solução → resultado.
   `metrics` é o que separa portfólio júnior de sênior. Preencha com números reais. */
export const projects = [
  {
    id: 'loja-premium',
    category: 'E-commerce',
    name: 'Loja Virtual Premium',
    description:
      'Plataforma de e-commerce com checkout próprio, gestão de estoque em tempo real e dashboard administrativo.',
    problem: 'Checkout de terceiros derrubava a conversão e não dava visibilidade de estoque.',
    result: 'Conversão +32% e queda de 60% nas rupturas de estoque.',
    metrics: [
      { value: '+32%', label: 'Conversão' },
      { value: '1.2s', label: 'LCP' },
    ],
    tags: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    image: '/assets/images/projects/loja-premium.jpg',
    liveUrl: '',
    repoUrl: '',
    featured: true,
  },
  {
    id: 'plataforma-gestao',
    category: 'Web App',
    name: 'Plataforma de Gestão',
    description:
      'Aplicação para gestão de tarefas, clientes e relatórios, com autenticação e permissões por papel.',
    problem: 'Operação rodava em planilhas compartilhadas, sem histórico nem controle de acesso.',
    result: '4h por semana economizadas por usuário e auditoria completa de alterações.',
    metrics: [
      { value: '4h', label: 'Economia semanal' },
      { value: '99.9%', label: 'Uptime' },
    ],
    tags: ['React', 'TypeScript', 'Firebase'],
    image: '/assets/images/projects/plataforma-gestao.jpg',
    liveUrl: '',
    repoUrl: '',
    featured: true,
  },
  {
    id: 'landing-conversao',
    category: 'Landing Page',
    name: 'Landing Page de Conversão',
    description:
      'Página de captura com animação guiada por scroll, teste A/B e integração direta com o funil de vendas.',
    problem: 'Campanha paga trazia tráfego, mas a página perdia o lead antes do formulário.',
    result: 'Custo por lead reduzido em 41% no primeiro mês.',
    metrics: [
      { value: '-41%', label: 'Custo por lead' },
      { value: '98', label: 'Lighthouse' },
    ],
    tags: ['HTML', 'CSS', 'GSAP', 'Meta Ads'],
    image: '/assets/images/projects/landing-conversao.jpg',
    liveUrl: '',
    repoUrl: '',
    featured: false,
  },
  {
    id: 'automacao-n8n',
    category: 'Automação',
    name: 'Sistema de Automação',
    description:
      'Orquestração de processos com n8n integrando ERP, WhatsApp e planilhas, com tratamento de erro e retry.',
    problem: 'Pedidos eram transcritos à mão entre três sistemas, com erro humano frequente.',
    result: '1.400 execuções por mês sem nenhuma intervenção manual.',
    metrics: [
      { value: '1.4k', label: 'Execuções/mês' },
      { value: '0', label: 'Erros manuais' },
    ],
    tags: ['n8n', 'APIs REST', 'Webhooks', 'Docker'],
    image: '/assets/images/projects/automacao-n8n.jpg',
    liveUrl: '',
    repoUrl: '',
    featured: false,
  },
];

/* ==== SEO ==== */
export const seo = {
  siteUrl: 'https://devguz.com',
  ogImage: '/assets/images/og/og-image.jpg',
};
