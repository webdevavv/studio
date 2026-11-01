import { MobileCardSlider } from './mobile-card-slider';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Header } from './header';
import { FooterNavigation } from './footer-navigation';
import { ContactForm } from './contact-form';
import { LinkButton } from './ui/link-button';
import { Reveal } from './reveal';
import { PortfolioCard } from './portfolio-card';
import { portfolioProjects } from '@/lib/portfolio';
import { briefConfig } from '@/lib/brief-config';
import { serviceOffers } from '@/lib/commercial';
import { site } from '@/lib/site';
import '@/app/commercial.css';

type Breadcrumb = { label: string; href?: string };
type RequestContext = { source: 'services' | 'prices' | 'portfolio'; service?: 'landing-page' | 'business-card'; projectSlug?: string };

export function PageShell({ breadcrumbs, children }: { breadcrumbs: Breadcrumb[]; children: ReactNode }) {
 const base = site.url.replace(/\/$/, '');
 const items = [{ label: 'Главная', href: '/' }, ...breadcrumbs];
 const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.label, ...(item.href ? { item: `${base}${item.href}` } : {}) })) };
 return <><Link className="skip-link" href="#main">К содержимому</Link><div className="shell commercial-shell" id="top"><Header home={false} requestHref="#request"/>
  <main className="commercial-page" id="main">
   {base && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}/>} 
   <nav className="commercial-breadcrumbs" aria-label="Хлебные крошки"><ol>{items.map((item, i) => <li key={i}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>
   {children}
  </main><footer className="commercial-footer"><FooterNavigation/><Link href="/" className="logo">{site.name}</Link><p>Сайты для малого бизнеса по всей России.</p><Link href="/privacy">Конфиденциальность</Link></footer>
  <Reveal selector=".commercial-intro h1,.commercial-intro p,.commercial-section>h2,.commercial-feature,.commercial-points>*,.commercial-process li,.commercial-faq details,.portfolio-card,.commercial-request h2"/>
 </div></>;
}
export function PageIntro({ title, description, children, aside, variant = 'default' }: { title: ReactNode; description: ReactNode; children?: ReactNode; aside?: ReactNode; variant?: string }) {
 return <section className={`commercial-intro commercial-intro--${variant}`} aria-labelledby="page-title"><div><h1 id="page-title">{title}</h1><p>{description}</p>{children}</div>{aside && <aside>{aside}</aside>}</section>;
}
export function Section({ title, id, children, className = '' }: { title: string; id?: string; children: ReactNode; className?: string }) {
 return <section className={`commercial-section ${className}`} id={id}><h2>{title}</h2>{children}</section>;
}
export function ServiceCards() {
 return <div className="commercial-offers">{serviceOffers.map(offer => <article className="commercial-feature" key={offer.href}><h3><Link href={offer.href}>{offer.title}</Link></h3><p>{offer.description}</p><strong className="commercial-price">{offer.price}</strong><ul>{offer.points.map(point => <li key={point}>{point}</li>)}</ul><LinkButton href={offer.href}>Подробнее</LinkButton></article>)}</div>;
}
export function IncludedWork({ legal = false }: { legal?: boolean }) {
 return <MobileCardSlider className="commercial-points included-work-track" label="Что входит в разработку">{[
  ['Структура и оформление', 'Располагаем информацию в понятном порядке. Для индивидуального сайта согласуем дизайн, для готового — сохраняем выбранный макет.'],
  ['Адаптивная вёрстка', 'Подстраиваем страницы под телефон, планшет и компьютер. Проверяем читаемость и доступность основных действий.'],
  ['Контактные элементы', 'Размещаем согласованные контакты и ссылки для обращения. Формы и внешние сервисы включаем по утверждённому заданию.'],
  ['Базовая SEO-подготовка', 'Настраиваем заголовки и метаданные страниц, структуру документа и описания изображений. Продвижение обсуждается отдельно.'],
  ['Проверка работы', 'Проверяем ссылки, адаптивность и согласованные функции. Показываем результат до окончательного расчёта.'],
  ['Один пакет правок', 'Собираем ваши замечания одним списком в рамках утверждённой задачи. Новые пожелания оцениваем отдельно.'],
  ...(legal ? [['Законодательство и материалы', 'До запуска согласуем размещение необходимых правовых документов и элементов согласия, если сайт собирает персональные данные. Тексты документов и права на фотографии, логотип и другие материалы подтверждает заказчик. Юридическую подготовку документов и дополнительные технические настройки обсуждаем отдельно.']] : []),
 ].map(([title, text]) => <article key={title}><h3>{title}</h3>{title === 'Законодательство и материалы' ? <><p className="included-legal-desktop">{text}</p><p className="included-legal-mobile">Согласуем документы и согласия для сбора данных. Тексты и права на материалы подтверждаете вы. Юридическая подготовка — отдельно.</p></> : <p>{text}</p>}</article>)}</MobileCardSlider>;
}
export function WorkSamples({ type, excludeSlug, limit = 3, navigationButtons = false }: { type?: 'landing-page' | 'business-card'; excludeSlug?: string; limit?: number; navigationButtons?: boolean }) {
 const all = portfolioProjects.filter(project => project.slug !== excludeSlug);
 const matches = type ? all.filter(project => project.siteType === type) : all;
 const projects = (matches.length ? matches : all).slice(0, limit);
 return <><div className="commercial-works" data-count={projects.length}>{projects.map(project => <PortfolioCard project={project} compact imageSizes={projects.length <= 2 ? '(max-width: 760px) calc(100vw - 36px), 48vw' : undefined} key={project.slug}/>)}</div><div className="commercial-actions"><LinkButton href="/portfolio" secondary={!navigationButtons}>Все работы</LinkButton><LinkButton href="/catalog" secondary={!navigationButtons}>Каталог готовых сайтов</LinkButton></div></>;
}
export function ProcessSteps({ compact = false }: { compact?: boolean }) {
 const steps = compact ? [
  ['Заявка и согласование', 'Менеджер уточняет задачу, материалы, состав работ, цену и условия оплаты.'],
  ['Материалы и разработка', 'После получения материалов и предоплаты подтверждаем старт. Собираем согласованный сайт.'],
  ['Демонстрация и правки', 'Показываем результат. Вносится один согласованный пакет клиентских правок. Ошибки исполнителя исправляются отдельно от этого пакета.'],
  ['Приёмка и передача', 'После приёмки и окончательного расчёта передаём файлы. Размещение на вашем хостинге согласуется отдельно.'],
 ] : [
  ['Заявка', 'Оставляете контакты и коротко описываете задачу. Менеджер помогает выбрать формат.'],
  ['Согласование', 'Фиксируем структуру, стоимость, материалы и размер предоплаты. Подтверждаем дату старта.'],
  ['Разработка', 'После получения материалов и предоплаты собираем сайт по утверждённому заданию.'],
  ['Демонстрация', 'Вы рассматриваете страницы и согласованные функции до окончательного расчёта.'],
  ['Правки и приёмка', 'Вносится один пакет замечаний в согласованном объёме. Затем принимаете результат.'],
  ['Расчёт и передача', 'После полной оплаты передаём файлы и инструкцию запуска. Размещение — отдельная услуга.'],
 ];
 return <ol className="commercial-process">{steps.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ol>;
}
export function FAQ({ title = 'Частые вопросы', items }: { title?: string; items: readonly (readonly [string, string])[] }) {
 return <Section title={title} className="commercial-faq"><div className="faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}<span className="faq-plus" aria-hidden="true"/></summary><p>{answer}</p></details>)}</div></Section>;
}
export function RequestSection({ title = 'Обсудим ваш проект', description = 'Расскажите о бизнесе и задаче. Менеджер поможет выбрать формат, согласует состав работ, цену и дату старта.', context }: { title?: ReactNode; description?: string; context: RequestContext }) {
 const config = briefConfig();
 return <section className="commercial-request" id="request" aria-labelledby="request-title"><div><h2 id="request-title">{title}</h2><p>{description}</p><p className="commercial-note">Один пакет согласованных правок. Передача файлов после полной оплаты. Размещение на хостинге клиента обсуждаем отдельно.</p></div><ContactForm enabled={config.enabled} policyUrl={config.policyUrl} context={context} defaultKind={context.service ? 'Новый сайт под ключ' : undefined}/></section>;
}
