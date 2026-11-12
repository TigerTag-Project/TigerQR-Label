/* The theme button: dark by default, light when the system asks for it, or the
   reader's own choice, kept for the next visit (same key as the protocol site). */
(function () {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: light)");
  function shown() { root.dataset.shown = root.dataset.theme || (media.matches ? "light" : "dark"); }
  shown();
  media.addEventListener("change", shown);
  const btn = document.getElementById("themebtn");
  if (btn) btn.addEventListener("click", function () {
    const next = root.dataset.shown === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("tigertag-theme", next); } catch (e) {}
    shown();
  });
})();
