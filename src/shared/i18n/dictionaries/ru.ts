export const ru = {
  nav: {
    about: "Обо мне",
    experience: "Опыт",
    projects: "Проекты",
    contacts: "Контакты",
  },
  tagline: ["живые интерфейсы", "чистый код", "быстрый UX"],
  hero: {
    indexLabel: "INDEX — ПОРТФОЛИО",
    scrollHint: "Листай вниз ↓",
    backToTop: "НАВЕРХ",
  },
  about: {
    heading: "Создаю интерфейсы,",
    headingAccent: "которые работают",
    lead: "Разрабатываю быстрые, аккуратные продукты — от идеи до продакшена.",
    services: [
      {
        title: "Фронтенд под ключ",
        text: "От вёрстки до сложных интерактивных модулей, карт и интеграций со сторонними сервисами.",
      },
      {
        title: "Серверная часть",
        text: "API на Node.js и NestJS, работа с базами данных и внешними системами.",
      },
      {
        title: "Боты и автоматизация",
        text: "Telegram-боты и скрипты, которые снимают с команды повторяющуюся рутину.",
      },
    ],
    stats: {
      label: "Опыт разработки",
      role: "разработчик",
      years: "3+ года опыта.",
      summary: "Разрабатываю веб-приложения — от интерфейса до серверной логики.",
      now: "Сейчас",
      stack: "Стек",
      moreAboutExperience: "Подробнее об опыте ↗",
    },
  },
  experience: {
    heading: "Опыт",
    listLabel: "Опыт работы",
    present: "наст. время",
  },
  projects: {
    sectionLabel: "Проекты",
    featured: "Избранные работы",
    intro: "Проекты, над которыми я работал. Внутри каждого — разбор задач и того, как они решены.",
    empty: "Скоро здесь появятся проекты.",
    back: "← Назад",
    aboutProject: "О проекте",
    cases: "Кейсы",
    contents: "Содержание",
    contentsLabel: "Содержание проекта",
  },
  contact: {
    heading: "Контакты",
    lead: "Есть задача? Напишите — обсудим, как её решить.",
    form: {
      name: "Как вас зовут",
      contact: "Telegram или почта",
      message: "Что нужно сделать",
      submit: "Отправить",
      sending: "Отправляю…",
      sentTitle: "Заявка отправлена",
      sentText: "Прочитаю и свяжусь с вами по указанному контакту.",
      sendAnother: "Отправить ещё одну",
      rateLimited: "Слишком много заявок, попробуйте позже.",
      error: "Не получилось отправить. Попробуйте ещё раз или напишите в Telegram.",
      consentPrefix: "Я даю",
      consentLink: "согласие на обработку персональных данных",
      consentMiddle: "и ознакомлен(а) с",
      privacyLink: "политикой обработки",
    },
  },
  footer: {
    privacy: "Политика обработки данных",
    consent: "Согласие на обработку данных",
    cookieSettings: "Настройки cookie",
  },
  profile: {
    photoSoon: "Фото скоро",
  },
  media: {
    carouselLabel: "Медиа кейса «{title}», слайд {index} из {total}",
    prevSlide: "Предыдущий слайд",
    nextSlide: "Следующий слайд",
    slide: "Слайд {index}",
    openFullscreen: "Открыть на весь экран",
    lightboxLabel: "{title}, изображение {index} из {total}",
    close: "Закрыть",
    prevImage: "Предыдущее изображение",
    nextImage: "Следующее изображение",
  },
  cookies: {
    text: "Я использую Яндекс.Метрику, чтобы понимать, как посетители пользуются сайтом. Она ставит cookie. Согласны?",
    privacy: "Подробнее",
    accept: "Принять",
    decline: "Отказаться",
  },
  language: {
    label: "Язык",
    ru: "RU",
    en: "EN",
  },
  metadata: {
    projectsTitle: "Избранные работы",
  },
};

type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? Widen<U>[] : { [K in keyof T]: Widen<T[K]> };

/** Shape every dictionary must have; each locale file is checked against it. */
export type Dictionary = Widen<typeof ru>;
