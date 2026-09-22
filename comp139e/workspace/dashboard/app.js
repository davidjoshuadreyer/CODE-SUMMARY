"use strict";
const $ = (id) => document.getElementById(id);
let programs = [], selected = null, token = "", category = "all", session = null;
let histories = new Map(), fileMode = "source", outputFiles = [], viewBuild = false, busy = false;
let pollBusy = false, lastSessionStatus = "", sourceRequest = 0;

async function api(path, body) {
  const options = body === undefined ? {} : {method:"POST", headers:{"Content-Type":"application/json", "X-Dashboard-Token":token}, body:JSON.stringify(body)};
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result;
}
function notify(message = "") { $("notice").textContent = message; $("notice").hidden = !message; }
function running() { return session?.status === "running"; }
function nameFor(id) { return id === "build" ? "Build programs" : programs.find(p => p.id === id)?.title || id; }

async function loadCatalog(first = false) {
  const data = await api("/api/catalog");
  token = data.token; programs = data.programs;
  $("total").textContent = programs.length;
  document.querySelectorAll("[data-count]").forEach(el => { el.textContent = el.dataset.count === "all" ? programs.length : programs.filter(p => p.kind === el.dataset.count).length; });
  if (first) {
    let saved;
    try { saved = localStorage.getItem("comp139-selected"); } catch {}
    const requested = new URL(location.href).searchParams.get("program");
    selectProgram(programs.find(p => p.id === requested) || programs.find(p => p.id === saved) || programs.find(p => p.id === data.default) || programs[0]);
  } else if (selected) {
    selected = programs.find(p => p.id === selected.id) || programs[0];
    renderLibrary(); updateControls();
  }
}
function renderLibrary() {
  const query = $("search").value.toLowerCase().trim();
  const matches = programs.filter(p => (category === "all" || p.kind === category) && `${p.title} ${p.label} ${p.group} ${p.id}`.toLowerCase().includes(query));
  $("programs").replaceChildren();
  $("shown-count").textContent = matches.length;
  $("list-label").textContent = {all:"ALL PROGRAMS", labs:"COURSE LABS", tutorials:"GUIDED LESSONS", examples:"REFERENCE EXAMPLES"}[category];
  for (const p of matches) {
    const button = document.createElement("button");
    button.className = "program-item" + (selected?.id === p.id ? " active" : "");
    button.setAttribute("aria-pressed", String(selected?.id === p.id));
    button.dataset.id = p.id;
    const dot = document.createElement("span"); dot.className = "program-dot";
    dot.textContent = p.kind === "examples" ? "{ }" : p.id.split(":")[1].padStart(2,"0");
    const text = document.createElement("span"); text.className = "program-text";
    const title = document.createElement("span"); title.className = "program-name"; title.textContent = p.title;
    const sub = document.createElement("span"); sub.className = "program-sub"; sub.textContent = p.kind === "examples" ? p.group : p.label;
    text.append(title,sub); button.append(dot,text); button.addEventListener("click",() => selectProgram(p));
    $("programs").append(button);
  }
  if (!matches.length) { const empty = document.createElement("p"); empty.className="empty-list"; empty.textContent="No programs found. Try another search."; $("programs").append(empty); }
}
function selectProgram(program) {
  selected = program; viewBuild = false; fileMode = "source"; notify();
  try { localStorage.setItem("comp139-selected",program.id); } catch {}
  $("program-title").textContent = program.title;
  $("kind-label").textContent = {labs:program.label, tutorials:program.label, examples:"REFERENCE EXAMPLE"}[program.kind].toUpperCase();
  $("group-label").textContent = program.group;
  $("source-path").textContent = program.source;
  $("program-note").textContent = program.note; $("program-note").hidden = !program.note;
  $("input-hint").textContent = program.inputHint;
  $("sample").hidden = !program.sample;
  $("program-input").value = ""; $("input-feedback").textContent = "";
  $("file-arguments").hidden = !program.fileArgs;
  $("input-file").value = program.inputFile || ""; $("output-file").value = program.outputFile || "";
  outputFiles = []; $("output-count").textContent = "0";
  renderLibrary();
  const active = $("programs").querySelector(".program-item.active");
  if (active) $("programs").scrollTop = active.offsetTop - $("programs").offsetTop - 70;
  renderConsole(); updateControls(); renderFiles(); refreshOutputs();
}
function updateControls() {
  $("run").disabled = busy || running() || !selected?.runnable;
  $("run").textContent = selected?.runnable ? "▶  Run program" : "Run in MATLAB";
  $("run").setAttribute("aria-label", selected?.runnable ? "Run program" : "Run in MATLAB");
  $("build").disabled = busy || running();
  $("stop").disabled = busy || !running();
  const accepts = running() && session.program === selected?.id && !session.inputClosed;
  $("send-input").disabled = busy || !accepts;
  $("close-input").disabled = busy || !accepts;
  $("program-input").disabled = !selected?.runnable;
  $("sample").disabled = !selected?.runnable;
  $("connection").textContent = running() ? `Running: ${nameFor(session.program)}` : "Connected to your course folder";
}
function renderConsole() {
  const current = viewBuild ? histories.get("build") : histories.get(selected?.id);
  const hasOutput = Boolean(current);
  $("console-empty").hidden = hasOutput; $("console").hidden = !hasOutput;
  const scroll = $("console-wrap"), nearBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 65;
  const text = current?.output || (current?.status === "running" ? "Starting…" : "");
  if ($("console").textContent !== text) { $("console").textContent = text + (current?.truncated ? "\n[Output preview limit reached.]" : ""); if(nearBottom) scroll.scrollTop=scroll.scrollHeight; }
  const state = current?.status || "ready";
  $("status").className = "status " + state;
  $("status").textContent = {ready:"Ready", running:"● Running", success:"✓ Finished", error:"Exited with error", stopped:"Stopped"}[state];
  $("run-detail").textContent = current ? `${viewBuild ? "Build" : "Run"} · ${current.exitCode === null ? "in progress" : "exit " + current.exitCode} · ${((current.ended || Date.now()/1000) - current.started).toFixed(1)} s` : "No run yet";
  $("copy-output").disabled = !current?.output;
}
async function poll() {
  if (pollBusy) return; pollBusy = true;
  try {
    const next = await api("/api/session");
    session = next;
    if (next) {
      histories.set(next.program,next);
      const stateKey = `${next.id}:${next.status}`;
      if (stateKey !== lastSessionStatus) {
        lastSessionStatus = stateKey;
        if (next.status !== "running") { refreshOutputs(); if (next.program === "build") await loadCatalog(); }
      }
    }
    renderConsole(); updateControls();
  } catch { $("connection").textContent = "Disconnected · check the dashboard terminal"; }
  finally { pollBusy = false; }
}
async function perform(action) {
  busy = true; updateControls(); notify();
  try { await action(); } catch(error) { notify(error.message); }
  finally { busy=false; updateControls(); }
}
async function sendInput() {
  const text = $("program-input").value;
  if (!text.length) return;
  await api("/api/input", {session:session.id, text:text.replace(/\n$/, "")});
  $("program-input").value=""; $("input-feedback").textContent = `Sent: ${text.replace(/\n/g," · ")}`;
  await poll();
}
$("run").addEventListener("click",() => perform(async () => {
  viewBuild=false;
  session=await api("/api/run",{id:selected.id,inputFile:$("input-file").value,outputFile:$("output-file").value});
  histories.set(session.program,session); renderConsole();
  if ($("program-input").value.length) await sendInput();
}));
$("build").addEventListener("click",() => perform(async () => {
  viewBuild=true; session=await api("/api/build",{}); histories.set("build",session); renderConsole();
}));
$("stop").addEventListener("click",() => perform(async () => { await api("/api/stop",{session:session.id}); await poll(); }));
$("send-input").addEventListener("click",() => perform(sendInput));
$("close-input").addEventListener("click",() => perform(async () => { await api("/api/input",{session:session.id,close:true}); $("input-feedback").textContent="Input closed. The program will see end of input."; await poll(); }));
$("sample").addEventListener("click",() => { $("program-input").value=selected.sample; $("program-input").focus(); $("input-feedback").textContent=running()?"Example input ready. Click Send input.":"Example input ready. Click Run program to send it."; });
$("program-input").addEventListener("keydown",event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !$("send-input").disabled) {event.preventDefault(); perform(sendInput);} });
$("copy-output").addEventListener("click",async () => { try {await navigator.clipboard.writeText($("console").textContent); $("copy-output").textContent="Copied!"; setTimeout(()=>$("copy-output").textContent="Copy output",1500);} catch {notify("Select the console text and copy it with Ctrl+C.");} });
$("search").addEventListener("input",renderLibrary);
document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>{category=button.dataset.kind; document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===button)); renderLibrary();}));

