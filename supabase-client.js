const SUPABASE_URL =
    "https://kydvxnknbtbpjeuhbrus.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_f5Y5vorvPKuKgSxWfuHS2w_RK81oBm1";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );