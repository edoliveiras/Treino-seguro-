import { useMemo, useState } from "react";
import { Search, PlayCircle, ShieldCheck, Dumbbell, Image as ImageIcon } from "lucide-react";

type Entry = { segment:string; activity:string; name:string };
const groups: [string,string,string][] = [
["Peito","Musculação","supino reto com barra; supino reto com halteres; supino inclinado com halteres; supino inclinado com barra; supino inclinado na máquina; supino declinado; supino na máquina; crucifixo com halteres; crucifixo inclinado; crucifixo na máquina; crossover polia alta; crossover polia baixa; peck deck; pullover com halter; svend press"],
["Peito","Calistenia","flexão tradicional; flexão com joelhos apoiados; flexão inclinada (mãos no sofá); flexão declinada; flexão com pés elevados; flexão diamante; flexão aberta; flexão arqueiro; flexão hindu; flexão com elástico; flexão com toque no ombro; flexão com palmas; flexão em argolas ou TRX; flexão em um braço (progressão); mergulho em paralelas"],
["Peito","Isometria","flexão parada na posição baixa; prancha alta"],
["Costas","Musculação","puxada frontal; puxada com triângulo; puxada supinada; pull-down com corda; pull-down com braços estendidos; remada baixa; remada curvada com barra; remada Pendlay; remada unilateral com halter; remada serrote; remada unilateral na polia; remada na máquina articulada; remada cavalinho (barra T); levantamento terra convencional; rack pull; barra fixa assistida"],
["Costas","Calistenia","barra fixa pronada; barra fixa supinada; barra fixa neutra; barra fixa aberta; barra fixa fechada; chin-up; remada invertida na barra baixa; remada australiana; remada australiana com pés elevados; remada em argolas ou TRX; remada com toalha na porta; remada com mochila; superman; band pull-apart com elástico; archer pull-up; typewriter pull-up; muscle-up; front lever em progressões"],
["Costas","Isometria","suspensão na barra; superman parado; hollow hold"],
["Ombros","Musculação","desenvolvimento com halteres; desenvolvimento Arnold; desenvolvimento militar com barra; desenvolvimento na máquina; desenvolvimento com kettlebell; elevação lateral; elevação lateral na polia; elevação lateral sentado; elevação frontal; crucifixo invertido; crucifixo invertido na máquina; face pull; remada alta; elevação em Y, T e W; rotação externa com elástico; rotação interna com elástico"],
["Ombros","Calistenia","flexão pike; flexão pike elevada; flexão em Y; parada de mão na parede; handstand push-up na parede; círculos de braço; caminhada de mãos"],
["Ombros","Isometria","parada de mão na parede; prancha com toque no ombro"],
["Bíceps","Musculação","rosca direta com barra; rosca com barra W; rosca alternada; rosca martelo; rosca martelo na corda; rosca concentrada; rosca Scott; rosca inclinada; rosca spider; rosca Zottman; rosca na polia; rosca na polia baixa; rosca 21; rosca com kettlebell"],
["Bíceps","Calistenia","barra fixa supinada; chin-up com pegada fechada; rosca invertida na barra baixa; rosca em argolas ou TRX; rosca com elástico"],
["Bíceps","Isometria","rosca isométrica a 90 graus"],
["Tríceps","Musculação","tríceps pulley; tríceps corda; tríceps barra reta na polia; tríceps unilateral na polia; tríceps testa; tríceps francês; extensão overhead com halter; coice com halter; coice na polia; tríceps na máquina; supino fechado; JM press; tríceps com elástico"],
["Tríceps","Calistenia","mergulho no banco; mergulho entre bancos; mergulho em paralelas; flexão fechada; flexão diamante; flexão com toalha; extensão de tríceps em argolas ou TRX; extensão de tríceps no chão"],
["Tríceps","Isometria","flexão fechada parada"],
["Antebraço","Musculação","rosca punho; rosca punho inversa; rosca inversa; caminhada do fazendeiro"],
["Antebraço","Calistenia","suspensão na barra; flexão sobre os dedos (progressão)"],
["Antebraço","Isometria","pegada isométrica na barra"],
["Trapézio","Musculação","encolhimento com halteres; encolhimento com barra; remada alta"],
["Trapézio","Calistenia","encolhimento escapular na barra; flexão escapular"],
["Quadríceps","Musculação","agachamento livre; agachamento no Smith; agachamento frontal; agachamento goblet com halter ou kettlebell; agachamento com pausa; agachamento Zercher; agachamento sissy; leg press 45; leg press horizontal; leg press unilateral; cadeira extensora; hack squat; agachamento búlgaro; afundo; afundo com halteres; afundo caminhando; afundo lateral; passada"],
["Quadríceps","Calistenia","agachamento livre; agachamento sumô; sentar e levantar da cadeira; afundo; avanço andando; agachamento búlgaro; agachamento com salto; agachamento cossaco; agachamento com elástico; pistol squat assistido; pistol squat; shrimp squat; step-up no degrau; step-up lateral; box jump"],
["Quadríceps","Isometria","agachamento isométrico na parede; agachamento parado em 90 graus; agachamento isométrico unilateral na parede"],
["Posterior de coxa","Musculação","mesa flexora; cadeira flexora; flexora em pé; flexora unilateral; stiff; stiff unilateral com halter; levantamento terra romeno; levantamento terra sumô; good morning; hiperextensão; glute-ham raise"],
["Posterior de coxa","Calistenia","stiff unilateral com peso do corpo; flexão de perna com toalha no chão; slider curl; nordic curl (progressão); ponte com um pé; ponte com elevação de calcanhar"],
["Posterior de coxa","Isometria","ponte isométrica; ponte unilateral parada"],
["Glúteos","Musculação","elevação pélvica com barra; hip thrust unilateral; hip thrust na máquina; abdução na máquina; coice na polia; glute kickback na máquina; abdução com elástico em pé; passada; step-up alto; agachamento sumô com kettlebell"],
["Glúteos","Calistenia","ponte de glúteo; elevação pélvica no chão; coice no quatro apoios; donkey kick; hidrante (fire hydrant); frog pump; abdução deitado; clamshell; ponte unilateral; afundo reverso; monster walk com mini band; passada lateral com mini band"],
["Glúteos","Isometria","ponte parada; prancha lateral com elevação de perna"],
["Panturrilha e tibial","Musculação","panturrilha em pé na máquina; panturrilha sentado; panturrilha no leg press; panturrilha no Smith; donkey calf; panturrilha unilateral com halter"],
["Panturrilha e tibial","Calistenia","elevação de calcanhar no degrau; panturrilha unilateral; saltos de panturrilha; pular corda; elevação de ponta de pé para o tibial anterior; caminhada no calcanhar"],
["Panturrilha e tibial","Isometria","ponta de pé parada"],
["Adutores e abdutores","Musculação","cadeira adutora; cadeira abdutora"],
["Adutores e abdutores","Calistenia","adução deitado de lado; adução com elástico; elevação lateral de perna; agachamento lateral (cossaco)"],
["Abdômen","Musculação","abdominal na polia; abdominal com corda na polia; abdominal na máquina; abdominal declinado; abdominal infra no banco; elevação de joelhos na barra; elevação de joelhos na paralela; roda abdominal; woodchopper na polia; pallof press (anti-rotação); side bend com halter"],
["Abdômen","Calistenia","abdominal crunch; sit-up; abdominal infra; bicicleta no ar; elevação de pernas deitado; tesoura; flutter kick; toe touch; oblíquo crunch; russian twist; mountain climber; dead bug; V-up; canivete; elevação de pernas na barra; L-sit (progressão); dragon flag; prancha com elevação de perna; prancha com deslocamento; plank to push-up; rollout de joelhos; hollow rock; bear crawl; windshield wipers"],
["Abdômen","Isometria","prancha; prancha lateral; hollow hold; prancha com toque no ombro"],
["Lombar e core profundo","Musculação","extensão lombar no banco 45 graus; hiperextensão romana; reverse hyperextension; good morning leve"],
["Lombar e core profundo","Calistenia","superman; bird dog; ponte; extensão lombar no chão; McGill curl-up; gato-camelo (cat-camel)"],
["Lombar e core profundo","Isometria","prancha; prancha lateral (série McGill); ponte isométrica"],
["Funcional, kettlebell e TRX","Funcional","kettlebell swing; goblet squat; Turkish get-up; kettlebell clean; kettlebell snatch; caminhada do fazendeiro; TRX remada; TRX agachamento; TRX peito; battle rope; slam ball; medicine ball throw; sled push; corda naval"],
["Calistenia avançada","Calistenia","corvo (crow pose); parada de mão assistida; parada de mão livre; L-sit; tuck planche; front lever tuck; human flag; pistol squat; shrimp squat; archer pull-up; typewriter pull-up; burpee; inchworm; crab walk; bear crawl"],
["Cardio e condicionamento","Cardio","esteira (caminhada); esteira (trote); esteira (corrida); bicicleta ergométrica; elíptico; remo ergométrico; escada; caminhada leve; caminhada rápida; caminhada com inclinação; intervalado caminhada e trote; trote contínuo; fartlek; tiros curtos; subidas; corrida em ladeira; corrida intervalada; corrida longa; polichinelo; pular corda em intervalos; joelho alto parado; burpee; agachamento com salto; mountain climber; subir escada ou degrau; bike leve; bike intervalada; natação; hidroginástica; dança"],
["Propriocepção e equilíbrio","Propriocepção","equilíbrio em um pé; equilíbrio em um pé de olhos fechados; caminhada no calcanhar; caminhada na ponta dos pés; caminhada calcanhar-ponta em linha reta; caminhada em linha com olhos fechados; agachamento unilateral com apoio; apoio unipodal sobre almofada; BOSU ou disco de equilíbrio; agachamento no BOSU; prancha na bola suíça; tandem stance; hop and stick (salto e estabilização); star excursion; equilíbrio sobre bola; stiff unilateral com equilíbrio; avanço com rotação de tronco"],
["Alongamento e mobilidade","Alongamento","alongamento de isquiotibiais; alongamento de quadríceps; alongamento de panturrilha; alongamento de glúteo (figura 4); alongamento de adutores (borboleta); alongamento de flexor do quadril (avanço baixo); alongamento de iliopsoas; alongamento de piriforme; alongamento de quadrado lombar; alongamento de peitoral na porta; alongamento de ombro cruzando o braço; alongamento de cápsula posterior do ombro; alongamento de tríceps; alongamento lombar (joelhos ao peito); gato-vaca; postura da criança; cobra; esfinge; pigeon (pombo); 90/90 de quadril; world's greatest stretch; thread the needle; band dislocates; rotação de coluna deitado; mobilidade de quadril; mobilidade de ombro; mobilidade de tornozelo; mobilidade de coluna torácica; foam roller (liberação miofascial)"],
["Treino só com elástico","Treinos especiais","remada com elástico; supino com elástico; desenvolvimento com elástico; rosca com elástico; tríceps com elástico; agachamento com elástico; abdução com elástico; monster walk; band pull-apart; rotação externa de ombro com elástico"],
["Idosos e iniciantes","Treinos especiais","sentar e levantar da cadeira; flexão na parede; remada com elástico; elevação de calcanhar; equilíbrio em um pé com apoio; caminhada; ponte; alongamentos suaves"],
["Reabilitação de joelho (baixo impacto)","Treinos especiais","ponte; elevação de perna reta; agachamento parcial na parede; step-up baixo; bicicleta ergométrica leve; abdução com elástico; panturrilha; hidroginástica"],
["Reabilitação de lombar (baixo impacto)","Treinos especiais","bird dog; dead bug; ponte; prancha lateral; McGill curl-up; gato-camelo; caminhada; alongamentos de isquiotibiais e piriforme"],
["Gestantes (com liberação médica)","Treinos especiais","caminhada; agachamento com apoio; ponte; remada com elástico; alongamentos suaves; respiração"]
];