async function refreshOutputs() {
  if (!selected) return;
  const id = selected.id;
  try { const files = await api(`/api/outputs?id=${encodeURIComponent(id)}`); if(selected.id!==id)return; outputFiles=files; $("output-count").textContent=files.length; if(fileMode==="output")renderFiles(); } catch {}
}
function renderFiles() {
  const isSource=fileMode==="source";
  $("source-tab").classList.toggle("active",isSource); $("source-tab").setAttribute("aria-selected",String(isSource));
  $("outputs-tab").classList.toggle("active",!isSource); $("outputs-tab").setAttribute("aria-selected",String(!isSource));
  const files=isSource?selected.files:outputFiles;
  $("file-select").replaceChildren();
  for (const file of files) {const option=document.createElement("option");option.value=file;option.textContent=file.split("/").pop();option.title=file;$("file-select").append(option);}
  if (isSource && files.includes(selected.source)) $("file-select").value=selected.source;
  $("file-select").disabled=!files.length;
  $("file-note").textContent=isSource?"Read here · edit in VS Code":"Generated files · read-only preview";
  if (!files.length) { sourceRequest++; $("source-code").textContent="No output files for this program yet.\n\nFile-processing programs save their results here after a run."; $("line-count").textContent=""; }
  else loadFile();
}
async function loadFile() {
  const request=++sourceRequest;
  const name=$("file-select").value;
  $("source-code").textContent="Loading…";
  try {const data=await api(`/api/${fileMode}?id=${encodeURIComponent(selected.id)}&file=${encodeURIComponent(name)}`); if(request!==sourceRequest)return; $("source-code").textContent=data.content; $("line-count").textContent=`${data.content.split("\n").length} lines`; $("file-select").title=data.file;}
  catch(error){if(request===sourceRequest)$("source-code").textContent=error.message;}
}
$("source-tab").addEventListener("click",()=>{fileMode="source";renderFiles();});
$("outputs-tab").addEventListener("click",()=>{fileMode="output";renderFiles();refreshOutputs();});
$("file-select").addEventListener("change",loadFile);
(async()=>{try{await loadCatalog(true); await poll(); setInterval(poll,400);}catch(error){notify(`Cannot load the dashboard: ${error.message}`);}})();
