// Public Supabase project URL + API key (safe in the client; RLS protects your data).
// The key can be the new publishable key (`sb_publishable_…`) or the legacy anon JWT (`eyJ…`);
// both work with @supabase/supabase-js for `/rest/v1/<table>` requests.
//
// Override with env on Netlify / `.env.local` (CRA only bundles `REACT_APP_*`):
//   REACT_APP_SUPABASE_URL
//   REACT_APP_SUPABASE_ANON_KEY  or  REACT_APP_SUPABASE_PUBLISHABLE_KEY

export const DEFAULT_SUPABASE_URL = 'https://llpjrzerpnptbfeoqgrk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_2oKaCUwFRYW1NCmO6sfjPQ_XukDJJPC';