const all: Entry[] = groups.flatMap(([segment,activity,names])=>names.split(";").map(name=>({segment,activity,name:name.trim()})));
const advanced = /avançado|muscle-up|front lever|handstand push|parada de mão livre|human flag|dragon flag|planche|pistol squat$|shrimp squat$|box jump|salto|snatch|tiros|sprint|windshield|typewriter|archer pull|flexão com palmas|nordic curl/i;
const lowImpact = /alongamento|mobilidade|bird dog|dead bug|ponte|caminhada|bicicleta|elíptico|natação|hidro|respiração|pallof|isométric|prancha|remo ergométrico|flexora|abdução|adução/i;
const kneeRisk = /salto|burpee|corrida|tiros|ladeira|polichinelo|pular corda|afundo|passada|agachamento|step-up|leg press|extensora|sissy|pistol|shrimp|cossaco|box jump|sled push|escada/i;
const backRisk = /terra|stiff|good morning|remada curvada|pendlay|rack pull|swing|snatch|russian twist|sit-up|abdominal declinado|rollout|dragon flag|hiperextensão|side bend/i;
function metadata(e:Entry){
 const name=e.name.toLowerCase(), seg=e.segment.toLowerCase();
 const level=advanced.test(name)?"Avançado":/idosos|iniciantes|alongamento|mobilidade|caminhada|ponte|flexão na parede|sentar e levantar|respiração|equilíbrio em um pé com apoio/i.test(name)?"Iniciante":"Intermediário";
 const gym=/máquina|polia|supino|leg press|cadeira |esteira|ergométrica|hack|smith|barra|peck deck|cross|cabo|sled|battle rope/i.test(name)||["Musculação"].includes(e.activity);
 const home=!gym||["Calistenia","Isometria","Alongamento","Propriocepção","Treinos especiais"].includes(e.activity);
 const alert=lowImpact.test(name)?"Baixo impacto":kneeRisk.test(name)?"Atenção joelho":backRisk.test(name)?"Atenção lombar":"Baixo impacto";
 const regress=/assistid|joelhos apoiados|inclinado|adaptad|leve|com apoio|progressão/i.test(name)?name:"versão assistida, com menor amplitude ou resistência";
 const progress=/Avançado/.test(level)?"maior controle, amplitude ou carga apenas com técnica consolidada":"aumentar gradualmente resistência, amplitude ou tempo";
 return {level,place:gym&&home?"Academia ou casa":gym?"Academia":"Casa",alert,regression:regress,progression:progress};
}
const imageUrl="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=720&q=75";
export default function ExerciseLibrary({ pains=[] }: { pains?: string[] }){
 const [query,setQuery]=useState(""),[segment,setSegment]=useState("Todos"),[activity,setActivity]=useState("Todos"),[risk,setRisk]=useState("Todos");
 const segments=useMemo(()=>["Todos",...Array.from(new Set(all.map(x=>x.segment)))],[ ]);
 const activities=["Todos","Musculação","Calistenia","Isometria","Funcional","Cardio","Propriocepção","Alongamento","Treinos especiais"];
 const hiddenByPain=(e:Entry)=>{const a=metadata(e).alert;return (pains.includes("Joelho")&&a==="Atenção joelho")||(pains.includes("Lombar")&&a==="Atenção lombar");};
 const filtered=useMemo(()=>all.filter(e=>!hiddenByPain(e)&&(segment==="Todos"||e.segment===segment)&&(activity==="Todos"||e.activity===activity)&&(risk==="Todos"||metadata(e).alert===risk)&&(!query||[e.name,e.segment,e.activity].join(" ").toLowerCase().includes(query.toLowerCase()))),[query,segment,activity,risk,pains]);
 const count=filtered.length;
 return <section className="panel exercise-library">
  <span className="eyebrow">BIBLIOTECA COMPLETA · {all.length} EXERCÍCIOS E VARIAÇÕES</span><h2>Exercícios por segmento muscular</h2>
  <p>Consulte cada movimento, veja uma imagem ilustrativa e abra uma busca de demonstrações em vídeo. Os níveis e alertas são classificações educativas iniciais, não liberação clínica individual. Exercícios sinalizados para joelho ou lombar são ocultados quando a respectiva queixa foi informada na avaliação.</p>
  <div className="library-filters">
   <label className="library-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar exercício ou músculo"/></label>
   <label>Segmento<select value={segment} onChange={e=>setSegment(e.target.value)}>{segments.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Tipo de atividade<select value={activity} onChange={e=>setActivity(e.target.value)}>{activities.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Alerta<select value={risk} onChange={e=>setRisk(e.target.value)}>{["Todos","Baixo impacto","Atenção joelho","Atenção lombar"].map(s=><option key={s}>{s}</option>)}</select></label>
  </div>
  <p className="library-count">Exibindo {count} de {all.length} exercícios{pains.length>0?" · itens com alerta compatível com suas queixas foram ocultados":""}</p>
  {filtered.map((e,i)=>{const m=metadata(e);return <article className="library-card" key={e.segment+e.activity+e.name+i}>
   <img src={imageUrl} alt={"Foto ilustrativa de exercício físico: "+e.name} loading="lazy"/>
   <div className="library-card-body"><div className="library-tags"><span>{e.segment}</span><span>{e.activity}</span></div><h3>{e.name}</h3>
    <div className="library-meta"><span>Nível: <b>{m.level}</b></span><span>Local: <b>{m.place}</b></span><span className={m.alert==="Baixo impacto"?"risk-low":"risk-warn"}>{m.alert}</span></div>
    <p><b>Regressão:</b> {m.regression}. <b>Progressão:</b> {m.progression}.</p>
    <div className="library-actions"><a href={"https://www.youtube.com/results?search_query="+encodeURIComponent(e.name+" execução correta exercício") } target="_blank" rel="noreferrer"><PlayCircle size={16}/> Vídeo demonstrativo no YouTube</a><a href={"https://www.google.com/search?tbm=isch&q="+encodeURIComponent(e.name+" exercício execução")} target="_blank" rel="noreferrer"><ImageIcon size={16}/> Ver fotos do exercício</a></div>
    <small className="library-warning"><ShieldCheck size={14}/> Procure um profissional de Educação Física ou médico antes de iniciar. Interrompa se sentir dor ou sintomas incomuns.</small>
   </div></article>})}
  {count===0&&<p>Nenhum exercício encontrado. Tente outro termo ou filtro.</p>}
  <div className="safety-alert"><b>Filtro de segurança por queixas informadas</b><p>Exercícios com alertas de joelho ou lombar são identificados para revisão. Em caso de dor ou diagnóstico, não use a biblioteca como autorização: é necessária avaliação individual. Gestantes devem ter liberação médica e acompanhamento profissional.</p></div>
 </section>;
}
