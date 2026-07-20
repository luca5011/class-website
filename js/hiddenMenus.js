// 새 히든 메뉴를 추가할 땐 아래 배열에 한 줄만 추가하면 됨
// keys: shift와 함께 눌러야 하는 알파벳 키 목록 (순서 상관없음)
const HIDDEN_MENUS = [
  { key: "jumpking", label: "🎮 미니게임", href: "minigames.html", code: "이산화망가니즈", keys: ["q", "w"] },
  { key: "freeboard", label: "자유게시판", href: "freeboard.html", code: "I'm_bored", keys: ["x", "y", "u"] },
  { key: "dm", label: "DM", href: "dm.html", code: "promise", keys: ["q", "z", "w", "x"] },
];

(function () {
  const banner = document.createElement("div");
  banner.className = "hidden-prompt";
  banner.id = "hiddenPrompt";
  banner.innerHTML = `
    <form id="hiddenPromptForm">
      <span class="hidden-prompt__q" id="hiddenPromptQ">🔒 암호를 입력하세요</span>
      <input type="text" id="hiddenPromptInput" autocomplete="off">
      <button type="submit">확인</button>
      <button type="button" id="hiddenPromptClose">✕</button>
    </form>
  `;
  document.body.prepend(banner);

  let activeMenu = null;
  let heldKeys = new Set();
  let unlockedKeys = new Set();

  function openPrompt(menu) {
    if (banner.classList.contains("show")) return;
    activeMenu = menu;
    banner.classList.add("show");
    const input = banner.querySelector("#hiddenPromptInput");
    input.value = "";
    setTimeout(() => input.focus(), 50);
  }

  function closePrompt() {
    banner.classList.remove("show");
    activeMenu = null;
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closePrompt(); return; }
    const k = e.key.toLowerCase();
    if (k.length === 1) heldKeys.add(k);
    for (const m of HIDDEN_MENUS) {
      if (unlockedKeys.has(m.key)) continue;
      if (e.shiftKey && m.keys.every(rk => heldKeys.has(rk))) {
        openPrompt(m);
        break;
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    heldKeys.delete(e.key.toLowerCase());
  });

  banner.addEventListener("submit", async (e) => {
    if (e.target.id !== "hiddenPromptForm") return;
    e.preventDefault();
    if (!activeMenu) return;
    const input = banner.querySelector("#hiddenPromptInput");
    const answer = input.value.trim();
    if (answer === activeMenu.code) {
      const menu = activeMenu;
      closePrompt();
      await unlockMenu(menu);
      location.href = menu.href;
    } else {
      closePrompt();
    }
  });

  banner.addEventListener("click", (e) => {
    if (e.target.id === "hiddenPromptClose") closePrompt();
  });

  async function unlockMenu(menu) {
    if (!window.currentUser) return;
    unlockedKeys.add(menu.key);
    try {
      await sb.from("unlocked_menus").insert({
        user_id: window.currentUser.id,
        username: window.currentUser.username,
        menu_key: menu.key,
      });
    } catch (err) {
      // 이미 해금된 경우 등은 무시
    }
  }

  async function renderUnlockedMenus() {
    if (!window.currentUser) return;
    const { data } = await sb
      .from("unlocked_menus")
      .select("menu_key")
      .eq("user_id", window.currentUser.id);

    unlockedKeys = new Set((data || []).map(r => r.menu_key));

    const container = document.querySelector(".navbar__menu");
    if (!container) return;
    for (const m of HIDDEN_MENUS) {
      if (unlockedKeys.has(m.key)) {
        const a = document.createElement("a");
        a.className = "navbar__link";
        a.href = m.href;
        a.textContent = m.label;
        container.appendChild(a);
      }
    }
  }

  window.initHiddenMenus = renderUnlockedMenus;
})();
