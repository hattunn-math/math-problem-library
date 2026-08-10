(() => {
  const $ = (s) => document.querySelector(s);
  const els = {
    search: $("#searchInput"), subject: $("#subjectFilter"), unit: $("#unitFilter"),
    difficulty: $("#difficultyFilter"), tags: $("#tagFilters"), sort: $("#sortSelect"),
    list: $("#problemList"), count: $("#resultCount"), empty: $("#emptyState"),
    error: $("#loadError"), reset: $("#resetFilters"), active: $("#activeFilters")
  };
  let problems = [];
  let activeTag = "";

  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFKC");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stars = (n) => "★".repeat(Number(n) || 0);

  function uniqSorted(values){
    return [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ja"));
  }

  function populateFilters(){
    const subjects = uniqSorted(problems.map(p => p.subject));
    els.subject.innerHTML = '<option value="">すべて</option>' + subjects.map(v => `<option>${esc(v)}</option>`).join("");
    updateUnits();

    const tags = uniqSorted(problems.flatMap(p => Array.isArray(p.tags) ? p.tags : []));
    els.tags.innerHTML = tags.length
      ? tags.map(t => `<button type="button" class="tag-chip" data-tag="${esc(t)}">#${esc(t)}</button>`).join("")
      : '<span class="muted">タグなし</span>';
  }

  function updateUnits(){
    const selected = els.subject.value;
    const units = uniqSorted(problems.filter(p => !selected || p.subject === selected).map(p => p.unit));
    const current = els.unit.value;
    els.unit.innerHTML = '<option value="">すべて</option>' + units.map(v => `<option>${esc(v)}</option>`).join("");
    if (units.includes(current)) els.unit.value = current;
  }

  function getFiltered(){
    const q = norm(els.search.value.trim());
    let rows = problems.filter(p => {
      const hay = norm([p.title,p.subject,p.unit,p.note,...(p.tags||[])].join(" "));
      return (!q || hay.includes(q))
        && (!els.subject.value || p.subject === els.subject.value)
        && (!els.unit.value || p.unit === els.unit.value)
        && (!els.difficulty.value || String(p.difficulty) === els.difficulty.value)
        && (!activeTag || (p.tags||[]).includes(activeTag));
    });

    const mode = els.sort.value;
    rows.sort((a,b) => {
      if (mode === "oldest") return String(a.createdAt||"").localeCompare(String(b.createdAt||""));
      if (mode === "title") return String(a.title).localeCompare(String(b.title),"ja");
      if (mode === "difficultyAsc") return Number(a.difficulty)-Number(b.difficulty);
      if (mode === "difficultyDesc") return Number(b.difficulty)-Number(a.difficulty);
      return String(b.createdAt||"").localeCompare(String(a.createdAt||""));
    });
    return rows;
  }

  function renderActive(){
    const chips = [];
    if (els.search.value.trim()) chips.push(`検索: ${els.search.value.trim()}`);
    if (els.subject.value) chips.push(els.subject.value);
    if (els.unit.value) chips.push(els.unit.value);
    if (els.difficulty.value) chips.push(stars(els.difficulty.value));
    if (activeTag) chips.push(`#${activeTag}`);
    els.active.innerHTML = chips.map(c => `<span class="active-chip">${esc(c)}</span>`).join("");
  }

  function render(){
    const rows = getFiltered();
    els.count.textContent = rows.length;
    els.empty.hidden = rows.length !== 0;
    renderActive();

    els.list.innerHTML = rows.map(p => `
      <article class="problem-card">
        <div class="problem-top">
          <div>
            <h3 class="problem-title">${esc(p.title)}</h3>
            <div class="problem-meta">
              <span class="meta-pill">${esc(p.subject)}</span>
              <span class="meta-pill">${esc(p.unit)}</span>
            </div>
          </div>
          <div class="difficulty" aria-label="難易度${Number(p.difficulty)}">${stars(p.difficulty)}</div>
        </div>
        ${p.note ? `<p class="problem-note">${esc(p.note)}</p>` : ""}
        ${(p.tags||[]).length ? `<div class="problem-tags">${p.tags.map(t=>`<span class="problem-tag">#${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="problem-actions">
          <a class="primary-link" href="${esc(p.problemUrl)}" target="_blank" rel="noopener noreferrer">問題を見る</a>
          ${p.answerUrl
            ? `<a class="secondary-link" href="${esc(p.answerUrl)}" target="_blank" rel="noopener noreferrer">解答を見る</a>`
            : `<span class="secondary-link disabled">解答なし</span>`}
        </div>
      </article>`).join("");
  }

  els.search.addEventListener("input", render);
  els.subject.addEventListener("change", () => { updateUnits(); render(); });
  els.unit.addEventListener("change", render);
  els.difficulty.addEventListener("change", render);
  els.sort.addEventListener("change", render);
  els.tags.addEventListener("click", e => {
    const b = e.target.closest("[data-tag]");
    if (!b) return;
    activeTag = activeTag === b.dataset.tag ? "" : b.dataset.tag;
    [...els.tags.querySelectorAll(".tag-chip")].forEach(x => x.classList.toggle("active", x.dataset.tag === activeTag));
    render();
  });
  els.reset.addEventListener("click", () => {
    els.search.value = ""; els.subject.value = ""; updateUnits(); els.unit.value = "";
    els.difficulty.value = ""; activeTag = "";
    [...els.tags.querySelectorAll(".tag-chip")].forEach(x => x.classList.remove("active"));
    render();
  });

  fetch("./data/problems.json", {cache:"no-store"})
    .then(r => { if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      problems = Array.isArray(data) ? data : [];
      populateFilters();
      render();
    })
    .catch(() => {
      els.error.hidden = false;
      els.empty.hidden = true;
      els.list.innerHTML = "";
    });
})();