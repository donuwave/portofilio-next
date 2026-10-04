import type { Locale } from "@/shared/i18n/config";

/**
 * Text of the consent to personal data processing (a separate document, per 152-FZ).
 * Same format as privacy.ts; [square brackets] mark facts only the owner knows.
 */
export const consentContent: Record<Locale, { title: string; body: string }> = {
  ru: {
    title: "Согласие на обработку персональных данных",
    body: `Редакция от 4 октября 2026 г.

Отмечая флажок «Я даю согласие на обработку персональных данных» в форме обратной связи на сайте https://tareev-daniil.ru и отправляя форму, я свободно, своей волей и в своём интересе даю согласие на обработку моих персональных данных на указанных ниже условиях. Согласие даётся в соответствии со ст. 9 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных».

## Оператор

Тареев Даниил Андреевич, физическое лицо.
Контакт для обращений: d_tareev@mail.ru.

## Цель обработки

Рассмотрение моего обращения, отправленного через форму, и связь со мной по указанному контакту для обсуждения задачи.

## Какие данные обрабатываются

— имя;
— контакт для связи (Telegram или адрес электронной почты);
— текст сообщения;
— дата и время отправки формы и отметка о данном согласии.

Другие категории персональных данных, включая специальные и биометрические, не обрабатываются.

## Действия с данными

Сбор, запись, систематизация, хранение, уточнение, использование, блокирование, удаление и уничтожение. Обработка осуществляется как с использованием средств автоматизации, так и без них.

## Передача данных

Мои данные не передаются третьим лицам, за исключением случаев, прямо предусмотренных законодательством Российской Федерации. Технически данные хранятся на сервере хостинг-провайдера, который не вправе использовать их в своих целях.

## Срок действия согласия

Согласие действует с момента отправки формы до достижения цели обработки, но не дольше 12 месяцев, либо до его отзыва, в зависимости от того, что наступит раньше.

## Как отозвать согласие

Согласие можно отозвать в любой момент, написав на d_tareev@mail.ru и указав имя и контакт, которые вводились в форме. После получения отзыва оператор прекращает обработку и удаляет данные не позднее 30 дней, если законом не предусмотрено иное. Отзыв согласия не влияет на законность обработки, выполненной до отзыва.

## Подтверждение

Я подтверждаю, что ознакомлен(а) с Политикой обработки персональных данных, размещённой на сайте, мне разъяснены мои права как субъекта персональных данных, и я понимаю последствия отзыва согласия.`,
  },
  en: {
    title: "Consent to personal data processing",
    body: `Version of 4 October 2026

This is a convenience translation. The Russian version of this consent is the one that applies.

By ticking the "I give consent to the processing of my personal data" box in the contact form on https://tareev-daniil.ru and submitting the form, I freely, of my own will and in my own interest give consent to the processing of my personal data on the terms below. The consent is given under Art. 9 of Russian Federal Law No. 152-FZ of 27 July 2006 "On Personal Data".

## Controller

Daniil Andreevich Tareev, an individual.
Contact for requests: d_tareev@mail.ru.

## Purpose of processing

Handling my message sent through the form and contacting me at the contact I provided to discuss my task.

## Data processed

— name;
— contact (Telegram or e-mail address);
— message text;
— the date and time the form was submitted and a record of this consent.

No other categories of personal data, including special and biometric categories, are processed.

## Actions with data

Collection, recording, organising, storage, updating, use, blocking, deletion and destruction. Processing is carried out both with and without automation.

## Disclosure

My data is not disclosed to third parties, except as expressly provided by the law of the Russian Federation. Technically the data is stored on the server of a hosting provider, which may not use it for its own purposes.

## Term of the consent

The consent is valid from the moment the form is submitted until the purpose of processing is achieved, but no longer than 12 months, or until it is withdrawn, whichever comes first.

## How to withdraw consent

You can withdraw consent at any time by writing to d_tareev@mail.ru and stating the name and contact entered in the form. After receiving the withdrawal the controller stops processing and deletes the data within 30 days, unless the law provides otherwise. Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal.

## Confirmation

I confirm that I have read the Privacy Policy published on the site, my rights as a data subject have been explained to me, and I understand the consequences of withdrawing consent.`,
  },
};
