import { createClient } from "@supabase/supabase-js";

// One-off script: grants admin access to an existing account by email.
// Run with `npm run grant-admin -- <email>`. Requires
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local (never
// commit the secret key).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run grant-admin -- <email>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let targetUserId: string | null = null;
  let page = 1;
  while (!targetUserId) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) {
      targetUserId = match.id;
      break;
    }
    if (data.users.length < 1000) break; // last page
    page++;
  }

  if (!targetUserId) {
    console.error(`No account found for ${email}. They need to sign up first.`);
    process.exit(1);
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", targetUserId)
    .select("id, display_name, is_admin")
    .single();

  if (updateError) throw new Error(`profiles update: ${updateError.message}`);

  console.log(`Granted admin access to ${email} (user ${updated.id}, display_name: ${updated.display_name ?? "—"}).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
