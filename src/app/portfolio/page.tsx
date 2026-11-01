import { MobileCardSlider } from '@/components/mobile-card-slider';
import Link from 'next/link';
import Form from 'next/form';
import { RequestSelect } from '@/components/request-select';
import { PageShell, PageIntro, Section, RequestSection } from '@/components/commercial';
import { PortfolioCard } from '@/components/portfolio-card';
import { commercialMetadata } from '@/lib/commercial';
import { filterPortfolioProjects, portfolioCategories, portfolioSiteTypes } from '@/lib/portfolio';

export const metadata = commercialMetadata('Портфолио веб-студии — примеры разработанных сайтов', 'Посмотрите примеры сайтов, дизайн и адаптивную вёрстку. Изучите проекты веб-студии и узнайте, как заказать похожий сайт для своего бизнеса.', '/portfolio', '/projects/beauty-she.webp');
type Query = Record<string, string | string[] | undefined>;
const value = (entry: Query[string]) => typeof entry === 'string' ? entry.trim().slice(0, 80) : '';

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<Query> }) {
 const params = await searchParams;
 const category = portfolioCategories.find(item => item.id === value(params.category))?.id || '';
 const type = portfolioSiteTypes.find(item => item.id === value(params.type))?.id || '';
 const projects = filterPortfolioProjects(category, type);
 return <PageShell breadcrumbs={[{ label: 'Портфолио' }]}>
  <PageIntro variant="business-card" title={<>Наши работы — <span className="business-hero-accent">сайты в деталях</span></>} description={<>Посмотрите, как <strong>дизайн, структура и контакты</strong> помогают представить бизнес в интернете.</>} aside={<div className="commercial-feature"><p className="business-summary-title">Что можно посмотреть</p><ul className="commercial-points"><li><strong>Демо</strong> — сайт в действии</li><li><strong>Разбор</strong> — задача и решения</li><li><strong>Адаптация</strong> — на разных экранах</li></ul><p className="commercial-note">Сейчас здесь демонстрационные проекты. Они показывают дизайн и структуру; клиентские заказы и бизнес-результаты ими не подтверждаются.</p></div>}>
   <div className="commercial-actions"><Link className="button" href="#projects">Смотреть проекты</Link><Link className="text-link" href="/services">Услуги студии</Link></div>
  </PageIntro>
  <Section title="Выберите пример" id="projects" className="business-examples portfolio-showcase">
   <Form key={`${category}-${type}`} className="portfolio-filters" action="/portfolio#projects" aria-label="Фильтры портфолио">
    <RequestSelect id="portfolio-category" name="category" label="Сфера бизнеса" options={['Все сферы', ...portfolioCategories.map(item => item.label)]} optionValues={['', ...portfolioCategories.map(item => item.id)]} defaultValue={category} nativeFallback />
    <RequestSelect id="portfolio-type" name="type" label="Тип сайта" options={['Все типы', ...portfolioSiteTypes.map(item => item.label)]} optionValues={['', ...portfolioSiteTypes.map(item => item.id)]} defaultValue={type} nativeFallback />
    <button className="button" type="submit">Показать проекты</button>
   </Form>
   <div className="portfolio-results"><p role="status">Проектов: {projects.length}</p>{(category || type) && <Link className="text-link" href="/portfolio#projects">Сбросить фильтры</Link>}</div>
   <div className="commercial-works portfolio-collection">{projects.map((project, index) => <PortfolioCard key={project.slug} project={project} compact imageSizes="(max-width: 760px) calc(100vw - 68px), 460px" priority={index === 0}/>)}</div>
   {!projects.length && <div className="portfolio-empty"><h3>Пока нет такого примера</h3><p>Попробуйте другую сферу или тип сайта.</p><Link className="text-link" href="/portfolio#projects">Все проекты</Link></div>}
  </Section>
  <Section title="Внимание к устройству сайта" className="portfolio-quality">
   <MobileCardSlider className="portfolio-approach" label="Внимание к устройству сайта">{[
    ['Детали интерфейса', 'Проверяем подписи, читаемость, ссылки и состояния элементов. Посетителю должно быть понятно, куда идти и как связаться с бизнесом.'],
    ['Адаптивность', 'Согласуем подачу контента на телефоне и компьютере. Размеры текста и доступность действий важны на каждом экране.'],
    ['Производительность', 'Учитываем вес изображений и необходимость интерактивных элементов. Проверяем загрузку согласованных страниц перед передачей.'],
    ['Удобство', 'Выстраиваем информацию вокруг задачи посетителя: разобраться в предложении, рассмотреть услуги и найти способ обращения.'],
   ].map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</MobileCardSlider>
  </Section>
  <Section title="От примера к вашему сайту" className="service-format-choice">
   <div className="business-pricing-layout">
    <div className="business-pricing-main"><h3>Готовая основа</h3><p>Если вам подходит оформление и структура выбранного примера.</p><ul><li>Выбираете сайт из каталога</li><li>Передаёте тексты, фотографии и контакты</li><li>Заменяем материалы в существующей структуре</li></ul><Link className="button" href="/catalog">Выбрать готовый сайт</Link></div>
    <div className="business-pricing-main service-format-business"><h3>Индивидуальная разработка</h3><p>Если нужен другой дизайн, сценарий или состав страниц.</p><ul><li>Обсуждаем задачу вашего бизнеса</li><li>Согласуем структуру и оформление</li><li>Фиксируем стоимость и срок до старта</li></ul><Link className="button" href="/services">Посмотреть услуги</Link></div>
   </div>
  </Section>
  <Section title="Как строится работа"><div className="payment-flow"><div className="payment-flow-intro"><p>От понравившегося примера — к сайту для вашего бизнеса.</p><p className="commercial-note">До начала разработки согласуем состав работ, материалы, стоимость и предоплату.</p><Link className="text-link" href="/prices">Стоимость и условия</Link></div><ol className="payment-flow-steps">{[
   ['Задача и согласование', 'Расскажите о бизнесе и покажите близкий вам пример. Определим формат, объём работ и условия.', 'Выбираем направление'],
   ['Материалы и разработка', 'После получения материалов и предоплаты подтверждаем старт и создаём согласованный сайт.', 'Собираем сайт'],
   ['Демонстрация и правки', 'Показываем результат по ссылке. Вносим один согласованный пакет правок; ошибки исполнителя исправляем отдельно.', 'Проверяете результат'],
   ['Приёмка и передача', 'После приёмки и окончательного расчёта передаём файлы и инструкцию запуска. Размещение на хостинге — отдельная услуга.', 'Передаём готовую работу'],
  ].map(([title, text, label]) => <li key={title}><div className="payment-flow-step"><h3>{title}</h3><p>{text}</p><span className="payment-flow-label">{label}</span></div></li>)}</ol></div></Section>
  <RequestSection title={<>Создадим <span className="business-request-accent">сайт для вашего бизнеса</span></>} description="Расскажите о бизнесе и примере, который вам близок. Уточним материалы, состав работ и стоимость." context={{ source: 'portfolio' }}/>
 </PageShell>;
}
