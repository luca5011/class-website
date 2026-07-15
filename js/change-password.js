const form = document.getElementById("pwForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("pwBtn");
const titleText = document.getElementById("titleText");
const hintText = document.getElementById("hintText");

let session = null;
let isForced = false;

(async () => {
  session = await requireLogin();
  if (!session) return;
  const profile = await getMyProfile(session.user.id);
  isForced = profile.must_change_password;
  if (isForced) {
    titleText.textContent = "첫 로그인 - 비밀번호 변경";
    hintText.textContent = "발급받은 초기 비밀번호는 계속 사용할 수 없습니다. 새 비밀번호로 변경한 뒤 이용해 주세요. (6자 이상)";
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.className = "msg";

  const p1 = document.getElementById("newPw").value;
  const p2 = document.getElementById("newPw2").value;

  if (p1 !== p2) {
    msg.textContent = "두 비밀번호가 일치하지 않습니다.";
    msg.classList.add("msg--error");
    return;
  }

  btn.disabled = true;

  const { error: updateErr } = await sb.auth.updateUser({ password: p1 });
  if (updateErr) {
    msg.textContent = "비밀번호 변경에 실패했습니다: " + updateErr.message;
    msg.classList.add("msg--error");
    btn.disabled = false;
    return;
  }

  const { error: profileErr } = await sb
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", session.user.id);

  if (profileErr) {
    msg.textContent = "비밀번호는 변경되었지만 상태 저장에 실패했습니다. 다시 로그인해 주세요.";
    msg.classList.add("msg--error");
    btn.disabled = false;
    return;
  }

  msg.textContent = "변경되었습니다. 이동 중...";
  msg.classList.add("msg--info");
  setTimeout(() => (location.href = "index.html"), 700);
});
