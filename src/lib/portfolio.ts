import { publishedTemplates } from './catalog';

export type PortfolioSiteType = 'landing-page' | 'business-card';
export const portfolioSiteTypeLabels: Record<PortfolioSiteType, string> = {
 'landing-page': 'Лендинг',
 'business-card': 'Сайт-визитка',
};

type ProjectBase = {
 slug: string; title: string; categoryId: string; category: string;
 siteType: PortfolioSiteType; task: string; description: string;
 image: string; demoUrl: string; catalogSlug?: string;
 solution: string; developmentFeatures: string[];
 sections: { title: string; description: string }[];
 result: string; seoTitle: string; seoDescription: string;
};

// A client case requires explicit evidence. Demo content cannot become a client case
// just by changing a label, and public claims must be covered by confirmedFacts.
export type PortfolioProject = ProjectBase & (
 { status: 'demo'; confirmedFacts?: never } |
 { status: 'client'; confirmedFacts: { client: string; scope: string; result: string; evidence: string } }
);

type DemoContent = Pick<ProjectBase, 'siteType' | 'task' | 'solution' | 'developmentFeatures' | 'sections' | 'result'>;
const demoContent: Record<string, DemoContent> = {
 'beauty-she': {
  siteType: 'business-card',
  task: 'Показать услуги и атмосферу салона красоты, затем помочь посетителю найти контакты и переход к записи.',
  solution: 'Презентация салона объединяет атмосферные фотографии, описания услуг и контактные элементы. Такое построение даёт посетителю возможность познакомиться с предложением до обращения.',
  developmentFeatures: ['Фотографии и текстовые разделы работают вместе: изображения показывают атмосферу, тексты объясняют услуги.', 'Элементы перехода к записи выделяют следующий шаг; подключение рабочего сервиса согласуется отдельно.', 'При адаптации важны читаемость описаний услуг и доступность контактных элементов на узком экране.'],
  sections: [
   { title: 'Знакомство с салоном', description: 'Презентация салона и фотографии дают первое представление о пространстве. В центре внимания — атмосфера и направления услуг.' },
   { title: 'Услуги и фотографии', description: 'Разделы услуг помогают рассмотреть предложение, а изображения поддерживают визуальную подачу. При адаптации содержание заменяется материалами бизнеса.' },
   { title: 'Переход к записи', description: 'Контактные элементы завершают знакомство с салоном. Подключение сервиса онлайн-записи требует отдельного согласования и проверки.' },
  ],
  result: 'Демонстрационный сайт с презентацией салона, услугами, фотографиями и контактными элементами. Можно оценить оформление и структуру; подтверждённых данных о запуске для клиента и бизнес-результатах нет.',
 },
 'golden-hands': {
  siteType: 'business-card',
  task: 'Представить школу-студию красоты, её направления услуг и обучение в одной структуре.',
  solution: 'В одном представлении собраны направления студии, информация об обучении, фотографии и контакты. Посетитель может рассмотреть предложение студии и выбрать интересующее направление.',
  developmentFeatures: ['Структура объединяет два направления — услуги и обучение — без утверждения об отдельной системе записи или учебной платформе.', 'Галерея дополняет описания направлений и информацию о пространстве.', 'При настройке важно согласовать реальные программы, условия и контакты, сохраняя понятную подачу на телефоне.'],
  sections: [
   { title: 'Школа и студия', description: 'Сайт знакомит со школой-студией и показывает направления её работы. Структура объединяет услуги и информацию об обучении.' },
   { title: 'Галерея', description: 'Фотографии позволяют рассмотреть визуальную подачу работ и пространства. Для рабочего сайта нужны собственные изображения и достоверные описания.' },
   { title: 'Информация и контакты', description: 'Информация о студии и контактные элементы дают посетителю следующий шаг. Программы, условия обучения и рабочие способы связи уточняются перед запуском.' },
  ],
  result: 'Демонстрационный сайт школы-студии с направлениями, галереей и контактами. Он показывает вариант презентации услуг и обучения. Клиентский заказ, действующая запись и результаты бизнеса не подтверждены.',
 },
 notimo: {
  siteType: 'landing-page',
  task: 'Объяснить назначение цифрового сервиса онлайн-записи и представить предложение раннего доступа.',
  solution: 'Продуктовый лендинг последовательно знакомит с назначением сервиса, его возможностями и предложением раннего доступа. Демонстрационные фрагменты интерфейса помогают объяснить идею продукта.',
  developmentFeatures: ['Визуальная демонстрация интерфейса служит объяснением продукта и не заменяет разработку самого сервиса.', 'Презентация возможностей связана с одним предложением — ранним доступом.', 'При адаптации важны читаемость демонстрационных фрагментов на разных экранах и подключение согласованного способа обращения.'],
  sections: [
   { title: 'Назначение продукта', description: 'Лендинг представляет цифровой сервис онлайн-записи. Тексты и визуальная подача знакомят посетителя с предложением продукта.' },
   { title: 'Возможности и интерфейс', description: 'Блоки возможностей и демонстрационные элементы интерфейса помогают рассмотреть сценарий продукта. Они показывают презентацию, а не подтверждают работу кабинета или хранения записей.' },
   { title: 'Ранний доступ', description: 'Предложение раннего доступа завершает презентацию. Подключение обработки заявок и работа самого сервиса находятся за пределами демонстрации лендинга.' },
  ],
  result: 'Демонстрационный продуктовый лендинг с описанием возможностей и предложением раннего доступа. Работающий сервис, пользовательская база, платежи и коммерческие результаты этим проектом не подтверждаются.',
 },
};

// Add independently published client cases here, with confirmedFacts and an image.
// They do not need a catalog template or a catalogSlug.
export const clientProjects: Extract<PortfolioProject, { status: 'client' }>[] = [];

const demoProjects: PortfolioProject[] = publishedTemplates.flatMap(template => {
 const content = demoContent[template.slug];
 if (!content) return [];
 return [{
  slug: template.slug, title: template.title, status: 'demo' as const,
  categoryId: template.categoryId, category: template.category,
  image: template.image, demoUrl: template.demoUrl, catalogSlug: template.slug,
  description: template.description, ...content,
  seoTitle: `${template.title} — разбор демонстрационного сайта`,
  seoDescription: `Разбор интерфейса ${template.title}: задача, структура и демонстрационный результат. ${template.description}`,
 }];
});

export const portfolioProjects: PortfolioProject[] = [...demoProjects, ...clientProjects];

export const getPortfolioProject = (slug: string) => portfolioProjects.find(project => project.slug === slug);
export const portfolioCategories = Array.from(new Map(portfolioProjects.map(project => [project.categoryId, { id: project.categoryId, label: project.category }])).values());
export const portfolioSiteTypes = Array.from(new Set(portfolioProjects.map(project => project.siteType))).map(id => ({ id, label: portfolioSiteTypeLabels[id] }));

export function filterPortfolioProjects(category = '', type = '') {
 return portfolioProjects.filter(project => (!category || project.categoryId === category) && (!type || project.siteType === type));
}
