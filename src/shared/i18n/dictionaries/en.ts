import type { Dictionary } from "./ru";

export const en: Dictionary = {
  nav: {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    contacts: "Contact",
  },
  tagline: ["living interfaces", "clean code", "fast UX"],
  hero: {
    indexLabel: "INDEX — PORTFOLIO",
    scrollHint: "Scroll down ↓",
    backToTop: "TOP",
  },
  about: {
    heading: "I build interfaces",
    headingAccent: "that work",
    lead: "I build fast, polished products — from idea to production.",
    services: [
      {
        title: "Turnkey frontend",
        text: "From markup to complex interactive modules, maps and integrations with third-party services.",
      },
      {
        title: "Backend",
        text: "Node.js and NestJS APIs, databases and integrations with external systems.",
      },
      {
        title: "Bots & automation",
        text: "Telegram bots and scripts that take repetitive routine off the team's plate.",
      },
    ],
    stats: {
      label: "Development experience",
      role: "developer",
      years: "3+ years of experience.",
      summary: "I build web applications — from the interface to the server logic.",
      now: "Now",
      stack: "Stack",
      moreAboutExperience: "More about my experience ↗",
    },
  },
  experience: {
    heading: "Experience",
    listLabel: "Work experience",
    present: "present",
  },
  projects: {
    sectionLabel: "Projects",
    featured: "Featured work",
    intro: "Projects I've worked on. Each one breaks down the problems and how they were solved.",
    empty: "Projects are coming soon.",
    back: "← Back",
    aboutProject: "About the project",
    cases: "Cases",
    contents: "Contents",
    contentsLabel: "Project contents",
  },
  contact: {
    heading: "Contact",
    lead: "Got a task? Write to me — we'll figure out how to solve it.",
    form: {
      name: "Your name",
      contact: "Telegram or email",
      message: "What needs to be done",
      submit: "Send",
      sending: "Sending…",
      sentTitle: "Request sent",
      sentText: "I'll read it and get back to you via the contact you provided.",
      sendAnother: "Send another one",
      rateLimited: "Too many requests, please try again later.",
      error: "Couldn't send. Try again or message me on Telegram.",
      consentPrefix: "I give",
      consentLink: "consent to the processing of my personal data",
      consentMiddle: "and have read the",
      privacyLink: "processing policy",
    },
  },
  footer: {
    privacy: "Privacy policy",
    consent: "Personal data consent",
    cookieSettings: "Cookie settings",
  },
  profile: {
    photoSoon: "Photo coming soon",
  },
  media: {
    carouselLabel: 'Case media "{title}", slide {index} of {total}',
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    slide: "Slide {index}",
    openFullscreen: "Open full screen",
    lightboxLabel: "{title}, image {index} of {total}",
    close: "Close",
    prevImage: "Previous image",
    nextImage: "Next image",
  },
  cookies: {
    text: "I use Yandex Metrica to understand how visitors use the site. It sets cookies. Is that OK?",
    privacy: "Learn more",
    accept: "Accept",
    decline: "Decline",
  },
  language: {
    label: "Language",
    ru: "RU",
    en: "EN",
  },
  metadata: {
    projectsTitle: "Featured work",
  },
};
