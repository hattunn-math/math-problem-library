(() => {
  const $ = s => document.querySelector(s);
  const form = $("#problemForm");
  const els = {
    editingId: $("#editingId"), title: $("#title"), subject: $("#subject"), unit: $("#unit"),
    difficulty: $("#difficulty"), tags: $("#tags"), problemUrl: $("#problemUrl"),
    answerUrl: $("#answerUrl"), note: $("#note"), list: $("#adminList"), count: $("#adminCount"),
    search: $("#adminSearch"), status: $("#statusMessage"), formTitle: $("#formTitle"),
    save: $("#saveButton"), cancel: $("#cancelEdit")
  };
  let problems = [];

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stars = n => "★".repeat(Number(n)||0);
  const cleanTags = value => [...new Set(value.split(",").map(t=>t.trim().replace(/^#+/,"")).filter(Boolean))];
  const id = () => (crypto.randomUUID ? crypto.randomUUID() : "p-" + Date.now() + "-" + Math.random().toString(16).slice(2));

  function setStatus(msg, isError=false){
    els.status.textContent = msg;
    els.status.style.color = isError ? "#b42318" : "#137a49";
  }

  function resetForm(){
    form.reset();
    els.difficulty.value = "2";
    els.editingId.value = "";
    els.formTitle.textContent = "新しい問題を登録";
    els.save.textContent = "問題を追加";
    els.cancel.hidden = true;
  }

  function render(){
    const q = (els.search.value||"").toLowerCase();
    const rows = problems.filter(p => [p.title,p.subject,p.unit,p.note,...(p.tags||[])].join(" ").toLowerCase().includes(q));
    els.count.textContent = problems.length;
    els.list.innerHTML = rows.length ? rows.map(p => `
      <div class="admin-row">
        <div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.subject)} ／ ${esc(p.unit)} ／ ${stars(p.difficulty)} ${p.tags?.length ? "／ " + p.tags.map(t=>"#"+esc(t)).join(" ") : ""}</p>
        </div>
        <div class="admin-actions">
          <button class="small-button" type="button" data-edit="${esc(p.id)}">編集</button>
          <button class="small-button danger" type="button" data-delete="${esc(p.id)}">削除</button>
        </div>
      </div>`).join("") : '<div class="empty-state"><p>登録データがありません。</p></div>';
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const record = {
      id: els.editingId.value || id(),
      title: els.title.value.trim(),
      subject: els.subject.value,
      unit: els.unit.value.trim(),
      difficulty: Number(els.difficulty.value),
      tags: cleanTags(els.tags.value),
      problemUrl: els.problemUrl.value.trim(),
      answerUrl: els.answerUrl.value.trim(),
      note: els.note.value.trim(),
      createdAt: new Date().toISOString()
    };
    if (els.editingId.value){
      const i = problems.findIndex(p => p.id === els.editingId.value);
      if (i >= 0) record.createdAt = problems[i].createdAt || record.createdAt;
      problems[i] = record;
      setStatus("問題情報を更新しました。公開反映にはJSONの書き出しが必要です。");
    } else {
      problems.unshift(record);
      setStatus("問題を追加しました。公開反映にはJSONの書き出しが必要です。");
    }
    resetForm();
    render();
  });

  els.list.addEventListener("click", e => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-delete]");
    if (editBtn){
      const p = problems.find(x => x.id === editBtn.dataset.edit);
      if (!p) return;
      els.editingId.value = p.id; els.title.value = p.title; els.subject.value = p.subject;
      els.unit.value = p.unit; els.difficulty.value = p.difficulty; els.tags.value = (p.tags||[]).join(", ");
      els.problemUrl.value = p.problemUrl||""; els.answerUrl.value = p.answerUrl||""; els.note.value = p.note||"";
      els.formTitle.textContent = "問題情報を編集";
      els.save.textContent = "変更を保存";
      els.cancel.hidden = false;
      window.scrollTo({top:0,behavior:"smooth"});
    }
    if (delBtn){
      const p = problems.find(x => x.id === delBtn.dataset.delete);
      if (!p) return;
      if (confirm(`「${p.title}」を削除しますか？`)){
        problems = problems.filter(x => x.id !== p.id);
        resetForm(); render();
        setStatus("問題を削除しました。公開反映にはJSONの書き出しが必要です。");
      }
    }
  });

  $("#clearForm").addEventListener("click", resetForm);
  els.cancel.addEventListener("click", resetForm);
  els.search.addEventListener("input", render);

  $("#loadCurrent").addEventListener("click", async () => {
    try{
      const r = await fetch("./data/problems.json", {cache:"no-store"});
      if(!r.ok) throw new Error();
      const data = await r.json();
      if(!Array.isArray(data)) throw new Error();
      problems = data;
      render();
      setStatus("現在公開中の problems.json を読み込みました。");
    }catch{
      setStatus("読み込みに失敗しました。teacher.htmlをWebサーバー経由で開いているか確認してください。", true);
    }
  });

  $("#importFile").addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try{
      const data = JSON.parse(await file.text());
      if(!Array.isArray(data)) throw new Error();
      problems = data;
      render();
      setStatus(`${file.name} を読み込みました。`);
    }catch{
      setStatus("JSONファイルを読み込めませんでした。", true);
    } finally {
      e.target.value = "";
    }
  });

  $("#exportJson").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(problems, null, 2) + "\n"], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "problems.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
    setStatus("problems.json を書き出しました。GitHubの data/problems.json と置き換えてください。");
  });

  render();
})();