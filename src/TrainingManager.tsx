import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Plus, RefreshCw, Save, Trash2, Users, UserCheck, Dumbbell } from "lucide-react";
import { supabase } from "./lib/supabase";
import { getWorkoutCatalog } from "./ExerciseLibrary";
import { EXAMPLE_PROGRAMS } from "./trainingPrograms";

type Student = { id:string; full_name:string; email:string; whatsapp_e164:string; account_status:string; training_level:string; training_place:string; training_days:number; current_workout:string|null };
type Plan = { id:string; title:string; level:string; split_type:string; description:string; duration_weeks:number; is_template:boolean; created_at:string };
type Assignment = { id:string; plan_id:string; student_id:string; assigned_at:string; status:string };
type EditorExercise = { key:string; day_label:string; position:number; exercise_name:string; technical_name:string; muscle_group:string; sets:number; reps:string; rest_seconds:number; tempo:string; gym_version:string; home_version:string; knee_adaptation:string; back_adaptation:string; observation:string; photo_url:string; video_url:string };
const blankExercise=(e?:any,day="Dia 1",position=1):EditorExercise=>({
 key:String(Date.now())+"-"+Math.random().toString(36).slice(2),day_label:day,position,
 exercise_name:e?.name??"",technical_name:e?.technicalName??"",muscle_group:e?.segment??"Corpo inteiro",
 sets:2,reps:"8–12",rest_seconds:90,tempo:"2 segundos para descer e 2 para subir",
 gym_version:"",home_version:"",knee_adaptation:"Reduza amplitude ou resistência se houver desconforto; não force dor.",
 back_adaptation:"Mantenha o tronco estável e coluna confortável; interrompa se houver dor.",
 observation:"Faça com controle e termine com 2 a 3 repetições possíveis.",photo_url:"",
 video_url:e? "https://www.youtube.com/results?search_query="+encodeURIComponent(e.name+" "+e.technicalName+" execução correta"):""
});

