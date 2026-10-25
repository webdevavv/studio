export function briefConfig() {
 const policyUrl = process.env.BRIEF_POLICY_URL || '';
 const baseUrl = (process.env.YOUGILE_API_URL || 'https://yougile.com/api-v2').replace(/\/$/, '');
 const key = process.env.YOUGILE_API_KEY || '';
 const columnId = process.env.YOUGILE_COLUMN_ID || '';
 const assigned = process.env.YOUGILE_ASSIGNED_ID || '';
 const enabled = process.env.BRIEF_ENABLED === 'true' && !!key && !!columnId && /^https:\/\//.test(policyUrl) && /^https:\/\//.test(baseUrl);
 return { policyUrl, baseUrl, key, columnId, assigned, enabled };
}
