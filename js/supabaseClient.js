
const SUPABASE_ANON_KEY = "sb_publishable_t_buStx3pg78LqaCAGWFpw_Qb1iQhy6";

// 아이디만 발급하므로, 내부적으로 아이디@도메인 형태의 가짜 이메일을 만들어 Supabase Auth에 사용
const EMAIL_DOMAIN = "ourclass.local";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function usernameToEmail(username) {
  return `${username.trim()}@${EMAIL_DOMAIN}`;
}

async function requireLogin() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    location.href = "login.html";
    return null;
  }
  return data.session;
}

async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
