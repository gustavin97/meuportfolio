/**
 * ==========================================
 * RENDER.JS — SEÇÕES GERADAS A PARTIR DOS DADOS
 * ==========================================
 * O index.html carrega apenas a casca semântica das seções.
 * O conteúdo vem de src/data/site.js e é injetado aqui, para
 * que atualizar o portfólio seja editar um objeto, não HTML.
 * ==========================================
 */

import {
  about,
  formations,
  navigation,
  platforms,
  profile,
  projects,
  socials,
  stats,
  techCategories,
  timeline,
} from '../data/site.js';
import { html, media, mount, raw } from '../utils/dom.js';

/* ==================== HEADER ==================== */

export function renderHeader() {
  const links = navigation.map(
    (item) => html`<a href="#${item.id}" class="nav-link" data-nav="${item.id}">${item.label}</a>`,
  );

  mount(
    '.header-content',
    html`
      <a href="#hero" class="header-logo" data-magnetic="0.2" aria-label="${profile.name} — início">
        <span class="header-logo-mark" aria-hidden="true"></span>
        ${profile.name}
      </a>

      <nav class="header-nav" aria-label="Navegação principal">
        ${raw(links.join(''))}
        <span class="nav-indicator" aria-hidden="true"></span>
      </nav>

      <a class="header-cta" href="#contact" data-magnetic="0.3">Vamos conversar</a>

      <button class="mobile-menu-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    `,
  );

  mount(
    '#mobile-menu',
    html`
      <nav aria-label="Navegação mobile">
        ${raw(
          navigation
            .map(
              (item, index) =>
                html`<a href="#${item.id}" class="mobile-nav-link" style="--i: ${raw(String(index))}">
                  <span class="mobile-nav-index">0${raw(String(index + 1))}</span>${item.label}
                </a>`,
            )
            .join(''),
        )}
      </nav>
      <div class="mobile-menu-footer">
        <a href="mailto:${profile.email}">${profile.email}</a>
      </div>
    `,
  );
}

/* ==================== HERO ==================== */

export function renderHero() {
  mount(
    '.hero-content',
    html`
      ${profile.available
        ? raw(html`
            <p class="hero-badge" data-reveal="fade">
              <span class="hero-badge-dot" aria-hidden="true"></span>${profile.availabilityLabel}
            </p>
          `)
        : ''}

      <h1 class="hero-title">
        <span class="hero-title-primary" data-split="chars">${profile.name}</span>
        <span class="hero-title-secondary" data-scramble data-reveal="up" data-reveal-delay="0.35">${profile.role}</span>
      </h1>

      <p class="hero-subtitle" data-reveal="up" data-reveal-delay="0.45">${profile.tagline}</p>
      <p class="hero-description" data-reveal="up" data-reveal-delay="0.55">${profile.description}</p>

      <div class="hero-buttons" data-reveal="up" data-reveal-delay="0.65">
        <a href="#projects" class="btn btn-primary" data-magnetic="0.3">
          <span>Ver projetos</span>
        </a>
        <a href="#contact" class="btn btn-ghost" data-magnetic="0.3">
          <span>Entrar em contato</span>
        </a>
      </div>

      <dl class="hero-stats" data-reveal="fade" data-reveal-delay="0.8">
        ${raw(
          stats
            .map(
              (stat) => html`
                <div class="hero-stat">
                  <dt class="hero-stat-value">
                    <span data-counter="${String(stat.value)}" data-counter-suffix="${stat.suffix}"
                      >0${stat.suffix}</span
                    >
                  </dt>
                  <dd class="hero-stat-label">${stat.label}</dd>
                </div>
              `,
            )
            .join(''),
        )}
      </dl>
    `,
  );
}

/* ==================== SOBRE ==================== */

export function renderAbout() {
  mount(
    '#about .about-container',
    html`
      <div class="about-content">
        <h3 data-reveal="up">${about.heading}</h3>
        ${raw(
          about.paragraphs
            .map(
              (text, i) =>
                html`<p data-reveal="up" data-reveal-delay="${raw(String(0.1 * (i + 1)))}">${text}</p>`,
            )
            .join(''),
        )}

        <div class="about-actions" data-reveal="up" data-reveal-delay="0.4">
          <a class="btn btn-ghost" href="${profile.resumeUrl}" download data-magnetic="0.25">
            <span>Baixar currículo</span>
          </a>
          <span class="about-location">${profile.location}</span>
        </div>
      </div>

      <div class="about-gallery" data-reveal="scale" data-reveal-delay="0.2">
        ${raw(
          about.gallery
            .map(
              (item) => html`
                <figure class="gallery-item">
                  ${raw(
                    media({
                      src: item.image,
                      alt: item.alt,
                      fallback: item.label,
                      ratio: '3/4',
                      className: 'media--parallax',
                    }),
                  )}
                </figure>
              `,
            )
            .join(''),
        )}
      </div>
    `,
  );
}

