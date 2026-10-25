import Link from 'next/link';
import type { ReactNode } from 'react';
export function LinkButton({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
 return <Link className={secondary ? 'secondary-link' : 'button'} href={href}>{children}</Link>;
}
