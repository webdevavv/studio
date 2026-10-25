import Link from 'next/link';
import { FooterNavigation } from './footer-navigation';
import { site } from '@/lib/site';

export function CatalogFooter() {
 return <footer className="catalog-footer">
  <FooterNavigation/>
  <Link className="logo" href="/">{site.name}</Link>
  <p>Готовый дизайн для вашего дела.</p>
  <Link className="text-link" href="/#contacts">Обсудить другой проект</Link>
 </footer>;
}
