import type { Locale } from "@/shared/i18n/config";

/**
 * Privacy policy text. Paragraphs are separated by a blank line; a line
 * starting with "## " is a heading; single line breaks inside a paragraph are kept
 * (used for lists). Anything in [square brackets] is a fact only the owner knows
 * and must be filled in before the site goes public.
 */
export const privacyContent: Record<Locale, { title: string; body: string }> = {
  ru: {
    title: "Политика обработки персональных данных",
    body: `Редакция от 4 октября 2026 г.

## 1. Общие положения

Настоящая политика описывает, какие персональные данные собирает этот сайт, зачем, как они обрабатываются и защищаются, и какие права есть у вас как у субъекта персональных данных. Она подготовлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».

Оператор персональных данных: Тареев Даниил Андреевич, физическое лицо.
Сайт: https://tareev-daniil.ru.
Контакт для обращений по вопросам персональных данных: d_tareev@mail.ru.

Используя форму обратной связи на сайте, вы подтверждаете, что ознакомились с настоящей политикой. Отдельное согласие на обработку данных вы даёте, отметив соответствующий флажок в форме (текст согласия: страница «Согласие на обработку данных»).

## 2. Какие данные обрабатываются

При отправке формы обратной связи:
— имя, которое вы указали;
— контакт для ответа (Telegram или адрес электронной почты);
— текст вашего сообщения;
— дата и время отправки формы и отметка о том, что вы дали согласие на обработку данных.

Автоматически, при посещении сайта:
— технические данные, которые передаёт ваш браузер при любом обращении к серверу: IP-адрес, тип браузера и устройства, адрес запрашиваемой страницы, время запроса. Они попадают в журналы веб-сервера и используются только для обеспечения работы и безопасности сайта.

Только если вы нажали «Принять» в баннере cookie:
— данные, которые собирает сервис «Яндекс.Метрика»: сведения об устройстве и браузере, источник перехода, просмотренные страницы, действия на странице, приблизительное местоположение, идентификаторы в файлах cookie. Это обезличенная статистика посещаемости, я не получаю из неё вашего имени или контактов. Запись сессий (Вебвизор) не используется.

Оператор не собирает специальные категории персональных данных (о здоровье, убеждениях и т. п.), биометрические данные и данные несовершеннолетних сознательно.

## 3. Цели обработки

— ответить на ваше обращение и обсудить задачу, с которой вы пришли;
— обеспечить работу, безопасность и защиту сайта от злоупотреблений (в том числе от автоматических рассылок);
— понимать, как посетители пользуются сайтом, и улучшать его (только при вашем согласии на cookie).

Данные не используются для рекламных рассылок, не продаются и не передаются третьим лицам для их собственных целей.

## 4. Правовые основания

Обработка данных из формы обратной связи основана на вашем согласии (п. 1 ч. 1 ст. 6 Федерального закона № 152-ФЗ). Обработка данных Яндекс.Метрикой выполняется только при вашем согласии на cookie. Журналы веб-сервера ведутся в целях обеспечения безопасности сайта.

## 5. Как и где обрабатываются данные

Обработка включает сбор, запись, систематизацию, хранение, уточнение, использование, передачу (в случаях, описанных ниже), удаление и уничтожение данных. Часть операций выполняется с использованием средств автоматизации, поступившие заявки я читаю вручную.

Данные из формы хранятся в базе данных на сервере, расположенном на территории Российской Федерации. Доступ к ним есть только у оператора.

## 6. Передача данных третьим лицам

Данные не передаются третьим лицам, за исключением следующих случаев:
— Яндекс: при вашем согласии на cookie данные о посещении передаются сервису «Яндекс.Метрика» (ООО «Яндекс») и обрабатываются по правилам этого сервиса.
— Хостинг-провайдер, на серверах которого размещён сайт, технически обрабатывает данные в рамках предоставления инфраструктуры, но не имеет права использовать их для своих целей.
— Органы власти — только в случаях и порядке, прямо предусмотренных законодательством Российской Федерации.

## 7. Сроки хранения

Данные из формы обратной связи хранятся до достижения цели обработки (ответ на обращение и завершение связанной переписки), но не дольше 12 месяцев с момента получения, если не возникло иных договорённостей. Затем они удаляются. Журналы веб-сервера хранятся не дольше 30 дней. Данные Яндекс.Метрики хранятся на стороне Яндекса в сроки, установленные этим сервисом.

## 8. Файлы cookie

Сайт использует:
— технические cookie, которые нужны только для входа владельца в панель управления; посетителям они не выдаются;
— cookie «Яндекс.Метрики» — только после вашего согласия в баннере. До согласия они не устанавливаются, а скрипт Метрики не загружается;
— запись в локальном хранилище браузера (localStorage) о вашем выборе в баннере cookie.

Изменить выбор можно в любой момент: ссылка «Настройки cookie» внизу страницы. Также вы можете запретить или удалить cookie в настройках браузера, сайт при этом продолжит работать.

## 9. Ваши права

Вы вправе:
— получить информацию об обработке ваших данных и доступ к ним;
— потребовать уточнить, заблокировать или удалить данные, если они неполные, устаревшие, неточные или не нужны для заявленной цели;
— отозвать согласие на обработку в любой момент;
— обжаловать действия оператора в Роскомнадзоре или в суде.

Чтобы воспользоваться правами, напишите на d_tareev@mail.ru. Укажите имя и контакт, которые вы вводили в форме, чтобы я мог найти ваше обращение. Я отвечу в сроки, установленные законом (как правило, в течение 10 рабочих дней). Отозвать согласие можно тем же способом, данные будут удалены не позднее 30 дней со дня получения отзыва, если закон не требует их хранения.

## 10. Защита данных

Я принимаю разумные правовые, организационные и технические меры для защиты данных от неправомерного доступа, изменения и уничтожения: сайт работает по защищённому протоколу HTTPS, доступ к панели управления защищён паролем и ограничен одним пользователем, форма защищена от массовых отправок.

## 11. Изменение политики

Я могу обновлять эту политику. Актуальная версия всегда доступна на этой странице, дата редакции указана вверху. О существенных изменениях, затрагивающих ваши права, я сообщу на сайте.`,
  },
  en: {
    title: "Privacy policy",
    body: `Version of 4 October 2026

This is a convenience translation. The Russian version of this policy is the one that applies.

## 1. General

This policy describes which personal data this website collects, why, how it is processed and protected, and what rights you have as a data subject. It is drawn up in accordance with Russian Federal Law No. 152-FZ of 27 July 2006 "On Personal Data".

Data controller: Daniil Andreevich Tareev, an individual.
Website: https://tareev-daniil.ru.
Contact for personal data requests: d_tareev@mail.ru.

By using the contact form you confirm that you have read this policy. You give your separate consent to data processing by ticking the checkbox in the form (see the "Personal data consent" page).

## 2. Data processed

When you submit the contact form:
— the name you entered;
— your contact for a reply (Telegram or e-mail address);
— the text of your message;
— the date and time of submission and a record that you gave your consent.

Automatically, when you visit the site:
— technical data your browser sends with every request: IP address, browser and device type, the requested page, the time of the request. It ends up in web server logs and is used only to keep the site running and secure.

Only if you click "Accept" in the cookie banner:
— data collected by Yandex Metrica: device and browser details, referral source, pages viewed, on-page actions, approximate location, identifiers in cookies. This is anonymous traffic statistics; I do not get your name or contacts from it. Session recording (Webvisor) is not used.

I do not knowingly collect special categories of personal data (health, beliefs, etc.), biometric data, or data of minors.

## 3. Purposes

— to reply to your message and discuss the task you came with;
— to keep the site working and secure, including protection against automated abuse;
— to understand how visitors use the site and improve it (only with your cookie consent).

Data is not used for marketing mailings, is not sold, and is not passed to third parties for their own purposes.

## 4. Legal basis

Processing of contact form data is based on your consent (Art. 6(1)(1) of Federal Law No. 152-FZ). Yandex Metrica processes data only with your cookie consent. Web server logs are kept to ensure the security of the site.

## 5. How and where data is processed

Processing includes collection, recording, organising, storage, updating, use, transfer (in the cases described below), deletion and destruction. Some operations are automated; I read incoming messages manually.

Form data is stored in a database on a server located in the Russian Federation. Only the controller has access to it.

## 6. Disclosure to third parties

Data is not disclosed to third parties except in these cases:
— Yandex: with your cookie consent, visit data is passed to Yandex Metrica (Yandex LLC) and processed under that service's rules.
— The hosting provider whose servers host the site technically processes data as part of providing infrastructure but may not use it for its own purposes.
— Public authorities, only in the cases and manner expressly provided for by the law of the Russian Federation.

## 7. Retention

Contact form data is kept until the purpose of processing is achieved (replying to your request and finishing the related correspondence), but no longer than 12 months from receipt unless otherwise agreed. After that it is deleted. Web server logs are kept for no more than 30 days. Yandex Metrica data is kept by Yandex for the periods set by that service.

## 8. Cookies

The site uses:
— technical cookies needed only for the owner to sign in to the admin panel; visitors do not receive them;
— Yandex Metrica cookies, only after your consent in the banner. Before consent they are not set and the Metrica script is not loaded;
— a record in the browser's local storage (localStorage) of your choice in the cookie banner.

You can change your choice at any time with the "Cookie settings" link at the bottom of the page. You can also block or delete cookies in your browser settings; the site will keep working.

## 9. Your rights

You have the right to:
— obtain information about the processing of your data and access to it;
— require your data to be corrected, blocked or deleted if it is incomplete, outdated, inaccurate or not needed for the stated purpose;
— withdraw your consent at any time;
— complain about the controller's actions to Roskomnadzor or to a court.

To exercise your rights, write to d_tareev@mail.ru. Please give the name and contact you entered in the form so I can find your request. I will reply within the time set by law (generally within 10 business days). You can withdraw consent the same way; data will be deleted within 30 days of receiving the withdrawal unless the law requires it to be kept.

## 10. Data protection

I take reasonable legal, organisational and technical measures to protect data against unauthorised access, alteration and destruction: the site works over HTTPS, access to the admin panel is password-protected and limited to one user, and the form is protected against mass submissions.

## 11. Changes to this policy

I may update this policy. The current version is always available on this page, with its date at the top. I will announce material changes affecting your rights on the site.`,
  },
};