export default function TrainingManager({currentUserId}:{currentUserId:string}) {
 const [students,setStudents]=useState<Student[]>([]);
 const [plans,setPlans]=useState<Plan[]>([]);
 const [assignments,setAssignments]=useState<Assignment[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);
 const [planId,setPlanId]=useState("");
 const [title,setTitle]=useState("");
 const [level,setLevel]=useState("Iniciante");
 const [split,setSplit]=useState("Corpo inteiro");
 const [description,setDescription]=useState("");
 const [isTemplate,setIsTemplate]=useState(false);
 const [items,setItems]=useState<EditorExercise[]>([]);
 const [exampleId,setExampleId]=useState(EXAMPLE_PROGRAMS[0].id);
 const [query,setQuery]=useState("");
 const [muscle,setMuscle]=useState("Todos");
 const [place,setPlace]=useState("Todos");
 const [exerciseLevel,setExerciseLevel]=useState("Todos");
 const [selectedStudents,setSelectedStudents]=useState<string[]>([]);
 const catalog=useMemo(()=>getWorkoutCatalog(),[]);
 const muscles=useMemo(()=>["Todos",...Array.from(new Set(catalog.map(e=>e.segment))).sort()], [catalog]);
 const filteredCatalog=useMemo(()=>catalog.filter(e=>
   (muscle==="Todos"||e.segment===muscle) &&
   (place==="Todos"||e.place.includes(place)) &&
   (exerciseLevel==="Todos"||e.level===exerciseLevel) &&
   (!query.trim()||(e.name+" "+e.technicalName+" "+e.segment).toLowerCase().includes(query.toLowerCase()))
 ).slice(0,80),[catalog,muscle,place,exerciseLevel,query]);

 const load=useCallback(async()=>{
  if(!supabase){setError("Conexão com o serviço indisponível.");setLoading(false);return;}
  setLoading(true);setError("");
  const [s,p,a]=await Promise.all([
   supabase.from("admin_account_directory").select("id,full_name,email,whatsapp_e164,account_status,training_level,training_place,training_days,current_workout").order("created_at",{ascending:false}),
   supabase.from("workout_plans").select("id,title,level,split_type,description,duration_weeks,is_template,created_at").order("updated_at",{ascending:false}),
   supabase.from("workout_assignments").select("id,plan_id,student_id,assigned_at,status").eq("status","active").order("assigned_at",{ascending:false})
  ]);
  if(s.error||p.error||a.error){setError("Não foi possível carregar alunos, modelos e atribuições. Confira a configuração do painel administrativo.");setStudents([]);setPlans([]);setAssignments([]);}
  else{setStudents((s.data??[]) as Student[]);setPlans((p.data??[]) as Plan[]);setAssignments((a.data??[]) as Assignment[]);}
  setLoading(false);
 },[]);
 useEffect(()=>{void load();},[load]);

 const reset=()=>{setPlanId("");setTitle("");setLevel("Iniciante");setSplit("Corpo inteiro");setDescription("");setIsTemplate(false);setItems([]);setNotice("");};
 const openPlan=async(p:Plan)=>{
  if(!supabase)return;
  setBusy(true);setError("");setNotice("");
  const {data,error:e}=await supabase.from("workout_plan_exercises").select("*").eq("plan_id",p.id).order("day_label").order("position");
  if(e){setError("Não foi possível abrir os exercícios deste plano.");setBusy(false);return;}
  setPlanId(p.id);setTitle(p.title);setLevel(p.level);setSplit(p.split_type);setDescription(p.description);setIsTemplate(p.is_template);
  setItems((data??[]).map((x:any)=>({...x,key:x.id})));
  setBusy(false);
 };
 const copyExample=()=>{
  const p=EXAMPLE_PROGRAMS.find(x=>x.id===exampleId)??EXAMPLE_PROGRAMS[0];
  setPlanId("");setTitle(p.title+" — cópia");setLevel(p.level);setSplit(p.split);setDescription(p.description);setIsTemplate(false);
  setItems(p.days.flatMap(d=>d.exercises.map((e,i)=>({
   ...blankExercise({name:e.name,technicalName:e.technicalName,segment:e.muscle},d.label,i+1),
   sets:e.sets,reps:e.reps,rest_seconds:e.restSeconds,tempo:e.tempo,gym_version:e.gym,home_version:e.home,
   knee_adaptation:e.knee,back_adaptation:e.back,observation:e.observation
  }))));
  setNotice("Modelo copiado. Ajuste os exercícios e salve com um novo nome.");
 };
 const addCatalogExercise=(name:string)=>{
  const e=catalog.find(x=>x.technicalName===name);
  if(!e)return;
  const day=items[items.length-1]?.day_label??"Dia 1";
  setItems(old=>[...old,blankExercise(e,day,old.filter(x=>x.day_label===day).length+1)]);
 };
 const updateItem=(key:string,patch:Partial<EditorExercise>)=>setItems(old=>old.map(x=>x.key===key?{...x,...patch}:x));
 const savePlan=async()=>{
  if(!supabase||!title.trim()||items.length===0){setError("Informe o nome do treino e adicione pelo menos um exercício.");return;}
  setBusy(true);setError("");setNotice("");
  const values={title:title.trim(),level,split_type:split,description,duration_weeks:7,is_template:isTemplate,created_by:currentUserId};
  let id=planId;
  if(id){
   const {error:e}=await supabase.from("workout_plans").update({title:values.title,level,split_type:split,description,is_template:isTemplate}).eq("id",id);
   if(e){setError("Não foi possível atualizar o treino.");setBusy(false);return;}
   const {error:delError}=await supabase.from("workout_plan_exercises").delete().eq("plan_id",id);
   if(delError){setError("O treino foi atualizado, mas não foi possível substituir a lista de exercícios.");setBusy(false);return;}
  }else{
   const {data,error:e}=await supabase.from("workout_plans").insert(values).select("id").single();
   if(e||!data){setError("Não foi possível salvar o novo treino.");setBusy(false);return;}
   id=data.id;
  }
  const rows=items.map((x,i)=>({plan_id:id,day_label:x.day_label.trim()||"Dia 1",position:i+1,exercise_name:x.exercise_name,technical_name:x.technical_name,muscle_group:x.muscle_group,sets:x.sets,reps:x.reps,rest_seconds:x.rest_seconds,tempo:x.tempo,gym_version:x.gym_version,home_version:x.home_version,knee_adaptation:x.knee_adaptation,back_adaptation:x.back_adaptation,observation:x.observation,photo_url:x.photo_url,video_url:x.video_url}));
  const {error:insertError}=await supabase.from("workout_plan_exercises").insert(rows);
  if(insertError){setError("O treino foi salvo, mas houve erro ao gravar os exercícios.");setBusy(false);return;}
  setPlanId(id);setNotice("Treino salvo. Se já estiver atribuído, as alterações aparecerão para os alunos automaticamente.");
  await load();setBusy(false);
 };
 const toggleStudent=(id:string)=>setSelectedStudents(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 const assign=async()=>{
  if(!supabase||!planId||!selectedStudents.length){setError("Salve um treino e selecione pelo menos um aluno.");return;}
  setBusy(true);setError("");setNotice("");
  const rows=selectedStudents.map(student_id=>({plan_id:planId,student_id,assigned_by:currentUserId,status:"active"}));
  const {error:e}=await supabase.from("workout_assignments").insert(rows);
  if(e){setError("Não foi possível atribuir o treino aos alunos selecionados.");setBusy(false);return;}
  setNotice("Treino atribuído. Ele aparecerá na tela inicial dos alunos selecionados quando entrarem no aplicativo.");
  setSelectedStudents([]);await load();setBusy(false);
 };
 const removeAssignment=async(id:string)=>{
  if(!supabase||!window.confirm("Retirar este treino do aluno? O histórico de exercícios concluídos será preservado."))return;
  setBusy(true);const {error:e}=await supabase.rpc("admin_remove_workout_assignment",{p_assignment_id:id});
  if(e)setError("Não foi possível retirar a atribuição.");
  else{setNotice("Treino retirado do aluno. O modelo e o histórico foram preservados.");await load();}
  setBusy(false);
 };
 const deletePlan=async(p:Plan)=>{
  if(!supabase)return;
  if(assignments.some(a=>a.plan_id===p.id)){setError("Este treino ainda está atribuído. Retire as atribuições antes de excluir o modelo.");return;}
  if(!window.confirm("Excluir este modelo de treino e seus exercícios?"))return;
  const {error:e}=await supabase.from("workout_plans").delete().eq("id",p.id);
  if(e)setError("Não foi possível excluir o modelo.");
  else{setNotice("Modelo excluído.");if(planId===p.id)reset();await load();}
 };

 const activeStudents=students.filter(s=>s.account_status==="active");
 const planName=(id:string)=>plans.find(p=>p.id===id)?.title??"Treino";
 return <section className="panel training-manager">
  <div className="admin-panel-heading"><div><span className="eyebrow">TREINOS DO PROFESSOR</span><h2>Montar, salvar e atribuir treinos</h2></div><button className="secondary" type="button" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/> Atualizar</button></div>
  <p>Os planos ficam separados dos registros clínicos. O aluno só consegue consultar os treinos que foram atribuídos à própria conta.</p>
  {error&&<p role="alert" className="auth-error">{error}</p>}{notice&&<p role="status" className="success-text">{notice}</p>}
  <div className="panel">
   <h3>Alunos cadastrados</h3>
   {loading?<p>Carregando…</p>:activeStudents.length===0?<p>Nenhum aluno ativo cadastrado.</p>:<div className="admin-account-list">{activeStudents.map(s=><article className="admin-account-card" key={s.id}>
    <div className="admin-account-main"><Users size={20}/><div><b>{s.full_name}</b><span>{s.email}</span><small>WhatsApp para contato: {s.whatsapp_e164}</small></div></div>
    <div className="admin-account-meta"><b>{s.training_level||"Iniciante"}</b><small>{s.training_place||"Casa"} · {s.training_days||3} dias/semana</small><small>Treino atual: {s.current_workout||"Modelo de exemplo"}</small></div>
    <label className="student-select"><input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={()=>toggleStudent(s.id)}/> Selecionar aluno</label>
   </article>)}</div>}
   <p className="muted">O WhatsApp é apenas um contato cadastral. O aplicativo não envia mensagens nem usa telefone para autenticação.</p>
  </div>
  <div className="panel">
   <h3>Modelos prontos</h3>
   <p>Copie um modelo, personalize e salve. Os três níveis já vêm com divisão e exercícios diferentes.</p>
   <div className="form-grid"><label>Modelo<select value={exampleId} onChange={e=>setExampleId(e.target.value)}>{EXAMPLE_PROGRAMS.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><button type="button" className="secondary" onClick={copyExample}><Copy size={16}/> Copiar modelo para edição</button></div>
   <div className="workout-meta">{EXAMPLE_PROGRAMS.map(p=><div key={p.id}><small>{p.level.toUpperCase()}</small><b>{p.frequency}</b></div>)}</div>
  </div>
  <div className="panel">
   <div className="admin-panel-heading"><div><h3>Editor de treino</h3><p className="muted">Escolha exercícios, ajuste as séries, repetições, pausas e observações.</p></div><button type="button" className="secondary" onClick={reset}><Plus size={16}/> Novo treino</button></div>
   <div className="form-grid">
    <label>Nome do treino<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Treino da Maria — Semana 1"/></label>
    <label>Nível<select value={level} onChange={e=>setLevel(e.target.value)}>{["Iniciante","Intermediário","Avançado"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Divisão<select value={split} onChange={e=>setSplit(e.target.value)}>{["Corpo inteiro","Superior e inferior","Empurrar, puxar e pernas","Personalizado"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Observação geral<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Orientações para o aluno"/></label>
   </div>
   <label className="checkline"><input type="checkbox" checked={isTemplate} onChange={e=>setIsTemplate(e.target.checked)}/> Guardar também como modelo para copiar depois.</label>
   <h4>Buscar exercício</h4>
   <div className="form-grid">
    <label><span>Nome simples ou técnico</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ex.: agachar, stiff, puxada…"/></label>
    <label>Músculo<select value={muscle} onChange={e=>setMuscle(e.target.value)}>{muscles.map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Local<select value={place} onChange={e=>setPlace(e.target.value)}>{["Todos","Casa","Academia"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Nível<select value={exerciseLevel} onChange={e=>setExerciseLevel(e.target.value)}>{["Todos","Iniciante","Intermediário","Avançado"].map(x=><option key={x}>{x}</option>)}</select></label>
   </div>
   <div className="exercise-picker">{filteredCatalog.map((e,i)=><button type="button" className="secondary" key={e.technicalName+"-"+e.segment+"-"+i} onClick={()=>addCatalogExercise(e.technicalName)}><Plus size={14}/>{e.name}<small> · {e.segment} · {e.place}</small></button>)}</div>
   <h4>Exercícios do plano ({items.length})</h4>
   {items.length===0?<p className="muted">Copie um modelo ou adicione exercícios pela busca acima.</p>:items.map((x,index)=><article className="planned-exercise editor-exercise" key={x.key}>
    <div className="admin-panel-heading"><b>{index+1}. {x.exercise_name}</b><button type="button" className="danger-button" onClick={()=>setItems(old=>old.filter(v=>v.key!==x.key))}><Trash2 size={15}/> Remover</button></div>
    <small className="technical-exercise-name">Nome técnico: {x.technical_name} · {x.muscle_group}</small>
    <div className="form-grid">
     <label>Dia<input value={x.day_label} onChange={e=>updateItem(x.key,{day_label:e.target.value})}/></label>
     <label>Séries<input type="number" min="1" max="8" value={x.sets} onChange={e=>updateItem(x.key,{sets:Math.max(1,Math.min(8,Number(e.target.value)||1))})}/></label>
     <label>Repetições ou tempo<input value={x.reps} onChange={e=>updateItem(x.key,{reps:e.target.value})}/></label>
     <label>Descanso (segundos)<input type="number" min="15" max="600" value={x.rest_seconds} onChange={e=>updateItem(x.key,{rest_seconds:Math.max(15,Math.min(600,Number(e.target.value)||15))})}/></label>
     <label>Tempo de execução<input value={x.tempo} onChange={e=>updateItem(x.key,{tempo:e.target.value})}/></label>
     <label>Versão academia<input value={x.gym_version} onChange={e=>updateItem(x.key,{gym_version:e.target.value})}/></label>
     <label>Versão casa<input value={x.home_version} onChange={e=>updateItem(x.key,{home_version:e.target.value})}/></label>
     <label>Adaptação joelho<input value={x.knee_adaptation} onChange={e=>updateItem(x.key,{knee_adaptation:e.target.value})}/></label>
     <label>Adaptação lombar<input value={x.back_adaptation} onChange={e=>updateItem(x.key,{back_adaptation:e.target.value})}/></label>
     <label>Observações<input value={x.observation} onChange={e=>updateItem(x.key,{observation:e.target.value})}/></label>
     <label>Link da foto (opcional)<input value={x.photo_url} onChange={e=>updateItem(x.key,{photo_url:e.target.value})} placeholder="https://…"/></label>
     <label>Link do vídeo (YouTube)<input value={x.video_url} onChange={e=>updateItem(x.key,{video_url:e.target.value})} placeholder="https://youtube.com/…"/></label>
    </div>
   </article>)}
   <div className="form-grid"><button type="button" className="primary" onClick={()=>void savePlan()} disabled={busy||!title.trim()||items.length===0}><Save size={16}/> {busy?"Salvando…":"Salvar treino"}</button><button type="button" className="secondary" onClick={()=>void assign()} disabled={busy||!planId||selectedStudents.length===0}><UserCheck size={16}/> Atribuir aos {selectedStudents.length} selecionados</button></div>
  </div>
  <div className="panel">
   <h3>Treinos salvos e atribuições atuais</h3>
   <div className="admin-account-list">{plans.map(p=><article className="admin-account-card" key={p.id}><div className="admin-account-main"><Dumbbell size={20}/><div><b>{p.title}</b><span>{p.level} · {p.split_type}</span><small>{p.is_template?"Modelo reutilizável":"Plano de aluno"} · {p.duration_weeks} semanas</small></div></div><div className="admin-account-actions"><button className="secondary" type="button" onClick={()=>void openPlan(p)}>Editar</button><button className="danger-button" type="button" onClick={()=>void deletePlan(p)}><Trash2 size={15}/> Excluir</button></div></article>)}</div>
   <h4>Treinos atribuídos</h4>
   {assignments.length===0?<p>Nenhum treino atribuído ainda.</p>:assignments.map(a=>{const student=students.find(s=>s.id===a.student_id);return <article className="admin-account-card" key={a.id}><div className="admin-account-main"><UserCheck size={18}/><div><b>{student?.full_name??"Aluno"}</b><span>{planName(a.plan_id)}</span><small>{student?.email??""}</small></div></div><button type="button" className="danger-button" disabled={busy} onClick={()=>void removeAssignment(a.id)}><Trash2 size={15}/> Retirar treino</button></article>;})}
  </div>
 </section>;
}
