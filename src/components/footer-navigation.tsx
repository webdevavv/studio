import Link from 'next/link';

export function FooterNavigation() {
 return <><nav className="footer-navigation" aria-label="Навигация в подвале">
  <Link href="/catalog"><strong>Каталог сайтов</strong><span>Выберите дизайн для своего дела</span></Link>
  <Link href="/blog"><strong>Блог</strong><span>О дизайне, текстах и запуске сайта</span></Link>
 </nav><nav className="footer-links" aria-label="Услуги и работы"><Link href="/services">Услуги студии</Link><Link href="/prices">Цены и условия</Link><Link href="/portfolio">Портфолио</Link></nav></>;
}
