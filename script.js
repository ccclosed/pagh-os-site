// pagh — небольшие интеракции: темы (как settings в самой ОС), копирование
// команд, появление секций, лайтбокс скриншотов.
(() => {
  const root = document.documentElement;
  const THEMES = ["nord", "amber", "green", "paper", "synth"];
  const STORE = "pagh.theme";

  const themeName = document.querySelector("[data-theme-name]");
  const cycleBtn = document.querySelector("[data-theme-cycle]");

  function applyTheme(name) {
    if (!THEMES.includes(name)) name = "nord";
    root.dataset.theme = name;
    if (themeName) themeName.textContent = name;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
    try {
      localStorage.setItem(STORE, name);
    } catch {}
  }

  // ?theme=paper — для QA и шеринга конкретной темы, без записи в localStorage.
  const fromUrl = new URLSearchParams(location.search).get("theme");
  if (fromUrl && THEMES.includes(fromUrl)) {
    root.dataset.theme = fromUrl;
    if (themeName) themeName.textContent = fromUrl;
  } else {
    let saved = null;
    try {
      saved = localStorage.getItem(STORE);
    } catch {}
    applyTheme(saved || "nord");
  }

  if (cycleBtn) {
    cycleBtn.addEventListener("click", () => {
      const i = THEMES.indexOf(root.dataset.theme);
      applyTheme(THEMES[(i + 1) % THEMES.length]);
    });
  }

  // T переключает тему, но не мешает печатать и не мешает браузерным шорткатам.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "t" && e.key !== "T") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const i = THEMES.indexOf(root.dataset.theme);
    applyTheme(THEMES[(i + 1) % THEMES.length]);
  });

  // --- nav ---------------------------------------------------------------
  const nav = document.getElementById("nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // --- copy --------------------------------------------------------------
  document.querySelectorAll(".code .copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pre = btn.parentElement.querySelector("pre");
      if (!pre) return;
      const text = pre.innerText.replace(/\n+$/, "");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      const old = btn.textContent;
      btn.textContent = "скопировано";
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = old;
        btn.classList.remove("done");
      }, 1400);
    });
  });

  // --- reveal ------------------------------------------------------------
  const reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveal.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add("in"));
  }

  // --- lightbox ----------------------------------------------------------
  const dlg = document.querySelector("[data-lightbox]");
  const lbImg = document.querySelector("[data-lb-img]");
  const lbTitle = document.querySelector("[data-lb-title]");
  if (dlg && lbImg) {
    document.querySelectorAll(".shot[data-full]").forEach((shot) => {
      shot.addEventListener("click", () => {
        lbImg.src = shot.dataset.full;
        lbImg.alt = shot.querySelector("img")?.alt || "";
        if (lbTitle) lbTitle.textContent = shot.dataset.title || "";
        dlg.showModal();
      });
    });
    const close = () => dlg.close();
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-lb-close]")) close();
    });
    dlg.addEventListener("close", () => {
      lbImg.removeAttribute("src");
    });
  }

  // --- year --------------------------------------------------------------
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();