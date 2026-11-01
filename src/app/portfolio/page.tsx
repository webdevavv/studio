import Link from 'next/link';
import Form from 'next/form';
import { PageShell, PageIntro, Section, RequestSection, ProcessSteps } from '@/components/commercial';
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
  <PageIntro variant="portfolio" title="Наши работы — сайты, которые можно посмотреть вживую" description="Посмотрите, как устроены сайты для салона, школы-студии и цифрового сервиса. В каждом разборе — задача, интерфейс и результат.">
   <p>Сейчас в портфолио демонстрационные проекты. Они показывают дизайн и структуру; клиентские заказы и бизнес-результаты не подтверждены.</p>
   <div className="commercial-actions"><Link className="button" href="#projects">Смотреть проекты</Link><Link className="text-link" href="/services">Услуги студии</Link></div>
  </PageIntro>
  <Section title="Выберите пример" id="projects">
   <Form key={`${category}-${type}`} className="portfolio-filters" action="/portfolio#projects" aria-label="Фильтры портфолио">
    <div><label htmlFor="portfolio-category">Сфера бизнеса</label><select id="portfolio-category" name="category" defaultValue={category}><option value="">Все сферы</option>{portfolioCategories.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
    <div><label htmlFor="portfolio-type">Тип сайта</label><select id="portfolio-type" name="type" defaultValue={type}><option value="">Все типы</option>{portfolioSiteTypes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
    <button className="button" type="submit">Показать проекты</button>
   </Form>
   <div className="portfolio-results"><p role="status">Проектов: {projects.length}</p>{(category || type) && <Link className="text-link" href="/portfolio#projects">Сбросить фильтры</Link>}</div>
   <div className="portfolio-collection">{projects.map((project, index) => <PortfolioCard key={project.slug} project={project} priority={index === 0}/>)}</div>
   {!projects.length && <div className="portfolio-empty"><h3>Пока нет такого примера</h3><p>Попробуйте другую сферу или тип сайта.</p><Link className="text-link" href="/portfolio#projects">Все проекты</Link></div>}
  </Section>
  <Section title="Внимание к устройству сайта">
   <div className="portfolio-approach">{[
    ['Детали интерфейса', 'Проверяем подписи, читаемость, ссылки и состояния элементов. Посетителю должно быть понятно, куда идти и как связаться с бизнесом.'],
    ['Адаптивность', 'Согласуем подачу контента на телефоне и компьютере. Размеры текста и доступность действий важны на каждом экране.'],
    ['Производительность', 'Учитываем вес изображений и необходимость интерактивных элементов. Проверяем загрузку согласованных страниц перед передачей.'],
    ['Удобство', 'Выстраиваем информацию вокруг задачи посетителя: разобраться в предложении, рассмотреть услуги и найти способ обращения.'],
   ].map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
  </Section>
  <Section title="От примера к вашему сайту">
   <div className="portfolio-next"><p>Готовую структуру можно адаптировать под ваши материалы. Если нужен другой сценарий или состав страниц, обсудим разработку отдельно.</p><div><Link className="text-link" href="/catalog">Выбрать готовый сайт</Link><Link className="text-link" href="/prices">Посмотреть стоимость</Link></div></div>
  </Section>
  <Section title="Как строится работа"><ProcessSteps compact/></Section>
  <RequestSection title="Хотите похожий сайт для своего бизнеса?" description="Расскажите о бизнесе и примере, который вам близок. Уточним материалы, состав работ и стоимость." context={{ source: 'portfolio' }}/>
 </PageShell>;
}
