import Image from 'next/image';
import Link from 'next/link';
import { CatalogTemplate, templatePriceLabel } from '@/lib/catalog';

export function CatalogCard({ template, priority = false, showcase = false, detailHref }: { template: CatalogTemplate; priority?: boolean; showcase?: boolean; detailHref?: string }) {
 return <article className="catalog-item" aria-labelledby={`card-${template.id}`}>
  <Link className="catalog-image" href={detailHref || `/catalog/${template.slug}`} aria-label={`Подробнее о ${template.title}`}><Image src={template.image} alt={`Первый экран сайта ${template.title}`} width={2880} height={1920} quality={90} sizes="(max-width: 640px) calc(100vw - 36px), (max-width: 1100px) calc((100vw - 88px) / 2), 380px" priority={priority}/></Link>
  <div className="catalog-item-body"><div className="catalog-card-title"><h3 id={`card-${template.id}`}><Link href={detailHref || `/catalog/${template.slug}`}>{template.title}</Link></h3>{!showcase && <a className="catalog-demo-link" href={template.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Открыть демо ${template.title}`}>Демо</a>}</div><p className="catalog-item-type">{template.category}</p><p>{template.description}</p><div className="catalog-item-order">{!showcase && <p><strong>{templatePriceLabel(template)}</strong>{template.price !== null && <span>Стандартная настройка</span>}</p>}{showcase ? <a className="catalog-showcase-demo" href={template.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Открыть демо ${template.title}`}>Демо</a> : <Link className="button" href={detailHref || `/catalog/${template.slug}`}>Подробнее</Link>}</div></div>
 </article>;
}
