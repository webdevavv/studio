import Link from 'next/link';
import { FooterNavigation } from './footer-navigation';
import { site } from '@/lib/site';

export function BlogFooter() {
 return <footer className="blog-footer"><FooterNavigation/><Link className="logo" href="/">{site.name}</Link><p>Понятно о сайтах для своего дела.</p></footer>;
}
