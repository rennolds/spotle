import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

export async function POST({ request }) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || !email.includes('@')) return json({ error: 'bad_email' }, { status: 400 });

  // IMPORTANT: use your *service role* key here (never expose to client)
  const supabaseAdmin = createClient(
    process.env.PUBLIC_SUPABASE_URL,           // you can also use a private env, but PUBLIC URL is fine
    process.env.SUPABASE_SERVICE_ROLE_KEY,     // private env var
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Preferred: admin.getUserByEmail (supabase-js v2)
  let exists = false;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (error && error.message !== 'User not found') {
      console.error('getUserByEmail error:', error.message);
      return json({ error: 'server_error' }, { status: 500 });
    }
    exists = !!data?.user;
  } catch (e) {
    console.error('admin check failed:', e);
    return json({ error: 'server_error' }, { status: 500 });
  }

  return json({ exists });
}