/* ==================== JORNADA ==================== */

export function renderTimeline() {
  mount(
    '#timeline .timeline-container',
    html`
      <ol class="timeline">
        <span class="timeline-line" aria-hidden="true">
          <span class="timeline-progress"></span>
        </span>
        ${raw(
          timeline
            .map(
              (item) => html`
                <li class="timeline-item">
                  <span class="timeline-marker" aria-hidden="true"></span>
                  <div class="timeline-content" data-tilt="4">
                    <span class="timeline-date">${item.year}</span>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                  </div>
                </li>
              `,
            )
            .join(''),
        )}
      </ol>
    `,
  );
}

/* ==================== FORMAÇÕES ==================== */

export function renderFormations() {
  mount(
    '#formations .formations-grid',
    html`
      ${raw(
        formations
          .map(
            (item, i) => html`
              <article
                class="formation-card"
                data-skew
                data-reveal="up"
                data-reveal-delay="${raw(String(i * 0.08))}"
                data-tilt="6"
              >
                ${raw(media({ src: item.image, alt: item.name, fallback: item.fallback, ratio: '16/10' }))}
                <div class="formation-content">
                  <h3 class="formation-name">${item.name}</h3>
                  <p class="formation-institution">${item.institution}</p>
                  <p class="formation-description">${item.description}</p>
                  <span class="badge badge-${item.status}">${item.badge}</span>
                </div>
              </article>
            `,
          )
          .join(''),
      )}
    `,
  );
}

/* ==================== TECNOLOGIAS ==================== */

export function renderTechnologies() {
  mount(
    '#technologies .technologies-container',
    html`
      ${raw(
        techCategories
          .map(
            (category) => html`
              <div class="tech-category accent-${category.accent}">
                <h3 class="tech-category-title" data-reveal="left">${category.title}</h3>
                <ul class="tech-grid">
                  ${raw(
                    category.items
                      .map(
                        (item) => html`
                          <li class="tech-item" data-cursor="hover">
                            <!-- O Lucide substitui o elemento com [data-lucide] pelo <svg>,
                                 então ele fica aninhado: a caixa .tech-icon precisa sobreviver. -->
                            <span class="tech-icon" aria-hidden="true">
                              <span data-lucide="${item.icon}"></span>
                            </span>
                            <span class="tech-name">${item.name}</span>
                          </li>
                        `,
                      )
                      .join(''),
                  )}
                </ul>
              </div>
            `,
          )
          .join(''),
      )}
    `,
  );
}

/* ==================== PLATAFORMAS ==================== */

export function renderPlatforms() {
  mount(
    '#platforms .platforms-grid',
    html`
      ${raw(
        platforms
          .map(
            (item, i) => html`
              <article
                class="platform-card"
                data-skew
                data-reveal="up"
                data-reveal-delay="${raw(String(i * 0.07))}"
                data-tilt="7"
              >
                <div class="platform-logo">
                  ${raw(media({ src: item.image, alt: item.name, fallback: item.fallback, ratio: '1/1' }))}
                </div>
                <div class="platform-content">
                  <h3 class="platform-name">${item.name}</h3>
                  <p class="platform-description">${item.description}</p>
                  <span class="badge">${item.badge}</span>
                </div>
              </article>
            `,
          )
          .join(''),
      )}
    `,
  );
}

/* ==================== PROJETOS ==================== */

