function initSiteChrome(profile) {
  const usernameEl = document.getElementById("navUsername");
  const profileLink = document.getElementById("navProfile");
  const usersLink = document.getElementById("navUsersLink");
  const adminLink = document.getElementById("navAdminLink");

  if (usernameEl) usernameEl.textContent = profile.username;
  if (profileLink) profileLink.href = "profile.html?user=" + encodeURIComponent(profile.username);
  if (usersLink && profile.is_admin) usersLink.style.display = "inline-block";
  if (adminLink && profile.is_admin) adminLink.style.display = "inline-block";

  if (profileLink && !document.getElementById("navNotifyDot")) {
    const dot = document.createElement("span");
    dot.id = "navNotifyDot";
    dot.className = "navbar__notify-dot";
    dot.style.display = "none";
    profileLink.appendChild(dot);
  }

  checkNotifications(profile);
}

async function checkNotifications(profile) {
  const dot = document.getElementById("navNotifyDot");
  if (!dot) return;
  let hasNotif = false;

  const dmSeenAt = profile.dm_seen_at || "1970-01-01T00:00:00Z";
  const { count: dmCount } = await sb
    .from("dm_messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", profile.id)
    .gt("created_at", dmSeenAt);
  if (dmCount) hasNotif = true;

  const suggSeenAt = profile.suggestions_seen_at || "1970-01-01T00:00:00Z";

  if (profile.is_admin) {
    const { count: newSuggCount } = await sb
      .from("suggestions")
      .select("id", { count: "exact", head: true })
      .is("admin_reply", null)
      .gt("created_at", suggSeenAt);
    if (newSuggCount) hasNotif = true;
  } else {
    const { count: repliedCount } = await sb
      .from("suggestions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .not("admin_reply", "is", null)
      .gt("replied_at", suggSeenAt);
    if (repliedCount) hasNotif = true;
  }

  dot.style.display = hasNotif ? "inline-block" : "none";
}
