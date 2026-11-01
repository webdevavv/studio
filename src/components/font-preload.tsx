'use client';

import { preload } from 'react-dom';

export function FontPreload() {
 for (const subset of ['cyrillic', 'latin']) preload(`/fonts/golos-text-v5.3.0/golos-text-${subset}-wght-normal.woff2`, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
 return null;
}
