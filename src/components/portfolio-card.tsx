import Image from 'next/image';
import Link from 'next/link';
import { portfolioSiteTypeLabels, type PortfolioProject } from '@/lib/portfolio';
import '@/app/portfolio/portfolio.css';

export function PortfolioCard({ project, priority = false, compact = false, imageSizes }: { project: PortfolioProject; priority?: boolean; compact?: boolean; imageSizes?: string }) {
 return <article className="portfolio-card">
  <Link className="portfolio-card-image" href={`/portfolio/${project.slug}`} aria-label={`Разбор сайта ${project.title}`}>
   <Image src={project.image} alt={`Интерфейс сайта ${project.title}`} width={2880} height={1920} sizes={imageSizes || (compact ? '(max-width: 760px) calc(100vw - 36px), (max-width: 1100px) calc((100vw - 84px) / 2), 445px' : '(max-width: 760px) calc(100vw - 36px), (max-width: 1440px) 60vw, 900px')} priority={priority}/>
  </Link>
  <div className="portfolio-card-body">
   <h3><Link href={`/portfolio/${project.slug}`}>{project.title}</Link></h3>
   <p className="portfolio-status">{project.status === 'demo' ? 'Демонстрационный проект' : 'Клиентский проект'}</p>
   <p className="portfolio-card-category">{portfolioSiteTypeLabels[project.siteType]} · {project.category}</p>
   <p>{project.task}</p>
   <div className="portfolio-card-actions">
    {compact && <a className="text-link portfolio-card-demo" href={project.demoUrl} target="_blank" rel="noopener noreferrer">Посмотреть демо</a>}
    <Link className="text-link" href={`/portfolio/${project.slug}`}>Разбор проекта</Link>
   </div>
  </div>
 </article>;
}
