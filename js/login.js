const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("loginBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.className = "msg";
  btn.disabled = true;

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const { data, error } = await sb.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    msg.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    msg.classList.add("msg--error");
    btn.disabled = false;
    return;
  }

  const profile = await getMyProfile(data.user.id);

  if (profile.must_change_password) {
    location.href = "change-password.html";
  } else {
    location.href = "index.html";
  }
});

(async () => {
  const { data } = await sb.auth.getSession();
  if (data.session) {
    const profile = await getMyProfile(data.session.user.id);
    location.href = profile.must_change_password ? "change-password.html" : "index.html";
  }
})();
