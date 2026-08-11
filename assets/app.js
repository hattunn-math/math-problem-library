(() => {
  const $ = (s) => document.querySelector(s);
  const els = {
    search: $("#searchInput"),
    subject: $("#subjectFilter"),
    unit: $("#unitFilter"),
    difficulty: $("#difficultyFilter"),
    progress: $("#progressFilter"),
    favoriteOnly: $("#favoriteOnly"),
    tags: $("#tagFilters"),
    sort: $("#sortSelect"),
    list: $("#problemList"),
    count: $("#resultCount"),
    totalCount: $("#totalProblemCount"),
    favoriteCount: $("#favoriteCount"),
    solvedCount: $("#solvedCount"),
    newSection: $("#newProblemsSection"),
    newList: $("#newProblemsList"),
    empty: $("#emptyState"),
    error: $("#loadError"),
    reset: $("#resetFilters"),
    active: $("#activeFilters")
  };

  const STORAGE = {
    favorites: "math-problem-library:favorites:v1",
    solved: "math-problem-library:solved:v1"
  };

  let problems = [];
  let activeTag = "";
  let favorites = loadSet(STORAGE.favorites);
  let solved = loadSet(STORAGE.solved);

  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFKC");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const stars = (n) => "★".repeat(Number(n) || 0);

  function loadSet(key){
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return new Set(Array.isArray(value) ? value.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function saveSet(key, set){
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
      // 保存不可の環境でも、そのページを開いている間は状態変更を利用できます。
    }
  }

  function uniqSorted(values){
    return [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ja"));
  }

  function countBy(values){
    return values.reduce((map, value) => {
      if (value) map.set(value, (map.get(value) || 0) + 1);
      return map;
    }, new Map());
  }

  function isNewProblem(createdAt){
    if (!createdAt) return false;
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return false;
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }

  function getNewProblems(){
    return problems
      .filter(p => isNewProblem(p.createdAt))
      .sort((a,b) => String(b.createdAt||"").localeCompare(String(a.createdAt||"")))
      .slice(0, 5);
  }

  function renderNewProblems(){
    const rows = getNewProblems();
    els.newSection.hidden = rows.length === 0;
    if (!rows.length) {
      els.newList.innerHTML = "";
      return;
    }

    els.newList.innerHTML = rows.map(p => {
      const id = String(p.id ?? "");
      return `
        <button class="new-problem-link" type="button" data-jump="${esc(id)}">
          <span class="new-problem-link-main">
            <span class="new-list-badge">NEW</span>
            <span class="new-problem-link-title">${esc(p.title)}</span>
          </span>
          <span class="new-problem-link-meta">${esc(p.subject)} ／ ${esc(p.unit)} ／ ${stars(p.difficulty)}</span>
          <span class="new-problem-link-arrow" aria-hidden="true">↓</span>
        </button>`;
    }).join("");
  }

  function jumpToProblem(id){
    // If current filters hide the selected new problem, reset filtering first.
    const targetProblem = problems.find(p => String(p.id ?? "") === String(id));
    if (!targetProblem) return;

    els.search.value = "";
    els.subject.value = "";
    updateUnits();
    els.unit.value = "";
    els.difficulty.value = "";
    els.progress.value = "";
    els.favoriteOnly.checked = false;
    activeTag = "";
    [...els.tags.querySelectorAll(".tag-chip")].forEach(x => x.classList.remove("active"));
    render();

    requestAnimationFrame(() => {
      const card = document.getElementById(`problem-${CSS.escape(String(id))}`);
      if (!card) return;
      card.scrollIntoView({behavior:"smooth", block:"center"});
      card.classList.remove("jump-highlight");
      // force reflow so repeated clicks re-trigger animation
      void card.offsetWidth;
      card.classList.add("jump-highlight");
      setTimeout(() => card.classList.remove("jump-highlight"), 2600);
    });
  }

  function populateFilters(){
    const currentSubject = els.subject.value;
    const subjectCounts = countBy(problems.map(p => p.subject));
    const subjects = uniqSorted(problems.map(p => p.subject));

    els.subject.innerHTML =
      `<option value="">すべて（${problems.length}問）</option>` +
      subjects.map(v => `<option value="${esc(v)}">${esc(v)}（${subjectCounts.get(v)}問）</option>`).join("");

    if (subjects.includes(currentSubject)) els.subject.value = currentSubject;
    updateUnits();

    const tags = uniqSorted(problems.flatMap(p => Array.isArray(p.tags) ? p.tags : []));
    els.tags.innerHTML = tags.length
      ? tags.map(t => `<button type="button" class="tag-chip" data-tag="${esc(t)}">#${esc(t)}</button>`).join("")
      : '<span class="muted">タグなし</span>';
  }

  function updateUnits(){
    const selectedSubject = els.subject.value;
    const baseRows = problems.filter(p => !selectedSubject || p.subject === selectedSubject);
    const unitCounts = countBy(baseRows.map(p => p.unit));
    const units = uniqSorted(baseRows.map(p => p.unit));
    const currentUnit = els.unit.value;

    els.unit.innerHTML =
      `<option value="">すべて（${baseRows.length}問）</option>` +
      units.map(v => `<option value="${esc(v)}">${esc(v)}（${unitCounts.get(v)}問）</option>`).join("");

    if (units.includes(currentUnit)) els.unit.value = currentUnit;
  }

  function getFiltered(){
    const q = norm(els.search.value.trim());

    let rows = problems.filter(p => {
      const id = String(p.id ?? "");
      const hay = norm([p.title,p.subject,p.unit,p.note,...(p.tags||[])].join(" "));
      const isSolved = solved.has(id);

      return (!q || hay.includes(q))
        && (!els.subject.value || p.subject === els.subject.value)
        && (!els.unit.value || p.unit === els.unit.value)
        && (!els.difficulty.value || String(p.difficulty) === els.difficulty.value)
        && (!activeTag || (p.tags||[]).includes(activeTag))
        && (!els.favoriteOnly.checked || favorites.has(id))
        && (!els.progress.value
          || (els.progress.value === "solved" && isSolved)
          || (els.progress.value === "unsolved" && !isSolved));
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
    if (els.favoriteOnly.checked) chips.push("★ お気に入り");
    if (els.progress.value === "solved") chips.push("解答済み");
    if (els.progress.value === "unsolved") chips.push("未解答");
    els.active.innerHTML = chips.map(c => `<span class="active-chip">${esc(c)}</span>`).join("");
  }

  function renderSummary(){
    const validIds = new Set(problems.map(p => String(p.id ?? "")));
    favorites = new Set([...favorites].filter(id => validIds.has(id)));
    solved = new Set([...solved].filter(id => validIds.has(id)));
    saveSet(STORAGE.favorites, favorites);
    saveSet(STORAGE.solved, solved);

    els.totalCount.textContent = problems.length;
    els.favoriteCount.textContent = [...favorites].filter(id => validIds.has(id)).length;
    els.solvedCount.textContent = [...solved].filter(id => validIds.has(id)).length;
  }

  function render(){
    const rows = getFiltered();
    els.count.textContent = rows.length;
    els.empty.hidden = rows.length !== 0;
    renderActive();
    renderSummary();
    renderNewProblems();

    els.list.innerHTML = rows.map(p => {
      const id = String(p.id ?? "");
      const favorite = favorites.has(id);
      const isSolved = solved.has(id);
      const newBadge = isNewProblem(p.createdAt) ? '<span class="new-problem-badge">NEW</span>' : '';

      return `
        <article id="problem-${esc(id)}" class="problem-card ${isSolved ? 'problem-solved' : ''}">
          <div class="problem-top">
            <div>
              <div class="problem-title-row">
                ${newBadge}
                <h3 class="problem-title">${esc(p.title)}</h3>
              </div>
              <div class="problem-meta">
                <span class="meta-pill">${esc(p.subject)}</span>
                <span class="meta-pill">${esc(p.unit)}</span>
                ${isSolved ? '<span class="solved-pill">解答済み</span>' : ''}
              </div>
            </div>
            <div class="difficulty" aria-label="難易度${Number(p.difficulty)}">${stars(p.difficulty)}</div>
          </div>

          ${p.note ? `<p class="problem-note">${esc(p.note)}</p>` : ""}

          ${(p.tags||[]).length ? `
            <div class="problem-tags">
              ${p.tags.map(t=>`<span class="problem-tag">#${esc(t)}</span>`).join("")}
            </div>` : ""}

          <div class="personal-actions">
            <button
              class="state-button favorite-button ${favorite ? 'active' : ''}"
              type="button"
              data-favorite="${esc(id)}"
              aria-pressed="${favorite}">
              ${favorite ? '★ お気に入り済み' : '☆ お気に入り'}
            </button>

            <button
              class="state-button solved-button ${isSolved ? 'active' : ''}"
              type="button"
              data-solved="${esc(id)}"
              aria-pressed="${isSolved}">
              ${isSolved ? '✓ 解答済み' : '○ 未解答'}
            </button>
          </div>

          <div class="problem-actions">
            <a class="primary-link" href="${esc(p.problemUrl)}" target="_blank" rel="noopener noreferrer">問題を見る</a>
            ${p.answerUrl
              ? `<a class="secondary-link" href="${esc(p.answerUrl)}" target="_blank" rel="noopener noreferrer">解答を見る</a>`
              : `<span class="secondary-link disabled">解答なし</span>`}
          </div>
        </article>`;
    }).join("");
  }

  els.search.addEventListener("input", render);
  els.subject.addEventListener("change", () => { updateUnits(); render(); });
  els.unit.addEventListener("change", render);
  els.difficulty.addEventListener("change", render);
  els.progress.addEventListener("change", render);
  els.favoriteOnly.addEventListener("change", render);
  els.sort.addEventListener("change", render);

  els.tags.addEventListener("click", e => {
    const b = e.target.closest("[data-tag]");
    if (!b) return;
    activeTag = activeTag === b.dataset.tag ? "" : b.dataset.tag;
    [...els.tags.querySelectorAll(".tag-chip")]
      .forEach(x => x.classList.toggle("active", x.dataset.tag === activeTag));
    render();
  });

  els.list.addEventListener("click", e => {
    const favoriteBtn = e.target.closest("[data-favorite]");
    const solvedBtn = e.target.closest("[data-solved]");

    if (favoriteBtn) {
      const id = favoriteBtn.dataset.favorite;
      favorites.has(id) ? favorites.delete(id) : favorites.add(id);
      saveSet(STORAGE.favorites, favorites);
      render();
      return;
    }

    if (solvedBtn) {
      const id = solvedBtn.dataset.solved;
      solved.has(id) ? solved.delete(id) : solved.add(id);
      saveSet(STORAGE.solved, solved);
      render();
    }
  });

  els.newList.addEventListener("click", e => {
    const button = e.target.closest("[data-jump]");
    if (!button) return;
    jumpToProblem(button.dataset.jump);
  });

  els.reset.addEventListener("click", () => {
    els.search.value = "";
    els.subject.value = "";
    updateUnits();
    els.unit.value = "";
    els.difficulty.value = "";
    els.progress.value = "";
    els.favoriteOnly.checked = false;
    activeTag = "";
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