import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell, PageIntro, Section, RequestSection, WorkSamples } from '@/components/commercial';
import { commercialMetadata } from '@/lib/commercial';
import { getPortfolioProject, portfolioProjects, portfolioSiteTypeLabels } from '@/lib/portfolio';
import '../portfolio.css';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return portfolioProjects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const project = getPortfolioProject((await params).slug);
 if (!project) return { title: 'Проект не найден', robots: { index: false, follow: false } };
 return commercialMetadata(project.seoTitle, project.seoDescription, `/portfolio/${project.slug}`, project.image);
}

export default async function PortfolioProjectPage({ params }: Props) {
 const project = getPortfolioProject((await params).slug);
 if (!project) notFound();
 const demo = project.status === 'demo';
 return <PageShell breadcrumbs={[{ label: 'Портфолио', href: '/portfolio' }, { label: project.title }]}>
  <PageIntro variant="portfolio" title={project.title} description={project.description}>
   <p className="portfolio-status">{demo ? 'Демонстрационный проект' : 'Клиентский проект'} · {portfolioSiteTypeLabels[project.siteType]} · {project.category}</p>
   <div className="commercial-actions">{project.catalogSlug ? <Link className="button" href={`/catalog/${project.catalogSlug}`}>Рассмотреть сайт</Link> : <a className="button" href={project.demoUrl} target="_blank" rel="noopener noreferrer">Открыть сайт</a>}<Link className="text-link" href="#request">Обсудить похожий сайт</Link></div>
  </PageIntro>
  <figure className="portfolio-case-image"><Image src={project.image} alt={`Интерфейс ${project.title}`} width={2880} height={1920} priority sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1440px) calc(100vw - 64px), 1376px"/><figcaption>{demo ? 'Демонстрационный интерфейс' : 'Интерфейс проекта'} {project.title}</figcaption></figure>
  {project.status === 'client' && <Section title="О клиенте"><div className="portfolio-case-task"><p>{project.confirmedFacts.client}</p><p>{project.confirmedFacts.scope}</p></div></Section>}
  <Section title={demo ? 'Задача демонстрации' : 'Задача проекта'}>
   <div className="portfolio-case-task"><p>{project.task}</p>{demo && <p>Этот разбор описывает доступный интерфейс. Названия, тексты, отзывы и показатели внутри демо служат примером наполнения.</p>}</div>
  </Section>
  <Section title="Решение"><p className="portfolio-solution">{project.solution}</p></Section>
  <Section title="Как устроен сайт">
   <div className="portfolio-case-sections">{project.sections.map(section => <article key={section.title}><h3>{section.title}</h3><p>{section.description}</p></article>)}</div>
  </Section>
  <Section title="Особенности разработки"><ul className="portfolio-development">{project.developmentFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul></Section>
  <Section title={demo ? 'Что показывает демо' : 'Результат проекта'}>
   <div className="portfolio-case-result"><p>{demo ? project.result : project.confirmedFacts.result}</p>{project.status === 'client' && <p>Заказчик: {project.confirmedFacts.client}</p>}{project.catalogSlug && <Link className="text-link" href={`/catalog/${project.catalogSlug}`}>Интерактивный просмотр в каталоге</Link>}<a className="text-link" href={project.demoUrl} target="_blank" rel="noopener noreferrer">{demo ? 'Открыть демоверсию' : 'Открыть сайт'}</a></div>
  </Section>
  <Section title="Похожая задача?">
   <div className="portfolio-next"><p>Можно начать с готового дизайна или обсудить сайт под вашу структуру. Объём работ, материалы и стоимость согласуем до начала разработки.</p><div><Link className="text-link" href={`/services/${project.siteType}`}>Услуга: {portfolioSiteTypeLabels[project.siteType].toLocaleLowerCase('ru')}</Link><Link className="text-link" href="/prices">Стоимость и состав работ</Link><Link className="text-link" href="/catalog">Каталог готовых сайтов</Link></div></div>
  </Section>
  <Section title="Другие примеры"><WorkSamples type={project.siteType} excludeSlug={project.slug} limit={2}/></Section>
  <RequestSection title="Обсудим похожий сайт" description={`Расскажите, что вам подходит в ${project.title} и что нужно вашему бизнесу. Согласуем содержание и состав работ.`} context={{ source: 'portfolio', service: project.siteType, projectSlug: project.slug }}/>
 </PageShell>;
}
