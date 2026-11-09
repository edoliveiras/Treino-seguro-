import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Dumbbell, Image as ImageIcon, PlayCircle } from "lucide-react";
import { supabase } from "./lib/supabase";
import { getExampleProgram, getWeekPrescription, type ProgramExercise, type ProgramDay } from "./trainingPrograms";

type SavedExercise = ProgramExercise & { id?: string; day_label: string; position: number };
type Assignment = { id: string; plan_id: string; seen_at: string | null; assigned_at: string };
type Completion = { id: string; exercise_id: string; session_date: string; completed_at: string };

const photo = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=720&q=75";
const youtube = (e: {name:string;technicalName:string}) => "https://www.youtube.com/results?search_query="+encodeURIComponent(e.name+" "+e.technicalName+" execução correta");
const photoSearch = (e: {name:string;technicalName:string}) => "https://www.google.com/search?tbm=isch&q="+encodeURIComponent(e.name+" "+e.technicalName+" exercício");

export default function StudentTraining({ userId, level, place, days }: { userId?:string; level:string; place:string; days:string }) {
  const [assignment,setAssignment]=useState<Assignment|null>(null);
  const [plan,setPlan]=useState<{title:string;level:string;description:string;split_type:string}|null>(null);
  const [savedDays,setSavedDays]=useState<ProgramDay[]>([]);
  const [savedExercises,setSavedExercises]=useState<SavedExercise[]>([]);
  const [completions,setCompletions]=useState<Completion[]>([]);
  const [demoDone,setDemoDone]=useState<string[]>([]);
  const [week,setWeek]=useState(1);
  const [loading,setLoading]=useState(Boolean(userId));
  const [newNotice,setNewNotice]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    let alive=true;
    if(!userId||!supabase){setLoading(false);return;}
    (async()=>{
      setLoading(true);setError("");
      const {data:a,error:ae}=await supabase.from("workout_assignments")
        .select("id,plan_id,seen_at,assigned_at").eq("student_id",userId).eq("status","active")
        .order("assigned_at",{ascending:false}).limit(1).maybeSingle();
      if(!alive)return;
      if(ae){setError("Não foi possível consultar seu treino atribuído. Mostramos o modelo educativo enquanto isso.");setLoading(false);return;}
      if(!a){setAssignment(null);setPlan(null);setSavedExercises([]);setSavedDays([]);setCompletions([]);setLoading(false);return;}
      const current=a as Assignment;
      const [{data:p,error:pe},{data:items,error:ie},{data:done,error:de}]=await Promise.all([
        supabase.from("workout_plans").select("title,level,description,split_type").eq("id",current.plan_id).maybeSingle(),
        supabase.from("workout_plan_exercises").select("*").eq("plan_id",current.plan_id).order("day_label").order("position"),
        supabase.from("workout_completions").select("id,exercise_id,session_date,completed_at").eq("assignment_id",current.id).order("completed_at",{ascending:false})
      ]);
      if(!alive)return;
      if(pe||ie||de){setError("Não foi possível carregar todas as informações do treino atribuído.");setLoading(false);return;}
      setAssignment(current);setPlan(p as typeof plan);setSavedExercises((items??[]) as SavedExercise[]);setCompletions((done??[]) as Completion[]);
      const dayLabels=[...new Set((items??[]).map((x:any)=>x.day_label as string))];
      setSavedDays(dayLabels.map(label=>({label,focus:"Treino definido pelo professor",exercises:[]})));
      setNewNotice(!current.seen_at);
      setLoading(false);
    })();
    return()=>{alive=false;};
  },[userId]);

  const demoProgram=useMemo(()=>getExampleProgram(level),[level]);
  const activePlan=Boolean(assignment&&plan);
  const daysToShow=activePlan?savedDays:demoProgram.days;
  const acknowledge=async()=>{
    if(assignment&&supabase){const {error:updateError}=await supabase.from("workout_assignments").update({seen_at:new Date().toISOString()}).eq("id",assignment.id);if(updateError){setError("Não foi possível confirmar a leitura do novo treino.");return;}}
    setNewNotice(false);
  };
  const toggleDone=async(exercise:SavedExercise|ProgramExercise,key:string)=>{
    if(assignment&&supabase&&"id" in exercise&&exercise.id){
      const existing=completions.find(x=>x.exercise_id===exercise.id);
      if(existing){
        const {error:deleteError}=await supabase.from("workout_completions").delete().eq("id",existing.id);
        if(deleteError){setError("Não foi possível desfazer a marcação.");return;}
        setCompletions(old=>old.filter(x=>x.id!==existing.id));
      }else{
        const {data,error:insertError}=await supabase.from("workout_completions").insert({assignment_id:assignment.id,exercise_id:exercise.id,student_id:userId}).select("id,exercise_id,session_date,completed_at").single();
        if(insertError){setError("Não foi possível salvar a conclusão do exercício.");return;}
        setCompletions(old=>[data as Completion,...old]);
      }
    }else setDemoDone(old=>old.includes(key)?old.filter(x=>x!==key):[...old,key]);
  };
  const savedExercisesForDay=(label:string)=>savedExercises.filter(e=>e.day_label===label).sort((a,b)=>a.position-b.position);
  const total=activePlan?savedExercises.length:demoProgram.days.reduce((n,d)=>n+d.exercises.length,0);
  const doneCount=activePlan?new Set(completions.map(c=>c.exercise_id)).size:demoDone.length;

  if(loading)return <section className="panel"><p>Carregando o treino da sua conta…</p></section>;
  return <section className="panel student-training">
    <span className="eyebrow">{activePlan?"TREINO ATRIBUÍDO PELO PROFESSOR":"TREINO DE EXEMPLO"}</span>
    {newNotice&&<div className="success-text" role="status"><b>Novo treino do seu professor!</b><p>Seu professor atribuiu um treino. Confira os exercícios e confirme a leitura.</p><button className="primary" type="button" onClick={()=>void acknowledge()}>Entendi, ver meu treino</button></div>}
    <h2>{activePlan?plan?.title:demoProgram.title}</h2>
    <p>{activePlan?plan?.description:demoProgram.description}</p>
    {error&&<p className="auth-error" role="alert">{error}</p>}
    <div className="workout-meta">
      <div><small>NÍVEL</small><b>{activePlan?plan?.level:demoProgram.level}</b></div>
      <div><small>FREQUÊNCIA</small><b>{activePlan?"Conforme combinado":demoProgram.frequency}</b></div>
      <div><small>LOCAL</small><b>{place}</b></div>
    </div>
    <div className="form-grid">
      <label>Semana do plano<select value={week} onChange={e=>setWeek(Number(e.target.value))}>{[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>Semana {n}</option>)}</select></label>
      <div className="bmi"><CheckCircle2/><div><b>{doneCount} de {total} exercícios marcados</b><small>As marcações do treino atribuído ficam salvas na sua conta.</small></div></div>
    </div>
    {!activePlan&&<p className="muted">Este é um modelo inicial baseado no nível informado na avaliação. Ele será substituído automaticamente quando o professor atribuir um plano individual.</p>}
    {(activePlan?daysToShow:demoProgram.days).map((day,index)=>{
      const items=activePlan?savedExercisesForDay(day.label):day.exercises;
      return <article className="workout-day" key={day.label}>
        <h3>{day.label}</h3><p className="muted">{day.focus}</p>
        {items.map((e,i)=>{
          const prescription=getWeekPrescription(week,e.sets,("reps" in e?e.reps:"8–12"),("rest_seconds" in e?e.rest_seconds:e.restSeconds));
          const key=("id" in e&&e.id)?e.id!:day.label+"-"+i;
          const done=activePlan?completions.some(c=>c.exercise_id===key):demoDone.includes(key);
          const name=e.name;
          const technicalName=("technical_name" in e?e.technical_name:e.technicalName);
          const gym=("gym_version" in e?e.gym_version:e.gym);
          const home=("home_version" in e?e.home_version:e.home);
          const knee=("knee_adaptation" in e?e.knee_adaptation:e.knee);
          const back=("back_adaptation" in e?e.back_adaptation:e.back);
          const rest=("rest_seconds" in e?e.rest_seconds:e.restSeconds);
          const video=("video_url" in e?e.video_url:"")||youtube({name,technicalName});
          const photoUrl=("photo_url" in e?e.photo_url:"")||photo;
          const reps=("reps" in e?e.reps:"8–12");
          const sets=("sets" in e?e.sets:2);
          const tempo=("tempo" in e?e.tempo:"Movimento controlado");
          return <article className="exercise student-exercise" key={key}>
            <img src={photoUrl} alt={"Foto ilustrativa do exercício "+name} loading="lazy"/>
            <div className="exercise-copy">
              <b>{name}</b><small className="technical-exercise-name">Nome técnico: {technicalName}</small>
              <p><b>{prescription.phase} · Semana {week}</b></p>
              <p>{prescription.sets||sets} séries · {prescription.reps||reps} repetições · descanso {prescription.restSeconds||rest} segundos</p>
              <p><b>Ritmo:</b> {prescription.tempo||tempo}</p>
              <p><b>Na academia:</b> {gym}</p><p><b>Em casa:</b> {home}</p>
              <p><b>Adaptação para joelho:</b> {knee}</p><p><b>Adaptação para lombar:</b> {back}</p>
              <p className="muted">{prescription.effort}</p>
              <div className="library-actions">
                <a href={video} target="_blank" rel="noreferrer"><PlayCircle size={16}/> Ver vídeo no YouTube</a>
                <a href={photoSearch(e)} target="_blank" rel="noreferrer"><ImageIcon size={16}/> Ver fotos deste movimento</a>
              </div>
            </div>
            <button type="button" className={done?"round done":"round"} aria-pressed={done} aria-label={(done?"Desmarcar ":"Marcar ")+name} onClick={()=>void toggleDone(e,key)}>{done?<CheckCircle2/>:"✓"}</button>
          </article>;
        })}
      </article>;
    })}
    <div className="safety-alert"><b><AlertTriangle size={16}/> Aviso importante</b><p>Este plano é educativo e não substitui avaliação de médico, fisioterapeuta ou profissional de Educação Física. Antes de começar, procure orientação profissional, principalmente se estiver acima do peso, for iniciante ou tiver dor, lesão ou condição de saúde. Não force movimentos dolorosos. Se houver dor no peito, tontura, falta de ar intensa ou dor forte/piorando, pare e procure atendimento.</p></div>
  </section>;
}
