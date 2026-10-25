import { site } from '@/lib/site';

export function CatalogFooter() {
 return <footer className="catalog-footer">
  <a className="logo" href="/">{site.name}</a>
  <p>Готовый дизайн для вашего дела.</p>
  <a className="text-link" href="/#contacts">Обсудить другой проект</a>
 </footer>;
}
