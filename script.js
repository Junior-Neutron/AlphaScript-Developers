"use strict";
(() => {
  const SUPABASE_URL = "https://qaivqscssdtsnthdiqtu.supabase.co";
  const SUPABASE_KEY = "sb_publishable_TjT6PMScm58zNVJiugk-zQ_6oIaJNU9";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  // The shared loader creates the client asynchronously. Do not create a
  // second client here or assume the CDN has loaded synchronously.
  let db = null;
  let user = null, currentProject = null;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem("as_"+key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem("as_"+key, JSON.stringify(value));
  let projects = read("projects", []);
  const nav = [["home","⌂","Home"],["tools","⌘","Tools"],["projects","▣","Projects"],["settings","⚙","Settings"]];
  function buildNav(){ for(const id of ["sidebar","bottomnav"]){ const el=$("#"+id); if(el) el.innerHTML=nav.map(([key,icon,label])=>`<button class="navbtn" data-go="${key}">${icon} ${label}</button>`).join("")+(id==="sidebar"?'<div class="sidefoot">BUILD WITH PURPOSE<br>LEARN WITHOUT LIMITS</div>':""); } }
  function go(name){ const target=$(`.screen[data-screen="${name}"]`); if(!target)return; $$(".screen").forEach(x=>x.classList.remove("active")); target.classList.add("active"); $$(".navbtn").forEach(x=>x.classList.toggle("active",x.dataset.go===name)); }
  function applyTheme(theme){ document.body.classList.toggle("light",theme==="light"); if($("#themeSelect"))$("#themeSelect").value=theme; localStorage.setItem("as_theme",theme); }
  function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function renderProjects(filter=""){const list=$("#projectList");if(!list)return;const shown=projects.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase()));list.innerHTML=shown.length?shown.map(p=>`<article class="item"><div class="itemmain"><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.language)} · Updated ${new Date(p.updated).toLocaleString()}</small></div><button class="btn" data-edit="${p.id}">Open</button><button class="btn" data-export="${p.id}">Export</button><button class="btn danger" data-delete="${p.id}">Delete</button></article>`).join(""):'<div class="empty">No projects yet. Create your first project.</div>';$("#projectCount").textContent=projects.length;}
  function openEditor(project=null){currentProject=project;$("#editorTitle").textContent=project?project.name:"New project";$("#codeInput").value=project?.code||"// Start building with AlphaScript\n";$("#editor").classList.add("open");}
  function saveProject(){const code=$("#codeInput").value;let name=prompt("Project name:",currentProject?.name||"Untitled project");if(!name)return;const language=(name.match(/\.(py|js|html|css|cpp|c|java|json)$/i)||[])[1]||"txt";if(currentProject){Object.assign(currentProject,{name,code,language,updated:new Date().toISOString()});}else{projects.unshift({id:crypto.randomUUID(),name,code,language,updated:new Date().toISOString()});}write("projects",projects);$("#editor").classList.remove("open");renderProjects($("#projectSearch")?.value||"");}
  function downloadProject(p){const blob=new Blob([p.code],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=p.name.includes(".")?p.name:p.name+".txt";a.click();URL.revokeObjectURL(url);}
  const tools=[["HTML Preview","Preview HTML in a new browser tab.","html"],["JSON Formatter","Format and validate JSON.","json"],["Base64 Encoder","Encode or decode Base64 text.","base64"],["URL Encoder","Encode or decode URL text.","url"],["Text Counter","Count words and characters.","count"],["Case Converter","Convert text case.","case"],["JavaScript Notes","Write and save JavaScript snippets.","js"],["Python Workspace","Create Python source files.","py"],["CSS Workspace","Create CSS source files.","css"],["SQL Formatter","Basic SQL formatting.","sql"],["Regex Tester","Test a regular expression.","regex"],["Color Converter","Inspect hexadecimal colours.","color"],["Indent Helper","Indent text consistently.","indent"],["Code Compare","Compare two text snippets.","compare"]];
  function renderTools(filter=""){const grid=$("#toolGrid");if(!grid)return;grid.innerHTML=tools.filter(t=>t[0].toLowerCase().includes(filter.toLowerCase())).map(t=>`<button class="card" data-tool="${t[2]}" style="text-align:left"><div class="glyph">⌘</div><h3>${t[0]}</h3><div class="muted">${t[1]}</div></button>`).join("");}
  function runTool(type){let input=prompt("Paste or type your input:");if(input===null)return;let result="";try{switch(type){case"json":result=JSON.stringify(JSON.parse(input),null,2);break;case"base64":result=input.startsWith("decode:")?atob(input.slice(7)):btoa(unescape(encodeURIComponent(input)));break;case"url":result=input.startsWith("decode:")?decodeURIComponent(input.slice(7)):encodeURIComponent(input);break;case"count":result=`Characters: ${input.length}\nWords: ${input.trim()?input.trim().split(/\s+/).length:0}\nLines: ${input?input.split(/\n/).length:0}`;break;case"case":result=`UPPERCASE:\n${input.toUpperCase()}\n\nlowercase:\n${input.toLowerCase()}\n\nTitle Case:\n${input.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}`;break;case"sql":result=input.replace(/\s+/g," ").replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|INSERT INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT JOIN|ON|AND|OR)\b/gi,"\n$1").trim();break;case"regex":{const pattern=prompt("Regular expression:");if(pattern===null)return;result=(input.match(new RegExp(pattern,"g"))||[]).join("\n")||"No matches";break;}case"color":{const h=input.trim();if(!/^#?[0-9a-f]{6}$/i.test(h))throw Error("Enter a six-digit hex colour.");const n=parseInt(h.replace("#",""),16);result=`RGB: ${n>>16}, ${(n>>8)&255}, ${n&255}`;break;}case"indent":result=input.split("\n").map(x=>x?"    "+x.trimStart():"").join("\n");break;case"compare":{const second=prompt("Enter the second text:")||"";result="FIRST:\n"+input+"\n\nSECOND:\n"+second+"\n\nEqual: "+(input===second);break;}case"html":{const w=window.open();if(!w){alert("Allow pop-ups to preview HTML.");return;}w.document.open();w.document.write(input);w.document.close();return;}default:openEditor({name:type==="py"?"script.py":type==="css"?"styles.css":type==="js"?"script.js":"snippet.txt",code:input,language:type});return;}}catch(e){result="Error: "+e.message;}alert(result);}
  async function init(){
    buildNav();
    applyTheme(localStorage.getItem("as_theme")||"dark");
    renderProjects();
    renderTools();
    try {
      // Wait until supabase-client.js has loaded the library and created
      // the configured client before using auth methods.
      db = await window.alphaSupabaseReady;
      const {data,error}=await db.auth.getSession();
      if(error) throw error;
      user=data.session?.user||null;
      updateAccount();
      db.auth.onAuthStateChange((_event,session)=>{
        user=session?.user||null;
        updateAccount();
      });
    } catch(e) {
      $("#accountState").textContent="Supabase connection unavailable";
      $("#userLabel").textContent="Connection error";
      console.error("AlphaScript Supabase initialization failed:",e);
    }
  }
  function updateAccount(){const logged=!!user;$("#accountState").textContent=logged?"Signed in":"Guest mode";$("#userLabel").textContent=logged?(user.email||"Developer"):"Guest";$("#accountLink").textContent=logged?"Sign out":"Log in";$("#accountLink").href=logged?"#signout":"login.html";$("#settingsAccount").textContent=logged?user.email:"You are using guest mode.";}
  document.addEventListener("click",async e=>{const goBtn=e.target.closest("[data-go]");if(goBtn)go(goBtn.dataset.go);const tool=e.target.closest("[data-tool]");if(tool)runTool(tool.dataset.tool);const edit=e.target.closest("[data-edit]");if(edit)openEditor(projects.find(p=>p.id===edit.dataset.edit));const exp=e.target.closest("[data-export]");if(exp){const p=projects.find(p=>p.id===exp.dataset.export);if(p)downloadProject(p);}const del=e.target.closest("[data-delete]");if(del&&confirm("Delete this project?")){projects=projects.filter(p=>p.id!==del.dataset.delete);write("projects",projects);renderProjects($("#projectSearch")?.value||"");}});
  $("#accountLink")?.addEventListener("click",async e=>{if(user){e.preventDefault();await db.auth.signOut();location.href="index.html";}});
  $("#themeBtn")?.addEventListener("click",()=>applyTheme(document.body.classList.contains("light")?"dark":"light"));
  $("#themeSelect")?.addEventListener("change",e=>applyTheme(e.target.value));
  $("#saveSettings")?.addEventListener("click",()=>alert("Settings saved."));
  $("#signOut")?.addEventListener("click",async()=>{if(user){const{error}=await db.auth.signOut();if(error)alert(error.message);else location.href="index.html";}});
  $("#newProject")?.addEventListener("click",()=>openEditor());$("#newProjectHero")?.addEventListener("click",()=>openEditor());$("#saveCode")?.addEventListener("click",saveProject);
  $("#closeEditor")?.addEventListener("click",()=>$("#editor").classList.remove("open"));
  $("#downloadCode")?.addEventListener("click",()=>{const p={name:currentProject?.name||"snippet.txt",code:$("#codeInput").value};downloadProject(p);});
  $("#projectSearch")?.addEventListener("input",e=>renderProjects(e.target.value));$("#toolSearch")?.addEventListener("input",e=>renderTools(e.target.value));
  init();
})();
