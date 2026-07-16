function initSiteChrome(profile) {
  const usernameEl = document.getElementById("navUsername");
  const profileLink = document.getElementById("navProfile");
  const usersLink = document.getElementById("navUsersLink");
  const adminLink = document.getElementById("navAdminLink");

  if (usernameEl) usernameEl.textContent = profile.username;
  if (profileLink) profileLink.href = "profile.html?user=" + encodeURIComponent(profile.username);
  if (usersLink && profile.is_admin) usersLink.style.display = "inline-block";
  if (adminLink && profile.is_admin) adminLink.style.display = "inline-block";
}
