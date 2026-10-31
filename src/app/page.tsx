import { HeroTypewriter } from '@/components/hero-typewriter';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FooterNavigation } from '@/components/footer-navigation';
import { Header } from '@/components/header';
import { ContactForm } from '@/components/contact-form';
import { Preview } from '@/components/sections/preview';
import { Reveal } from '@/components/reveal';
import { briefConfig } from '@/lib/brief-config';
import { site, money } from '@/lib/site';
import { portfolio, homeSteps, homeFaq } from '@/lib/home';
import './workshop.css';
import './home.css';

const title = 'Создание сайтов под ключ от 7 000 ₽ — за 2 дня';
const description = 'Создадим лендинг или сайт-визитку для бизнеса. Современный дизайн, адаптация под телефон, понятная стоимость. Разработка типового сайта до 2 дней. Работаем по всей России.';
export const metadata: Metadata = {
 title, description,
 alternates: site.url ? { canonical: '/' } : undefined,
 openGraph: { title, description, type: 'website', locale: 'ru_RU', ...(site.url ? { url: site.url } : {}) },
};
const reasons = [
 ['Всё важное — по одному адресу', 'Клиенту не нужно искать цены в ленте, а адрес — в старых публикациях. Услуги, условия и контакты собраны вместе.'],
 ['Предложение легко понять', 'Человек видит, что вы делаете, кому это подходит и чем отличается ваше предложение. Можно спокойно изучить детали.'],
 ['Связаться проще', 'Позвонить, написать или оставить заявку можно прямо на сайте. Следующий шаг виден и с компьютера, и с телефона.'],
 ['Есть куда вести рекламу', 'Собственная страница помогает рассказать о конкретном предложении тем, кто пришёл из рекламы или поиска.'],
];
const formats = [
 { title: 'Лендинг под ключ', text: 'Одна страница, которая последовательно раскрывает ваше предложение.', audience: 'Для конкретной услуги, продукта или рекламной кампании.', project: portfolio[2], href: '#contacts', action: 'Обсудить лендинг' },
 { title: 'Сайт-визитка', text: 'Главное о компании или специалисте: услуги, подход и контакты.', audience: 'Для небольшого бизнеса и частных специалистов.', project: portfolio[1], href: '#contacts', action: 'Обсудить сайт-визитку' },
 { title: 'Готовый сайт из каталога', text: 'Вы выбираете дизайн, мы заменяем тексты, изображения и логотип.', audience: 'Для тех, кто хочет начать с готовой структуры.', project: portfolio[0], href: '/catalog', action: 'Выбрать шаблон' },
];
export default function Home() {
 const config = briefConfig();
 return <>
  <Link className="skip-link" href="#main">К содержимому</Link>
  <div id="top" className="shell home-shell"><Header/>
   <main id="main">
    <section className="hero hero-workbench" aria-labelledby="hero-title">
     <div className="hero-intro"><h1 id="hero-title">Создадим современный сайт для вашего бизнеса <HeroTypewriter/></h1>
      <div className="hero-description"><p>Красивый, быстрый и удобный сайт для ваших клиентов. Без сложных технических вопросов, долгого ожидания и лишних расходов.</p>
       <div className="actions"><Link className="button" href="#contacts">Получить расчёт сайта</Link><Link className="button hero-works-button" href="#projects">Посмотреть работы</Link></div>
       <p className="fine-print">До двух дней — для стандартных проектов после согласования требований, получения материалов и предоплаты.</p>
      </div>
     </div><div className="hero-stage"><Preview/></div>
    </section>
    <section className="section principles" id="why"><h2>Ваш бизнес заслуживает <span style={{ color: 'var(--accent)' }}>большего</span>, чем просто страница в соцсетях</h2><div className="principle-sheets">{reasons.map(([title,text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="section services-section" id="services"><div className="section-heading"><h2>Подберём сайт под вашу задачу, а не заставим переплачивать за лишнее</h2></div><div className="services">{formats.map(format => <article className="service" key={format.title}><div className="service-title"><h3>{format.title}</h3><p>{format.audience}</p></div><div className="service-example"><Image src={format.project.image} alt={`Пример оформления: демо «${format.project.name}»`} width={1440} height={960} sizes="(max-width: 760px) 85vw, 30vw"/></div><div className="service-offer"><p>{format.text}</p><Link className="text-link" href={format.href}>{format.action}</Link></div></article>)}</div></section>
    <section className="section projects-section" id="projects"><div className="section-heading"><h2>Не представляйте будущий сайт. Посмотрите, как он работает</h2><div className="projects-catalog-intro"><p>Демонстрационные проекты студии: разные характеры, ниши и способы рассказать о бизнесе.</p><Link className="text-link" href="/catalog">Все дизайны в каталоге</Link></div></div><div className="projects">{portfolio.map(project => <article className={`project project-${project.id}`} key={project.id}><div className="project-heading"><h3>{project.name}</h3><p>{project.category}<br/>{project.demo ? 'Демо-проект' : 'Клиентский проект'}</p></div><Link className="project-picture" href={project.detailHref || project.href} aria-label={`Посмотреть демо «${project.name}»`}><Image src={project.image} alt={`Демонстрационный сайт «${project.name}»: ${project.category}`} width={1440} height={960} sizes="(max-width: 760px) 90vw, 75vw"/></Link><div className="project-meta"><p>{project.description}</p><Link className="text-link" href={project.detailHref || project.href}>Посмотреть проект</Link></div></article>)}</div></section>
    <section className="section pricing-section" id="pricing"><div className="section-heading"><h2>Стоимость известна заранее. Вы понимаете, за что платите</h2></div><div className="pricing-options"><article><h3>Готовый шаблон</h3><p className="price-value">{money(site.catalogPrice)}</p><p>Текущая стоимость адаптации в каталоге. Цена фиксируется выбранным шаблоном.</p><ul><li>Замена текстов и изображений</li><li>Ваш логотип и контакты</li><li>Сохранение дизайна и структуры</li></ul><Link className="text-link" href="/catalog">Посмотреть шаблоны и цены</Link></article><article><h3>Индивидуальный лендинг</h3><p className="price-value">{money(site.landingPrice.min).replace(' ₽','')}–{money(site.landingPrice.max)}</p><p>Ориентир для стандартного проекта. Итоговая цена зависит от согласованного объёма.</p><ul><li>Структура под ваше предложение</li><li>Индивидуальное оформление</li><li>Адаптация под разные экраны</li></ul><Link className="button" href="#contacts">Получить расчёт сайта</Link></article></div><div className="hosting-note"><p>Дополнительные задачи — отдельно</p><p>Домен и хостинг оплачиваются отдельно. Размещение на хостинге клиента — от {money(site.hosting)}. Совместимость, новые функции и переработку шаблона согласуем до начала работы.</p></div></section>
    <section className="section approach-section" id="approach"><div className="section-heading"><h2>Мы убрали лишние процессы. <span style={{ color: 'var(--accent)' }}>Сохранили высокую планку качества</span></h2><p>Автоматизация, современные инструменты и искусственный интеллект помогают ускорять повторяющиеся задачи. Решения и готовый результат проверяет команда.</p></div><div className="approach-points">{[['Быстрая разработка','Используем отлаженную основу и инструменты, чтобы уделить время содержанию, интерфейсу и вашей задаче.'],['Понятный процесс','Один менеджер собирает вопросы и обратную связь. Объём, стоимость и срок согласуем заранее.'],['Проверка перед передачей','Проверяем адаптивность, ссылки, контактные элементы и согласованный функционал.']].map(([title,text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="section included-section" id="included"><div><h2>Получаете не просто красивую страницу, <span style={{ color: 'var(--accent)' }}>а готовый сайт</span></h2><p>Стандартный состав фиксируем в предложении до начала разработки.</p></div><div><ul className="included-list">{['Адаптивный интерфейс для телефона, планшета и компьютера','Современное оформление','Понятная структура','Контактные элементы и согласованный функционал','Базовая SEO-подготовка','Проверка корректности работы','Проверка сайта на соответствие требованиям законодательства','Передача готовых файлов после оплаты'].map(item => <li key={item}>{item}</li>)}</ul><aside className="included-extra"><h3>По отдельной договорённости</h3><p>Подготовка материалов, дополнительные функции, размещение и сопровождение. Полноценное SEO-продвижение в базовую разработку не входит.</p></aside></div></section>
    <section className="section process" id="process"><div className="process-intro"><h2>От вашей идеи до готового <span style={{ whiteSpace: 'nowrap' }}>сайта —</span> <span style={{ color: 'var(--accent)' }}>четыре шага</span></h2><p>Все вопросы и обратная связь проходят через менеджера. Он ведёт проект от заявки до передачи; разработчик занимается сайтом.</p></div><ol className="steps">{homeSteps.map(([title,text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
    <section className="section payment-section" id="payment"><h2><span style={{ color: 'var(--accent)' }}>Сначала увидите результат</span>. Затем завершите оплату</h2><div className="payment-copy"><p className="payment-lead">До разработки согласуем цену, состав работ и предоплату. Дополнительные задачи обсуждаем отдельно.</p><p>После предоплаты и получения материалов начинаем работу. Менеджер покажет готовый сайт по ссылке — вы сможете спокойно его проверить.</p><p>Включён один консолидированный пакет правок в согласованном объёме. Ошибки исполнителя исправляем отдельно от этого пакета. После приёмки и окончательного расчёта передадим файлы и инструкцию запуска.</p></div></section>
    <section className="section about about-manifesto" id="about" aria-labelledby="about-title"><div className="about-story"><p className="about-label">О студии Сайтика</p><h2 id="about-title">За вашим сайтом <span style={{ color: 'var(--accent)' }}>стоит команда</span>, а не безликий генератор</h2><p className="about-lead">Вы знаете своё дело. Мы помогаем рассказать о нём так, чтобы вас поняли и могли связаться.</p><p className="about-detail">Начинаем с того, что нужно вашему клиенту. Используем современные инструменты, внимательно собираем детали и проверяем результат перед передачей.</p><Link href="/blog" className="text-link">О дизайне и запуске — в блоге</Link></div><div className="about-perspective"><p className="about-perspective-title">На сайте должно быть ясно:</p><ol><li><span>Что вы предлагаете.</span></li><li><span>Почему вам можно доверять.</span></li><li><span>Как сделать первый шаг.</span></li></ol><p className="about-signoff">Каждый блок помогает ответить на один из этих вопросов.</p></div></section>
    <section className="section faq" id="faq"><h2>Что ещё важно знать перед заказом?</h2><div className="faq-list">{homeFaq.map(([question,answer]) => <details key={question}><summary>{question}<span className="faq-plus" aria-hidden="true"/></summary><p>{answer}</p></details>)}</div></section>
    <section className="contact section" id="contacts" aria-labelledby="contact-title"><span id="brief" className="legacy-anchor" aria-hidden="true"/><div><h2 id="contact-title">Расскажите о своём бизнесе — <span style={{ color: 'var(--accent)' }}>подберём подходящий сайт</span></h2><p className="contact-intro">Оставьте телефон. Менеджер уточнит задачу, поможет с форматом и согласует стоимость.</p></div><div className="contact-body"><ContactForm enabled={config.enabled} policyUrl={config.policyUrl}/></div></section>
   </main><footer><FooterNavigation/><div className="footer-top"><p>Сайты для небольших дел<br/>и больших планов.</p><Link href="#faq">Вопросы и ответы</Link><Link href="#top">Наверх</Link></div><Link className="footer-name" href="#top">{site.name}</Link><p className="footer-bottom">© {new Date().getFullYear()} {site.name}</p></footer><Reveal/>
  </div>
 </>;
}
