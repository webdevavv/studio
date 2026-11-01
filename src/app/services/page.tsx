import { StudioProcess } from '@/components/studio-process';
import { CatalogCard } from '@/components/catalog-card';
import '@/app/catalog/catalog.css';
import Link from 'next/link';
import Image from 'next/image';
import { PageShell, PageIntro, Section, ServiceCards, IncludedWork, FAQ, RequestSection } from '@/components/commercial';
import { LinkButton } from '@/components/ui/link-button';
import { commercialMetadata } from '@/lib/commercial';
import { publishedTemplates } from '@/lib/catalog';
import { concepts } from '@/lib/site';

export const metadata = commercialMetadata('Создание сайтов для бизнеса — услуги веб-студии', 'Разрабатываем лендинги и сайты-визитки для малого бизнеса. Современный дизайн, адаптивная вёрстка и понятная стоимость. Работаем по всей России.', '/services');

export default function ServicesPage() {
 return <PageShell breadcrumbs={[{ label: 'Услуги' }]}>
  <PageIntro title="Создаём сайты, которые помогают вашему бизнесу" description="Разрабатываем лендинги и сайты-визитки для компаний и частных специалистов по всей России. Помогаем собрать предложение, показать услуги и сделать обращение удобным." variant="services" aside={<Link className="services-hero-work" href="/portfolio/beauty-she"><Image src={publishedTemplates[0].image} alt="Интерфейс демонстрационного сайта BEAUTY SHE" width={960} height={640} sizes="(max-width: 760px) 85vw, 33vw" priority/><span>BEAUTY SHE · Посмотреть работу</span></Link>}>
   <div className="commercial-actions"><LinkButton href="#request">Обсудить проект</LinkButton><LinkButton href="/prices" secondary>Посмотреть цены</LinkButton></div>
  </PageIntro>
  <Section title="Наши услуги" id="formats"><ServiceCards/></Section>
  <Section title="Какой сайт выбрать"><div className="commercial-columns"><div><h3>Продвигаете одно предложение?</h3><p><Link href="/services/landing-page" className="inline-link">Лендинг</Link> последовательно знакомит с конкретной услугой или товаром. Подходит, когда рекламное объявление должно вести на страницу с одной понятной целью.</p></div><div><h3>Представляете компанию?</h3><p><Link href="/services/business-card" className="inline-link">Сайт-визитка</Link> помогает узнать о вашем деле, сравнить направления и найти контакты. Состав страниц подбираем под объём информации.</p></div></div><p className="commercial-note">Если важен быстрый старт с уже выбранным оформлением, посмотрите <Link href="/catalog" className="inline-link">готовые сайты</Link>. В стандартную настройку входит замена материалов в существующей структуре.</p></Section>
  <section className="commercial-section services-included" aria-labelledby="included-title"><div className="services-included-heading"><h2 id="included-title">Что входит в разработку</h2><p>От структуры до проверки: согласуем состав работ до старта и покажем готовый сайт перед окончательным расчётом.</p></div><IncludedWork legal/></section>
  <StudioProcess title="Понятный путь от задачи" accent="к сайту" chat description="Здравствуйте! Расскажите, чем вы занимаетесь и какую задачу должен решить сайт? Помогу выбрать формат, уточню детали и согласую с вами стоимость и дату старта." items={[
   ['Согласованный срок', 'Типовой сайт готовим до двух дней после согласования объёма, получения материалов и предоплаты. Дату старта подтверждает менеджер.'],
   ['Цена до разработки', 'Фиксируем состав работ и стоимость заранее. Если появляются дополнительные страницы или функции, сначала обсуждаем их оценку.'],
   ['Проверяем результат', 'Используем современные инструменты вёрстки и повторно проверяем ссылки, мобильный вид и основные действия перед демонстрацией.'],
  ]}/>
  <Section title="Примеры наших работ"><div className="catalog-list services-examples">{publishedTemplates.map(template => <CatalogCard key={template.id} template={template} showcase/>)}<CatalogCard showcase detailHref="/#site-preview" template={{ ...publishedTemplates[0], id: 'coffee-concept', slug: 'coffee-concept', title: 'Крошка', name: 'Крошка', category: 'Демо-макет кофейни', image: '/projects/coffee.png', description: concepts[0].note, demoUrl: '/#site-preview', price: null }}/></div></Section>
  <FAQ items={[
   ['Как понять, какой сайт мне нужен?', 'Опишите, что посетитель должен узнать и сделать. Для одной услуги чаще подходит лендинг, для знакомства с компанией — сайт-визитка. Менеджер предложит формат после обсуждения задачи.'],
   ['Когда начинается срок до двух дней?', 'После согласования задачи, получения материалов и предоплаты, с подтверждённой даты старта. Для нестандартных проектов срок оцениваем отдельно.'],
   ['Что нужно подготовить?', 'Расскажите об услугах и аудитории, соберите тексты, логотип, фотографии и контакты. Перед стартом сверим список и согласуем недостающие материалы.'],
   ['Как проходит оплата?', 'До разработки согласуем цену и размер предоплаты. Остаток оплачивается после демонстрации, согласованных правок и приёмки. Файлы передаём после полной оплаты.'],
   ['Можно ли изменить сайт после передачи?', 'Да. Один пакет правок в согласованном объёме входит в разработку. Последующие изменения, новые функции и сопровождение рассчитываются отдельно. Возможность самостоятельного редактирования обсуждаем заранее.'],
  ]}/>
  <RequestSection context={{ source: 'services' }}/>
 </PageShell>;
}
