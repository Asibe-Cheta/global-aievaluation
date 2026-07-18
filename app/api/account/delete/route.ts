import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!secretKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "Server is missing Supabase configuration" },
      { status: 500 },
    );
  }

  const adminClient = createAdminClient(supabaseUrl, secretKey, {
    auth: { persistSession: false },
  });

  // profiles/user_progress cascade-delete automatically (see
  // supabase/migrations/0001_init.sql: on delete cascade).
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
