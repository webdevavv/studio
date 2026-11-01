import { getPortfolioProject } from './portfolio';

export type RequestContext = {
 source: 'services' | 'prices' | 'portfolio';
 service?: 'landing-page' | 'business-card';
 projectSlug?: string;
};
export type VerifiedRequestContext = RequestContext & { pageUrl: string; projectTitle?: string };
const fields = ['source', 'service', 'projectSlug', 'pageUrl'] as const;

// Validate the raw values before cleaning: malformed context must never silently
// become a legacy homepage request. Titles are resolved only from published data.
export function verifyRequestContext(input: Record<string, unknown>, requestUrl: string): { context?: VerifiedRequestContext; error?: string } {
 if (!fields.some(field => Object.hasOwn(input, field))) return {};
 const invalid = { error: 'Откройте страницу услуги или проекта и отправьте заявку снова.' };
 const { source, service, projectSlug, pageUrl } = input;
 if (source !== 'services' && source !== 'prices' && source !== 'portfolio') return invalid;
 if (Object.hasOwn(input, 'templateId')) return invalid;
 if (service !== undefined && service !== 'landing-page' && service !== 'business-card') return invalid;
 if (Object.hasOwn(input, 'service') && service === undefined) return invalid;
 if (Object.hasOwn(input, 'projectSlug') && (typeof projectSlug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectSlug) || projectSlug.length > 100)) return invalid;
 if (typeof pageUrl !== 'string' || pageUrl.length > 2048) return invalid;
 let url: URL;
 try { url = new URL(pageUrl); } catch { return invalid; }
 if (url.origin !== new URL(requestUrl).origin || !['http:', 'https:'].includes(url.protocol) || pageUrl !== url.origin + url.pathname) return invalid;
 const pathname = url.pathname.replace(/\/$/, '');
 if (source === 'prices') {
  if (pathname !== '/prices' || service !== undefined || projectSlug !== undefined) return invalid;
 } else if (source === 'services') {
  if (projectSlug !== undefined || pathname !== (service ? `/services/${service}` : '/services')) return invalid;
 } else {
  if (projectSlug === undefined) {
   if (pathname !== '/portfolio' || service !== undefined) return invalid;
  } else {
   const project = getPortfolioProject(projectSlug as string);
   if (!project || pathname !== `/portfolio/${project.slug}` || (service !== undefined && service !== project.siteType)) return invalid;
   return { context: { source, ...(service ? { service } : {}), projectSlug: project.slug, projectTitle: project.title, pageUrl } };
  }
 }
 return { context: { source, ...(service ? { service } : {}), pageUrl } };
}
