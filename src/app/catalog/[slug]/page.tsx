import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Reveal } from '@/components/reveal';
import { CatalogFooter } from '@/components/catalog-footer';
import { TemplateRequestForm } from '@/components/template-request-form';
import { catalogStyles, catalogTemplates, findTemplate } from '@/lib/catalog';
import { money, site } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return catalogTemplates.map(template => ({ slug: template.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const template = findTemplate((await params).slug);
 return template ? { title: `Макет «${template.name}» — ${site.name}`, description: `${template.description} Адаптация за ${money(site.catalogPrice)}.` } : { title: 'Макет не найден' };
}

export default async function TemplatePage({ params }: Props) {
 const template = findTemplate((await params).slug);
 if (!template) notFound();
 return <>
  <Link className="skip-link" href="#main">К содержимому</Link>
  <div className="shell" id="top">
   <Header home={false} requestHref="#request"/>
   <main id="main" className="template-page">
    <nav aria-label="Навигация по каталогу"><Link className="text-link catalog-back" href="/catalog#templates">← Все макеты</Link></nav>
    <section className="template-heading" aria-labelledby="template-title">
     <div><h1 id="template-title">{template.name}</h1><p>Готовый макет сайта · {template.category}<br/>{catalogStyles.find(item => item.id === template.styleId)?.label} дизайн</p></div>
     <div className="template-heading-order"><strong>{money(site.catalogPrice)}</strong><Link className="button" href="#request">Хочу такой сайт</Link></div>
    </section>
    <figure className="template-preview"><Image src={template.image} alt={`Первый экран макета «${template.name}»`} width={1440} height={960} sizes="100vw" priority/><figcaption>Макет «{template.name}».</figcaption></figure>
    <section className="template-scope" aria-labelledby="scope-title">
     <div><h2 id="scope-title">Тот же дизайн.<br/>Ваше содержание.</h2><p>{template.description}</p></div>
     <div><h3>Что входит в {money(site.catalogPrice)}</h3><ul><li>Замена названия на название вашего бизнеса.</li><li>Ваши тексты в существующих блоках макета.</li><li>Ваши телефон, ссылки на соцсети и другие контакты.</li><li>Проверка адаптированного сайта и передача готовых материалов.</li></ul><p>Композиция, цвета и структура остаются как в выбранном дизайне. Новые блоки, функции, изменение дизайна, домен и размещение не входят в стоимость адаптации.</p></div>
    </section>
    <section className="template-request" id="request" aria-labelledby="request-title">
     <div className="template-request-intro"><h2 id="request-title">Этот дизайн —<br/>для вас</h2><p>Оставьте контакты. Менеджер уточнит содержание сайта и согласует детали перед началом работы.</p><div className="template-selection"><Image src={template.image} alt="" width={144} height={96}/><div><strong>{template.name}</strong><span>{template.category}</span><b>{money(site.catalogPrice)} · фиксированно</b></div></div><p className="fine-print">{site.timing}</p></div>
     <TemplateRequestForm templateId={template.id} templateName={template.name}/>
    </section>
   </main>
   <CatalogFooter/>
   <Reveal selector=".template-heading h1,.template-heading p,.template-heading-order,.template-preview>img,.template-scope h2,.template-scope h3,.template-scope li,.template-request-intro h2,.template-selection"/>
  </div>
 </>;
}
