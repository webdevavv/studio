import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Reveal } from '@/components/reveal';
import { CatalogFooter } from '@/components/catalog-footer';
import { CatalogCard } from '@/components/catalog-card';
import { DemoPreview } from '@/components/demo-preview';
import { TemplateRequestForm } from '@/components/template-request-form';
import { publishedTemplates, findTemplate, templatePriceLabel, standardSetup, extraServices, purchaseSteps } from '@/lib/catalog';
import { briefConfig } from '@/lib/brief-config';
import { site } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return publishedTemplates.map(template => ({ slug: template.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const template = findTemplate((await params).slug);
 if (!template) return { title: 'Шаблон не найден', robots: { index: false, follow: false } };
 const url = `/catalog/${template.slug}`;
 return { title: template.seoTitle, description: template.seoDescription, alternates: { canonical: url }, openGraph: { title: template.seoTitle, description: template.seoDescription, url, type: 'website', locale: 'ru_RU', images: [{ url: template.image, width: 2880, height: 1920, alt: template.title }] }, twitter: { card: 'summary_large_image', title: template.seoTitle, description: template.seoDescription, images: [template.image] } };
}
export default async function TemplatePage({ params }: Props) {
 const template = findTemplate((await params).slug);
 if (!template) notFound();
 const config = briefConfig();
 const base = site.url.replace(/\/$/, '');
 const breadcrumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Главная', item: base },
  { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${base}/catalog` },
  { '@type': 'ListItem', position: 3, name: template.title, item: `${base}/catalog/${template.slug}` },
 ] };
 const related = publishedTemplates.filter(t => t.id !== template.id).sort((a, b) => Number(b.categoryId === template.categoryId) - Number(a.categoryId === template.categoryId)).slice(0, 2);
 return <><Link className="skip-link" href="#main">К содержимому</Link><div className="shell" id="top"><Header home={false} requestHref="#request"/><main id="main" className="template-page">
  {base && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>}
  <nav className="catalog-breadcrumbs" aria-label="Хлебные крошки"><ol><li><Link href="/">Главная</Link></li><li><Link href="/catalog">Каталог</Link></li><li aria-current="page">{template.title}</li></ol></nav>
  <section className="template-heading" aria-labelledby="template-title"><h1 id="template-title">{template.heading}</h1><div className="template-summary"><p className="template-category">{template.category}</p><p>{template.description}</p></div></section>
  <DemoPreview demoUrl={template.demoUrl} title={template.title} embedAllowed={template.embedAllowed}/>
  <div className="template-purchase"><div><strong>{templatePriceLabel(template)}</strong><p>{template.price === null ? 'Цену и объём согласуем перед началом работы.' : 'Стандартная настройка в существующей структуре.'}</p></div><Link className="button" href="#request">Хочу такой сайт</Link></div>
  <section className="template-about" aria-labelledby="about-template"><div><h2 id="about-template">О шаблоне {template.title}</h2><p>{template.fullDescription}</p></div><div><h3>Что можно рассмотреть в демо</h3><ul>{template.includedFeatures.map(text => <li key={text}>{text}</li>)}</ul><p className="fine-print">Демо показывает оформление сайта. Отправка форм, запись, оплата и сторонние интеграции не входят в подтверждённые возможности шаблона.</p></div></section>
  <section className="catalog-setup" id="setup" aria-labelledby="scope-title"><div><h2 id="scope-title">Настроим этот сайт <span className="setup-accent">под ваш бизнес</span></h2><p>Вы выбираете понравившийся дизайн, а мы заменяем <strong>тексты, фотографии и логотип</strong> на ваши. В результате вы получаете сайт с собственным оформлением и содержанием без необходимости разрабатывать его с нуля.</p><p><strong>Структура и состав страниц сохраняются.</strong></p></div><div className="catalog-setup-columns"><div className="setup-included"><h3>Что входит в стандартную настройку</h3><ul>{standardSetup.map(text => <li key={text}>{text}</li>)}</ul></div><div className="setup-extra"><h3>Что оплачивается отдельно</h3><ul>{extraServices.map(text => <li key={text}>{text}</li>)}</ul></div></div></section>
  <section className="template-changes" aria-labelledby="changes-title"><h2 id="changes-title">Что можно изменить</h2><ul>{template.customizationOptions.map(text => <li key={text}>{text}</li>)}</ul><p>Изменения дизайна, структуры и новые функции согласуем отдельно. Сначала зафиксируем состав работ и итоговую стоимость.</p></section>
  <section className="catalog-process" aria-labelledby="process-title"><div className="catalog-process-intro"><h2 id="process-title">От выбора до передачи</h2><p className="catalog-timing">Срок зависит от готовности материалов и объёма работ. Подтвердим его после согласования задачи и оплаты.</p></div><ol>{purchaseSteps.map(text => <li key={text}>{text}</li>)}</ol></section>
  <section className="template-faq faq" aria-labelledby="faq-title"><h2 id="faq-title">Вопросы о {template.title}</h2><div className="faq-list">{template.faq.map(([q, a]) => <details key={q}><summary>{q}<span className="faq-plus" aria-hidden="true"/></summary><p>{a}</p></details>)}</div></section>
  <section className="template-related" aria-labelledby="related-title"><div className="catalog-section-heading"><h2 id="related-title">Ещё готовые сайты</h2><Link className="text-link" href="/catalog">Весь каталог</Link></div><div className="catalog-list">{related.map(t => <CatalogCard key={t.id} template={t}/>)}</div></section>
  <section className="template-request" id="request" aria-labelledby="request-title"><div className="template-request-intro"><h2 id="request-title">Хочу такой сайт</h2><p>Оставьте контакты. Менеджер уточнит материалы, согласует стоимость и сроки перед началом работы.</p><div className="template-selection"><Image src={template.image} alt="" width={144} height={100}/><div><strong>{template.title}</strong><span>{template.category}</span><b>{templatePriceLabel(template)}</b></div></div><p className="fine-print">{site.timing}</p></div><TemplateRequestForm templateId={template.id} templateName={template.title} enabled={config.enabled} policyUrl={config.policyUrl} price={template.price} templateUrl={template.demoUrl}/></section>
 </main><CatalogFooter/><Reveal selector=".template-heading h1,.template-summary,.template-about h2,.catalog-setup h2,.template-changes h2,.catalog-process ol>li,.template-faq h2,.template-faq details,.template-related h2,.template-request-intro h2"/></div></>;
}
