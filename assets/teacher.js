(() => {
  const $ = s => document.querySelector(s);
  const problemForm = $("#problemForm");
  const newsForm = $("#newsForm");
  const p = {
    editingId: $("#editingId"), title: $("#title"), subject: $("#subject"), unit: $("#unit"), difficulty: $("#difficulty"), tags: $("#tags"), problemUrl: $("#problemUrl"), answerUrl: $("#answerUrl"), note: $("#note"), list: $("#adminList"), count: $("#adminCount"), search: $("#adminSearch"), status: $("#statusMessage"), formTitle: $("#formTitle"), save: $("#saveButton"), cancel: $("#cancelEdit")
  };
  const n = {
    editingId: $("#newsEditingId"), date: $("#newsDate"), type: $("#newsType"), title: $("#newsTitle"), content: $("#newsContent"), list: $("#newsAdminList"), count: $("#newsAdminCount"), search: $("#newsAdminSearch"), status: $("#newsStatusMessage"), formTitle: $("#newsFormTitle"), save: $("#saveNewsButton"), cancel: $("#cancelNewsEdit")
  };
  let problems = [];
  let news = [];

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stars = value => "★".repeat(Number(value)||0);
  const cleanTags = value => [...new Set(value.split(",").map(t=>t.trim().replace(/^#+/,"")).filter(Boolean))];
  const makeId = prefix => (window.crypto?.randomUUID ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const today = () => new Date().toLocaleDateString("sv-SE");

  function setProblemStatus(msg, isError=false){ p.status.textContent = msg; p.status.style.color = isError ? "#b42318" : "#137a49"; }
  function setNewsStatus(msg, isError=false){ n.status.textContent = msg; n.status.style.color = isError ? "#b42318" : "#137a49"; }

  function resetProblemForm(){
    problemForm.reset(); p.difficulty.value = "2"; p.editingId.value = ""; p.formTitle.textContent = "新しい問題を登録"; p.save.textContent = "問題を追加"; p.cancel.hidden = true;
  }
  function resetNewsForm(){
    newsForm.reset(); n.date.value = today(); n.type.value = "問題追加"; n.editingId.value = ""; n.formTitle.textContent = "新しい新着情報を登録"; n.save.textContent = "新着情報を追加"; n.cancel.hidden = true;
  }

  function renderProblems(){
    const q = (p.search.value||"").toLowerCase();
    const rows = problems.filter(x => [x.title,x.subject,x.unit,x.note,...(x.tags||[])].join(" ").toLowerCase().includes(q));
    p.count.textContent = problems.length;
    p.list.innerHTML = rows.length ? rows.map(x => `<div class="admin-row"><div><h3>${esc(x.title)}</h3><p>${esc(x.subject)} ／ ${esc(x.unit)} ／ ${stars(x.difficulty)} ${x.tags?.length ? "／ " + x.tags.map(t=>"#"+esc(t)).join(" ") : ""}</p></div><div class="admin-actions"><button class="small-button" type="button" data-edit="${esc(x.id)}">編集</button><button class="small-button danger" type="button" data-delete="${esc(x.id)}">削除</button></div></div>`).join("") : '<div class="empty-state"><p>登録データがありません。</p></div>';
  }

  function renderNews(){
    const q = (n.search.value||"").toLowerCase();
    const rows = news.filter(x => [x.title,x.content,x.type,x.date].join(" ").toLowerCase().includes(q)).sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")) || String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
    n.count.textContent = news.length;
    n.list.innerHTML = rows.length ? rows.map(x => `<div class="admin-row news-admin-row"><div><h3>${esc(x.title)}</h3><p>${esc(x.date)} ／ ${esc(x.type || 'お知らせ')}${x.content ? ` ／ ${esc(x.content)}` : ''}</p></div><div class="admin-actions"><button class="small-button" type="button" data-news-edit="${esc(x.id)}">編集</button><button class="small-button danger" type="button" data-news-delete="${esc(x.id)}">削除</button></div></div>`).join("") : '<div class="empty-state"><p>新着情報がありません。</p></div>';
  }

  problemForm.addEventListener("submit", e => {
    e.preventDefault();
    const record = { id: p.editingId.value || makeId("p"), title: p.title.value.trim(), subject: p.subject.value, unit: p.unit.value.trim(), difficulty: Number(p.difficulty.value), tags: cleanTags(p.tags.value), problemUrl: p.problemUrl.value.trim(), answerUrl: p.answerUrl.value.trim(), note: p.note.value.trim(), createdAt: new Date().toISOString() };
    if (p.editingId.value){
      const i = problems.findIndex(x => x.id === p.editingId.value); if (i >= 0) record.createdAt = problems[i].createdAt || record.createdAt; if (i >= 0) problems[i] = record;
      setProblemStatus("問題情報を更新しました。公開反映には problems.json の書き出しが必要です。");
    } else { problems.unshift(record); setProblemStatus("問題を追加しました。公開反映には problems.json の書き出しが必要です。"); }
    resetProblemForm(); renderProblems();
  });

  p.list.addEventListener("click", e => {
    const editBtn = e.target.closest("[data-edit]"); const delBtn = e.target.closest("[data-delete]");
    if (editBtn){
      const x = problems.find(v => v.id === editBtn.dataset.edit); if (!x) return;
      p.editingId.value=x.id; p.title.value=x.title; p.subject.value=x.subject; p.unit.value=x.unit; p.difficulty.value=x.difficulty; p.tags.value=(x.tags||[]).join(", "); p.problemUrl.value=x.problemUrl||""; p.answerUrl.value=x.answerUrl||""; p.note.value=x.note||""; p.formTitle.textContent="問題情報を編集"; p.save.textContent="変更を保存"; p.cancel.hidden=false; window.scrollTo({top:0,behavior:"smooth"});
    }
    if (delBtn){
      const x=problems.find(v=>v.id===delBtn.dataset.delete); if(!x) return;
      if(confirm(`「${x.title}」を削除しますか？`)){ problems=problems.filter(v=>v.id!==x.id); resetProblemForm(); renderProblems(); setProblemStatus("問題を削除しました。公開反映には problems.json の書き出しが必要です。"); }
    }
  });

  newsForm.addEventListener("submit", e => {
    e.preventDefault();
    const record = { id: n.editingId.value || makeId("n"), date: n.date.value, type: n.type.value, title: n.title.value.trim(), content: n.content.value.trim(), createdAt: new Date().toISOString() };
    if (n.editingId.value){
      const i = news.findIndex(x => x.id === n.editingId.value); if (i >= 0) record.createdAt = news[i].createdAt || record.createdAt; if (i >= 0) news[i] = record;
      setNewsStatus("新着情報を更新しました。公開反映には news.json の書き出しが必要です。");
    } else { news.unshift(record); setNewsStatus("新着情報を追加しました。公開反映には news.json の書き出しが必要です。"); }
    resetNewsForm(); renderNews();
  });

  n.list.addEventListener("click", e => {
    const editBtn = e.target.closest("[data-news-edit]"); const delBtn = e.target.closest("[data-news-delete]");
    if (editBtn){
      const x = news.find(v => v.id === editBtn.dataset.newsEdit); if (!x) return;
      n.editingId.value=x.id; n.date.value=x.date; n.type.value=x.type||"お知らせ"; n.title.value=x.title; n.content.value=x.content||""; n.formTitle.textContent="新着情報を編集"; n.save.textContent="変更を保存"; n.cancel.hidden=false; document.querySelector('.section-divider').scrollIntoView({behavior:"smooth", block:"start"});
    }
    if (delBtn){
      const x=news.find(v=>v.id===delBtn.dataset.newsDelete); if(!x) return;
      if(confirm(`「${x.title}」を削除しますか？`)){ news=news.filter(v=>v.id!==x.id); resetNewsForm(); renderNews(); setNewsStatus("新着情報を削除しました。公開反映には news.json の書き出しが必要です。"); }
    }
  });

  async function loadProblems(silent=false){
    try{ const r=await fetch("./data/problems.json",{cache:"no-store"}); if(!r.ok) throw new Error(); const data=await r.json(); if(!Array.isArray(data)) throw new Error(); problems=data; renderProblems(); if(!silent) setProblemStatus("現在公開中の problems.json を読み込みました。"); }
    catch{ setProblemStatus("problems.json の読み込みに失敗しました。", true); }
  }
  async function loadNews(silent=false){
    try{ const r=await fetch("./data/news.json",{cache:"no-store"}); if(!r.ok) throw new Error(); const data=await r.json(); if(!Array.isArray(data)) throw new Error(); news=data; renderNews(); if(!silent) setNewsStatus("現在公開中の news.json を読み込みました。"); }
    catch{ news=[]; renderNews(); setNewsStatus("news.json がまだありません。最初の新着情報を登録して書き出してください。", false); }
  }
  function exportArray(filename, data, setStatus){
    const blob=new Blob([JSON.stringify(data,null,2)+"\n"],{type:"application/json"}); const a=document.createElement("a"); const url=URL.createObjectURL(blob); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); setStatus(`${filename} を書き出しました。GitHubの data/${filename} と置き換えてください。`);
  }

  $("#clearForm").addEventListener("click", resetProblemForm); p.cancel.addEventListener("click", resetProblemForm); p.search.addEventListener("input", renderProblems);
  $("#clearNewsForm").addEventListener("click", resetNewsForm); n.cancel.addEventListener("click", resetNewsForm); n.search.addEventListener("input", renderNews);
  $("#loadCurrent").addEventListener("click", () => loadProblems(false));
  $("#loadCurrentNews").addEventListener("click", () => loadNews(false));

  $("#importFile").addEventListener("change", async e => { const file=e.target.files?.[0]; if(!file) return; try{ const data=JSON.parse(await file.text()); if(!Array.isArray(data)) throw new Error(); problems=data; renderProblems(); setProblemStatus(`${file.name} を読み込みました。`); }catch{ setProblemStatus("JSONファイルを読み込めませんでした。",true); }finally{ e.target.value=""; } });
  $("#importNewsFile").addEventListener("change", async e => { const file=e.target.files?.[0]; if(!file) return; try{ const data=JSON.parse(await file.text()); if(!Array.isArray(data)) throw new Error(); news=data; renderNews(); setNewsStatus(`${file.name} を読み込みました。`); }catch{ setNewsStatus("news.jsonを読み込めませんでした。",true); }finally{ e.target.value=""; } });
  $("#exportJson").addEventListener("click", () => exportArray("problems.json", problems, setProblemStatus));
  $("#exportNewsJson").addEventListener("click", () => exportArray("news.json", news, setNewsStatus));

  resetProblemForm(); resetNewsForm(); renderProblems(); renderNews();
  loadProblems(true); loadNews(true);
})();
