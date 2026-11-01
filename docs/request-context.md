# Контекст коммерческой заявки

`ContactForm` принимает необязательные `context` и `defaultKind`:

```tsx
<ContactForm enabled={enabled} policyUrl={policyUrl}
 context={{ source: 'services', service: 'landing-page' }}
 defaultKind="Новый сайт под ключ" />
```

Контракт `context`: `source: 'services' | 'prices' | 'portfolio'`, необязательные `service: 'landing-page' | 'business-card'` и `projectSlug: string`. `defaultKind` задаёт начальный выбор существующего поля типа заявки; неизвестное значение возвращает первый вариант. Клиент добавляет контекст в `answers` и вычисляет `pageUrl` как `window.location.origin + window.location.pathname`, без query и hash. Без `context` главная и каталог продолжают использовать прежний контракт.

Сервер проверяет необработанный контекст до очистки полей и доставки. Разрешены только абсолютные HTTP(S) URL с origin API-запроса, без параметров, фрагментов, credentials и неоднозначного кодирования. Допускается завершающий `/`.

| Источник | URL | Дополнительные поля |
| --- | --- | --- |
| services | `/services` | без service и projectSlug |
| services | `/services/landing-page`, `/services/business-card` | соответствующий service, без projectSlug |
| prices | `/prices` | без service и projectSlug |
| portfolio | `/portfolio` | без service и projectSlug |
| portfolio | `/portfolio/{slug}` | опубликованный projectSlug; необязательный service совпадает с siteType проекта |

Проект разрешается через `getPortfolioProject`: статус demo/client описывает тип опубликованного кейса. Название проекта берётся из серверного каталога, присланные названия игнорируются. Контекст несовместим с templateId. Частичный или некорректный контекст возвращает 400, не маскируясь под заявку с главной. Origin, согласие, телефон, honeypot, ограничения размера и частоты, дедупликация и обработка неопределённой доставки сохранены. Контекст входит в подпись идемпотентности, поэтому изменение страницы или услуги под тем же ID возвращает 409.

YouGile получает источник, человекочитаемую услугу (если выбрана), серверное название и slug проекта (если выбран), URL страницы. Все значения проходят существующее HTML-экранирование.

`tests/request-context.spec.ts` проверяет матрицу допустимых URL, подмену источника/услуги/проекта, приватные query/hash, серверные названия, согласие, контекст в идемпотентности и общий лимит попыток. CRM полностью подменяется. Браузерный сценарий с `TEST_REQUESTS_ENABLED=true` перехватывает `/api/brief` и проверяет контекст, удаление query/hash и обязательное согласие; реальные заявки не создаются.
