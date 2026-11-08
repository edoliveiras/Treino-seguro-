import { useMemo, useState } from "react";
import { Clock3, Target, RotateCcw } from "lucide-react";

type Focus = "Glúteos" | "Abdômen" | "Pernas" | "Braços" | "Costas" | "Peito" | "Corpo inteiro";
type Style = "Musculação" | "Full body" | "Calistenia" | "Funcional";\ntype Exercise = { name: string; focus: Focus[]; home: boolean; gym: boolean; beginner: boolean; styles: Style[]; sets: string; reps: string; rest: string; cue: string };
const library: Exercise[] = [
 {name:"Agachamento até a cadeira",focus:["Glúteos","Pernas","Corpo inteiro"],home:true,gym:true,beginner:true,sets:"3",reps:"10–12",rest:"90 s",cue:"Desça com controle, mantendo os pés apoiados e os joelhos alinhados."},
 {name:"Ponte de glúteos",focus:["Glúteos"],home:true,gym:true,beginner:true,sets:"3",reps:"12–15",rest:"60–90 s",cue:"Eleve o quadril sem hiperestender a lombar; pause brevemente no alto."},
 {name:"Elevação pélvica",focus:["Glúteos"],home:false,gym:true,beginner:false,sets:"3–4",reps:"8–12",rest:"120 s",cue:"Apoie a parte alta das costas, mantenha o tronco firme e controle a descida."},
 {name:"Abdução de quadril com faixa",focus:["Glúteos"],home:true,gym:true,beginner:true,sets:"3",reps:"12–20",rest:"60 s",cue:"Afaste os joelhos sem girar o tronco; retorne devagar."},
 {name:"Levantamento terra romeno com halteres",focus:["Glúteos","Pernas","Costas"],home:true,gym:true,beginner:false,sets:"3",reps:"8–12",rest:"120 s",cue:"Leve o quadril para trás, mantenha a coluna neutra e os pesos próximos às pernas."},
 {name:"Afundo apoiado",focus:["Glúteos","Pernas"],home:true,gym:true,beginner:false,sets:"3",reps:"8–10 por lado",rest:"90 s",cue:"Use apoio estável e amplitude confortável; mantenha o joelho alinhado."},
 {name:"Dead bug",focus:["Abdômen","Corpo inteiro"],home:true,gym:true,beginner:true,sets:"3",reps:"8–10 por lado",rest:"45–60 s",cue:"Mantenha a lombar confortável e mova braço e perna opostos sem perder o controle."},
 {name:"Prancha inclinada",focus:["Abdômen"],home:true,gym:true,beginner:true,sets:"3",reps:"20–35 s",rest:"60 s",cue:"Apoie as mãos em superfície firme, alinhe o corpo e respire continuamente."},
 {name:"Pallof press com faixa/cabo",focus:["Abdômen"],home:true,gym:true,beginner:false,sets:"3",reps:"10–12 por lado",rest:"60 s",cue:"Resista à rotação do tronco; mantenha quadril e ombros apontados à frente."},
 {name:"Crunch curto",focus:["Abdômen"],home:true,gym:true,beginner:true,sets:"2–3",reps:"10–15",rest:"45–60 s",cue:"Eleve pouco o tronco sem puxar a cabeça; pare se houver desconforto cervical ou lombar."},
 {name:"Remada sentada",focus:["Costas","Braços","Corpo inteiro"],home:false,gym:true,beginner:true,sets:"3",reps:"10–12",rest:"90 s",cue:"Puxe os cotovelos para trás sem encolher os ombros."},
 {name:"Remada unilateral com halter",focus:["Costas","Braços"],home:true,gym:true,beginner:false,sets:"3",reps:"10–12 por lado",rest:"90 s",cue:"Apoie uma mão, mantenha o tronco estável e evite girar o corpo."},
 {name:"Flexão na parede ou banco",focus:["Peito","Braços"],home:true,gym:true,beginner:true,sets:"3",reps:"8–12",rest:"60–90 s",cue:"Ajuste a inclinação para manter o movimento controlado e sem dor."},
 {name:"Supino com halteres ou máquina",focus:["Peito","Braços"],home:false,gym:true,beginner:false,sets:"3",reps:"8–12",rest:"90 s",cue:"Mantenha os punhos alinhados e não force amplitude no ombro."},
 {name:"Desenvolvimento sentado leve",focus:["Braços"],home:false,gym:true,beginner:false,sets:"2–3",reps:"8–12",rest:"90 s",cue:"Use carga confortável e não arqueie a lombar."},
 {name:"Rosca bíceps",focus:["Braços"],home:true,gym:true,beginner:true,sets:"2–3",reps:"10–15",rest:"60 s",cue:"Mantenha os cotovelos próximos ao corpo e evite balançar o tronco."},
 {name:"Tríceps na polia ou extensão com faixa",focus:["Braços"],home:true,gym:true,beginner:true,sets:"2–3",reps:"10–15",rest:"60 s",cue:"Mantenha os cotovelos estáveis e use amplitude confortável."},
 {name:"Agachamento goblet",focus:["Pernas","Glúteos"],home:true,gym:true,beginner:false,sets:"3",reps:"8–12",rest:"90–120 s",cue:"Segure o peso junto ao peito e mantenha o tronco firme."},
 {name:"Caminhada ou bicicleta leve",focus:["Corpo inteiro"],home:true,gym:true,beginner:true,sets:"1",reps:"8–12 min",rest:"—",cue:"Ritmo confortável para aquecer; ajuste ao condicionamento."}
];
const split: Record<number, Focus[][]> = {
 2:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços","Abdômen"]],
 3:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços"],["Glúteos","Pernas","Abdômen"]],
 4:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços"],["Glúteos","Pernas"],["Costas","Peito","Braços","Abdômen"]],
 5:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços"],["Glúteos","Pernas"],["Costas","Peito","Braços","Abdômen"],["Glúteos","Abdômen"]]
};
export default function WorkoutBuilder({ initialDays = "3", initialPlace = "Casa", initialLevel = "Iniciante" }: { initialDays?: string; initialPlace?: string; initialLevel?: string }) {
 const [focus,setFocus]=useState<Focus>("Glúteos");\n const [style,setStyle]=useState<Style>("Musculação");
 const [days,setDays]=useState(Math.min(5,Math.max(2,Number(initialDays)||3)));
 const [place,setPlace]=useState(initialPlace==="Academia"?"Academia":"Casa");
 const [level,setLevel]=useState(initialLevel);
 const [duration,setDuration]=useState("50");
 const [expanded,setExpanded]=useState<number|null>(0);
 const sessions=useMemo(()=>{
  const templates=style==="Full body"?Array.from({length:days},()=>["Glúteos","Pernas","Costas","Peito","Braços","Abdômen","Corpo inteiro"] as Focus[]):split[days];
  return templates.map((groups,index)=>{
   const candidates=library.filter(e=>(e.home&&place==="Casa"||e.gym&&place==="Academia")&&e.styles.includes(style)&&groups.some(g=>e.focus.includes(g))&&(level!=="Iniciante"||e.beginner||e.focus.includes("Glúteos")&&e.name==="Elevação pélvica"));
   const unique=candidates.filter((e,i,a)=>a.findIndex(x=>x.name===e.name)===i);
   const preferred=unique.filter(e=>e.focus.includes(focus));
   const selected=[...preferred,...unique.filter(e=>!preferred.includes(e))].slice(0,Number(duration)>=60?6:5);
   return {title:`Treino ${String.fromCharCode(65+index)}`,groups,items:selected};
  });
 },[days,place,level,duration,focus]);
 return <section className="panel workout-builder">
  <span className="eyebrow">MONTADOR DE TREINO · PLANO PERSONALIZÁVEL</span>
  <h2>Monte um treino com seu objetivo</h2>
  <p>Escolha o foco e veja uma divisão semanal com exercícios, séries, repetições, intervalos e instruções. O foco prioriza o grupo escolhido, sem abandonar o equilíbrio muscular.</p>
  <div className="form-grid">
   <label>Modalidade<select value={style} onChange={e=>setStyle(e.target.value as Style)}>{["Musculação","Full body","Calistenia","Funcional"].map(x=><option key={x}>{x}</option>)}</select></label>\n   <label>Meu foco principal<select value={focus} onChange={e=>setFocus(e.target.value as Focus)}>{["Glúteos","Abdômen","Pernas","Braços","Costas","Peito","Corpo inteiro"].map(x=><option key={x}>{x}</option>)}</select></label>
   <label>Onde vou treinar<select value={place} onChange={e=>setPlace(e.target.value)}><option>Casa</option><option>Academia</option></select></label>
   <label>Nível<select value={level} onChange={e=>setLevel(e.target.value)}>{["Iniciante","Intermediário","Avançado"].map(x=><option key={x}>{x}</option>)}</select></label>
   <label>Dias por semana<select value={days} onChange={e=>setDays(Number(e.target.value))}>{[2,3,4,5].map(x=><option key={x} value={x}>{x} dias</option>)}</select></label>
   <label>Duração desejada<select value={duration} onChange={e=>setDuration(e.target.value)}><option value="40">40 minutos</option><option value="50">50 minutos</option><option value="60">60 minutos</option></select></label>
  </div>
  <div className="bmi"><Target/><div><b>Foco selecionado: {focus}</b><p>O treino distribui o foco em mais de uma sessão, conforme os dias disponíveis. Exercícios abdominais fortalecem o core, mas não eliminam gordura localizada.</p></div></div>
  <h3>Seu planejamento semanal</h3>\n  <p className="muted">{style==="Full body"?"Full body: cada sessão trabalha os principais grupos musculares, com alternância de exercícios e recuperação entre dias.":style==="Calistenia"?"Calistenia: exercícios com o peso do corpo, com progressões e regressões conforme o nível.":style==="Funcional"?"Funcional: movimentos integrados para força, estabilidade e coordenação.":"Musculação: foco em força e hipertrofia com exercícios de resistência."}</p>
  <div className="workout-meta"><div><small>FREQUÊNCIA</small><b>{days} dias</b></div><div><small>SESSÃO</small><b>{duration} min</b></div><div><small>AMBIENTE</small><b>{place}</b></div></div>
  {sessions.map((session,index)=><article className="workout-day" key={session.title}>
   <button type="button" className="secondary workout-day-toggle" aria-expanded={expanded===index} onClick={()=>setExpanded(expanded===index?null:index)}><span><b>{session.title} · Dia {index+1}</b><small>{session.groups.join(" · ")}</small></span><span>{expanded===index?"−":"+"}</span></button>
   {expanded===index&&<div className="workout-day-content">
    <p><b>Aquecimento:</b> 5–8 minutos de caminhada, bicicleta leve ou mobilidade confortável.</p>
    {session.items.map((e,i)=><div className="planned-exercise" key={e.name}><div><b>{i+1}. {e.name}</b><p>{e.cue}</p><small>{e.sets} séries · {e.reps} repetições/tempo · descanso {e.rest}</small></div></div>)}
    <p><b>Finalização:</b> 3–5 minutos leves e respiração confortável. Registre as cargas e repetições realizadas.</p>
   </div>}
  </article>)}
  <div className="safety-alert"><b>Como progredir ao longo de 7 semanas</b><p><b>Semanas 1–2:</b> aprenda a técnica e termine as séries sentindo que conseguiria fazer mais 3 repetições.</p><p><b>Semanas 3–5:</b> quando completar o topo da faixa de repetições com boa técnica, aumente um pouco a carga ou a dificuldade; não aumente tudo ao mesmo tempo.</p><p><b>Semana 6:</b> consolide a execução sem treinar até a falha.</p><p><b>Semana 7:</b> reduza cerca de 20–30% das séries e reavalie conforto, técnica e recuperação. Depois, ajuste o próximo bloco.</p></div>
  <p className="muted"><Clock3 size={15}/> A duração é uma estimativa, não uma meta obrigatória. Descanse mais se precisar. Não é necessário treinar até a falha para progredir.</p>
  <p className="muted">Este é um modelo educativo geral. Se houver dor, limitação, condição clínica ou dúvida sobre a execução, suspenda o exercício e procure avaliação individual de profissional de Educação Física e/ou saúde. A seleção automática não substitui avaliação presencial.</p>
  <button type="button" className="secondary" onClick={()=>{setFocus("Glúteos");setStyle("Musculação");setDays(3);setPlace("Casa");setLevel("Iniciante");setDuration("50");setExpanded(0)}}><RotateCcw size={16}/> Restaurar opções iniciais</button>
 </section>;
}