function projectCard(project, index) {
  const links = [];
  if (project.liveUrl) {
    links.push(
      html`<a class="project-link" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer">
        Ver ao vivo <span data-lucide="arrow-up-right" aria-hidden="true"></span>
      </a>`,
    );
  }
  if (project.repoUrl) {
    links.push(
      html`<a class="project-link project-link-ghost" href="${project.repoUrl}" target="_blank" rel="noopener noreferrer">
        Código <span data-lucide="github" aria-hidden="true"></span>
      </a>`,
    );
  }

  return html`
    <article
      class="project-card"
      data-index="${raw(String(index + 1))}"
      data-project-id="${project.id}"
      data-tilt="5"
      data-skew
    >
      <div class="project-media">
        ${raw(
          media({
            src: project.image,
            alt: project.name,
            fallback: project.name,
            ratio: '16/10',
            className: 'media--parallax',
          }),
        )}
        <span class="project-number" aria-hidden="true">0${raw(String(index + 1))}</span>
        <!-- Botão de verdade (não o card inteiro clicável): mantém
             o card navegável por teclado e anunciável por leitor de tela. -->
        <button class="project-open" aria-label="Abrir estudo de caso: ${project.name}">
          <span class="project-open-label" aria-hidden="true">Ver estudo de caso</span>
        </button>
      </div>

      <div class="project-content">
        <span class="project-category">${project.category}</span>
        <h3 class="project-name">${project.name}</h3>
        <p class="project-description">${project.description}</p>

        <dl class="project-metrics">
          ${raw(
            (project.metrics ?? [])
              .map(
                (metric) => html`
                  <div class="project-metric">
                    <dt class="project-metric-value">${metric.value}</dt>
                    <dd class="project-metric-label">${metric.label}</dd>
                  </div>
                `,
              )
              .join(''),
          )}
        </dl>

        <ul class="project-tags">
          ${raw(project.tags.map((tag) => html`<li class="project-tag">${tag}</li>`).join(''))}
        </ul>

        ${links.length
          ? raw(html`<div class="project-links">${raw(links.join(''))}</div>`)
          : raw(html`<p class="project-links-empty">Estudo de caso em breve</p>`)}
      </div>
    </article>
  `;
}

export function renderProjects() {
  mount(
    '#projects .projects-wrapper',
    html`
      <div class="projects-viewport">
        <div class="projects-track">
          ${raw(projects.map((project, i) => projectCard(project, i)).join(''))}
        </div>
      </div>
      <div class="projects-progress" aria-hidden="true">
        <span class="projects-progress-bar"></span>
      </div>
    `,
  );
}

/* ==================== CONTATO ==================== */

export function renderContactInfo() {
  mount(
    '#contact .contact-info',
    html`
      <a class="contact-info-item" href="https://wa.me/${profile.phoneRaw}" target="_blank" rel="noopener noreferrer">
        <span class="contact-info-title">WhatsApp</span>
        <span class="contact-info-value">${profile.phone}</span>
      </a>
      <a class="contact-info-item" href="mailto:${profile.email}">
        <span class="contact-info-title">E-mail</span>
        <span class="contact-info-value">${profile.email}</span>
      </a>
      <div class="contact-info-item">
        <span class="contact-info-title">Localização</span>
        <span class="contact-info-value">${profile.location}</span>
      </div>
    `,
  );
}

/* ==================== FOOTER ==================== */

export function renderFooter() {
  mount(
    'footer .footer-content',
    html`
      <div class="footer-brand">
        <p class="footer-logo">${profile.name}</p>
        <p class="footer-tagline">${profile.tagline}</p>
        <div class="social-links">
          ${raw(
            socials
              .map(
                (social) => html`
                  <a href="${social.url}" target="_blank" rel="noopener noreferrer" aria-label="${social.label}" data-magnetic="0.4">
                    <span data-lucide="${social.icon}" aria-hidden="true"></span>
                  </a>
                `,
              )
              .join(''),
          )}
        </div>
      </div>

      <div class="footer-section">
        <h3>Navegação</h3>
        <div class="footer-links">
          ${raw(navigation.map((item) => html`<a href="#${item.id}">${item.label}</a>`).join(''))}
        </div>
      </div>

      <div class="footer-section">
        <h3>Contato</h3>
        <div class="footer-links">
          <a href="tel:+${profile.phoneRaw}">${profile.phone}</a>
          <a href="mailto:${profile.email}">${profile.email}</a>
          <span>${profile.location}</span>
        </div>
      </div>
    `,
  );
}

/* ==================== ORQUESTRADOR ==================== */

export function renderAll() {
  renderHeader();
  renderHero();
  renderAbout();
  renderTimeline();
  renderFormations();
  renderTechnologies();
  renderPlatforms();
  renderProjects();
  renderContactInfo();
  renderFooter();
}
