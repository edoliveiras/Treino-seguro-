import { useMemo, useState } from "react";
import { Clock3, Target, RotateCcw } from "lucide-react";

type Focus = "Glúteos" | "Abdômen" | "Pernas" | "Braços" | "Costas" | "Peito" | "Corpo inteiro";
type Style = "Musculação" | "Full body" | "Calistenia" | "Funcional" | "HIIT" | "Corrida";
type Exercise = { name: string; focus: Focus[]; home: boolean; gym: boolean; beginner: boolean; styles: Style[]; sets: string; reps: string; rest: string; cue: string };
const library: Exercise[] = [

 {name:"Supino reto com barra",focus:["Peito","Braços"],home:false,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"4",reps:"6–8",rest:"120–150 s",cue:"Mantenha escápulas apoiadas, pés firmes e desça a barra com controle até amplitude confortável."},
 {name:"Mergulho nas barras paralelas (dips)",focus:["Peito","Braços"],home:false,gym:true,beginner:false,styles:["Calistenia","Full body"],sets:"3–4",reps:"6–10",rest:"120 s",cue:"Desça somente até manter controle dos ombros; evite balanço e dor."},
 {name:"Barra fixa pronada",focus:["Costas","Braços"],home:false,gym:true,beginner:false,styles:["Calistenia","Full body"],sets:"4",reps:"5–10",rest:"120 s",cue:"Inicie com escápulas ativas, suba sem impulso e controle a descida."},
 {name:"Remada curvada com barra",focus:["Costas","Braços"],home:false,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"4",reps:"6–10",rest:"120 s",cue:"Incline o tronco com coluna neutra, estabilize o abdômen e puxe a barra em direção ao abdômen."},
 {name:"Agachamento livre com barra",focus:["Pernas","Glúteos"],home:false,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"4",reps:"6–8",rest:"150 s",cue:"Apoie a barra com segurança, mantenha o tronco firme e use amplitude que preserve controle e alinhamento."},
 {name:"Levantamento terra com barra",focus:["Pernas","Glúteos","Costas"],home:false,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3–4",reps:"5–8",rest:"150 s",cue:"Mantenha a barra próxima ao corpo, coluna neutra e empurre o chão; priorize técnica antes da carga."},
 {name:"Flexão declinada",focus:["Peito","Braços"],home:true,gym:true,beginner:false,styles:["Calistenia","Full body"],sets:"4",reps:"8–12",rest:"90 s",cue:"Eleve os pés em apoio firme, mantenha o corpo alinhado e desça com controle."},
 {name:"Flexão arqueira",focus:["Peito","Braços"],home:true,gym:true,beginner:false,styles:["Calistenia"],sets:"3",reps:"5–8 por lado",rest:"120 s",cue:"Transfira o peso para um braço enquanto o outro permanece mais estendido; use amplitude controlada."},
 {name:"Agachamento pistol assistido",focus:["Pernas","Glúteos"],home:true,gym:true,beginner:false,styles:["Calistenia"],sets:"3",reps:"5–8 por lado",rest:"120 s",cue:"Use apoio para equilíbrio, desça com controle e mantenha o joelho alinhado ao pé."},
 {name:"Prancha com toque alternado nos ombros",focus:["Abdômen","Braços"],home:true,gym:true,beginner:false,styles:["Calistenia","Full body"],sets:"3",reps:"16–24 toques",rest:"60 s",cue:"Afaste os pés para estabilizar a pelve e alterne os toques sem balançar o tronco."},
 {name:"Agachamento até a cadeira",focus:["Glúteos","Pernas","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"10–12",rest:"90 s",cue:"Desça com controle, mantendo os pés apoiados e os joelhos alinhados."},
 {name:"Ponte de glúteos",focus:["Glúteos"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"12–15",rest:"60–90 s",cue:"Eleve o quadril sem hiperestender a lombar; pause brevemente no alto."},
 {name:"Elevação pélvica",focus:["Glúteos"],home:false,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3–4",reps:"8–12",rest:"120 s",cue:"Apoie a parte alta das costas, mantenha o tronco firme e controle a descida."},
 {name:"Abdução de quadril com faixa",focus:["Glúteos"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"12–20",rest:"60 s",cue:"Afaste os joelhos sem girar o tronco; retorne devagar."},
 {name:"Levantamento terra romeno com halteres",focus:["Glúteos","Pernas","Costas"],home:true,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3",reps:"8–12",rest:"120 s",cue:"Leve o quadril para trás, mantenha a coluna neutra e os pesos próximos às pernas."},
 {name:"Afundo apoiado",focus:["Glúteos","Pernas"],home:true,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3",reps:"8–10 por lado",rest:"90 s",cue:"Use apoio estável e amplitude confortável; mantenha o joelho alinhado."},
 {name:"Dead bug",focus:["Abdômen","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"8–10 por lado",rest:"45–60 s",cue:"Mantenha a lombar confortável e mova braço e perna opostos sem perder o controle."},
 {name:"Prancha inclinada",focus:["Abdômen"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"20–35 s",rest:"60 s",cue:"Apoie as mãos em superfície firme, alinhe o corpo e respire continuamente."},
 {name:"Pallof press com faixa/cabo",focus:["Abdômen"],home:true,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3",reps:"10–12 por lado",rest:"60 s",cue:"Resista à rotação do tronco; mantenha quadril e ombros apontados à frente."},
 {name:"Crunch curto",focus:["Abdômen"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"2–3",reps:"10–15",rest:"45–60 s",cue:"Eleve pouco o tronco sem puxar a cabeça; pare se houver desconforto cervical ou lombar."},
 {name:"Remada sentada",focus:["Costas","Braços","Corpo inteiro"],home:false,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"10–12",rest:"90 s",cue:"Puxe os cotovelos para trás sem encolher os ombros."},
 {name:"Remada unilateral com halter",focus:["Costas","Braços"],home:true,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3",reps:"10–12 por lado",rest:"90 s",cue:"Apoie uma mão, mantenha o tronco estável e evite girar o corpo."},
 {name:"Flexão na parede ou banco",focus:["Peito","Braços"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"8–12",rest:"60–90 s",cue:"Ajuste a inclinação para manter o movimento controlado e sem dor."},
 {name:"Supino com halteres ou máquina",focus:["Peito","Braços"],home:false,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3",reps:"8–12",rest:"90 s",cue:"Mantenha os punhos alinhados e não force amplitude no ombro."},
 {name:"Desenvolvimento sentado leve",focus:["Braços"],home:false,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"2–3",reps:"8–12",rest:"90 s",cue:"Use carga confortável e não arqueie a lombar."},
 {name:"Rosca bíceps",focus:["Braços"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"2–3",reps:"10–15",rest:"60 s",cue:"Mantenha os cotovelos próximos ao corpo e evite balançar o tronco."},
 {name:"Tríceps na polia ou extensão com faixa",focus:["Braços"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"2–3",reps:"10–15",rest:"60 s",cue:"Mantenha os cotovelos estáveis e use amplitude confortável."},
 {name:"Agachamento goblet",focus:["Pernas","Glúteos"],home:true,gym:true,beginner:false,styles:["Musculação","Full body"],sets:"3",reps:"8–12",rest:"90–120 s",cue:"Segure o peso junto ao peito e mantenha o tronco firme."},
 {name:"Caminhada ou bicicleta leve",focus:["Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"1",reps:"8–12 min",rest:"—",cue:"Ritmo confortável para aquecer; ajuste ao condicionamento."},
 {name:"Flexão de braços inclinada ou no solo",focus:["Peito","Braços","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Calistenia","Full body","Funcional","HIIT"],sets:"3",reps:"6–12",rest:"90 s",cue:"Comece com as mãos em apoio elevado se necessário; mantenha tronco alinhado e amplitude sem dor."},
 {name:"Remada invertida em barra baixa",focus:["Costas","Braços","Corpo inteiro"],home:false,gym:true,beginner:false,styles:["Calistenia","Full body"],sets:"3",reps:"6–10",rest:"90 s",cue:"Use barra firme e ajuste a inclinação para controlar o esforço; não solte a pegada."},
 {name:"Agachamento livre",focus:["Pernas","Glúteos","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Calistenia","Full body","Funcional"],sets:"3",reps:"12–15",rest:"75–90 s",cue:"Mantenha os pés apoiados, joelhos alinhados e amplitude confortável."},
 {name:"Avanço alternado",focus:["Pernas","Glúteos","Corpo inteiro"],home:true,gym:true,beginner:false,styles:["Calistenia","Full body","Funcional"],sets:"3",reps:"8–10 por lado",rest:"90 s",cue:"Dê um passo estável e desça somente até onde mantém equilíbrio e controle."},
 {name:"Prancha frontal",focus:["Abdômen","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Calistenia","Full body","Funcional"],sets:"3",reps:"20–40 s",rest:"60 s",cue:"Contraia suavemente o abdômen, mantenha o corpo alinhado e não prenda a respiração."},
 {name:"Bird dog",focus:["Abdômen","Costas","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Calistenia","Full body","Funcional"],sets:"3",reps:"8–10 por lado",rest:"45–60 s",cue:"Estenda braço e perna opostos sem girar a pelve; faça devagar."},
 {name:"Elevação de panturrilhas",focus:["Pernas","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["Calistenia","Full body","Funcional"],sets:"3",reps:"12–20",rest:"45–60 s",cue:"Suba e desça com controle; use apoio para equilíbrio."},
 {name:"Mountain climber lento",focus:["Abdômen","Corpo inteiro"],home:true,gym:true,beginner:false,styles:["Calistenia","Full body","Funcional"],sets:"3",reps:"20–30 s",rest:"60 s",cue:"Mantenha os ombros estáveis e mova os joelhos alternadamente sem perder o alinhamento."},
 {name:"Burpee sem salto (adaptado)",focus:["Corpo inteiro"],home:true,gym:true,beginner:false,styles:["Calistenia","Funcional","HIIT"],sets:"2–3",reps:"6–8",rest:"90 s",cue:"Faça a transição passo a passo; retire a flexão e o salto para reduzir impacto."},
 {name:"Agachamento isométrico na parede",focus:["Pernas","Glúteos"],home:true,gym:true,beginner:true,styles:["Calistenia","Funcional"],sets:"3",reps:"20–40 s",rest:"60 s",cue:"Desça até uma posição confortável e mantenha joelhos alinhados aos pés."},
 {name:"Pike push-up adaptada",focus:["Braços","Peito","Corpo inteiro"],home:true,gym:true,beginner:false,styles:["Calistenia","HIIT"],sets:"2–3",reps:"5–8",rest:"90 s",cue:"Use amplitude curta e apoio estável; interrompa se houver desconforto nos ombros."},
 {name:"Elevação lateral com halteres",focus:["Braços"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"12–15",rest:"60 s",cue:"Eleve até a linha dos ombros sem impulso e com carga leve."},
 {name:"Puxada alta na polia ou faixa",focus:["Costas","Braços"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"10–12",rest:"90 s",cue:"Puxe em direção à parte alta do peito sem balançar o tronco."},
 {name:"Cadeira extensora",focus:["Pernas"],home:false,gym:true,beginner:true,styles:["Musculação"],sets:"3",reps:"10–15",rest:"75 s",cue:"Estenda os joelhos com controle e sem travar a articulação."},
 {name:"Mesa flexora",focus:["Pernas","Glúteos"],home:false,gym:true,beginner:true,styles:["Musculação"],sets:"3",reps:"10–15",rest:"75 s",cue:"Flexione os joelhos sem tirar o quadril do apoio."},
 {name:"Supino inclinado com halteres",focus:["Peito","Braços"],home:false,gym:true,beginner:false,styles:["Musculação"],sets:"3",reps:"8–12",rest:"90 s",cue:"Desça os halteres com controle e mantenha os ombros confortáveis."},
 {name:"Face pull com faixa ou polia",focus:["Costas","Braços"],home:true,gym:true,beginner:true,styles:["Musculação","Full body"],sets:"3",reps:"12–15",rest:"60 s",cue:"Puxe em direção ao rosto mantendo cotovelos abertos e ombros baixos."},
 {name:"Step-up em degrau baixo",focus:["Pernas","Glúteos"],home:true,gym:true,beginner:true,styles:["Musculação","Full body","Calistenia","Funcional"],sets:"3",reps:"8–10 por lado",rest:"75 s",cue:"Use degrau firme e baixo; suba e desça devagar, sem impulso."},
 {name:"Agachamento sumô",focus:["Pernas","Glúteos"],home:true,gym:true,beginner:true,styles:["Musculação","Full body","Calistenia","Funcional"],sets:"3",reps:"10–12",rest:"75 s",cue:"Mantenha os pés estáveis e os joelhos acompanhando a direção dos dedos."},
 {name:"Ponte de glúteos com marcha",focus:["Glúteos","Abdômen"],home:true,gym:true,beginner:false,styles:["Full body","Calistenia","Funcional"],sets:"3",reps:"8 por lado",rest:"60 s",cue:"Mantenha a pelve estável enquanto alterna a elevação dos pés."},
 {name:"Prancha lateral com joelhos apoiados",focus:["Abdômen"],home:true,gym:true,beginner:true,styles:["Full body","Calistenia","Funcional"],sets:"3",reps:"20–30 s por lado",rest:"45 s",cue:"Eleve o quadril sem prender a respiração; reduza o tempo se perder alinhamento."},
 {name:"Polichinelo sem salto (step jack)",focus:["Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"30–40 s",rest:"30–45 s",cue:"Abra uma perna de cada vez e acompanhe com os braços, sem impacto."},
 {name:"Marcha acelerada no lugar",focus:["Corpo inteiro","Pernas"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"40 s",rest:"30–45 s",cue:"Aumente o ritmo gradualmente sem perder o controle da respiração."},
 {name:"Boxe sombra",focus:["Braços","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"40 s",rest:"40 s",cue:"Alterne socos no ar com cotovelos destravados e tronco estável."},
 {name:"Toque alternado no step baixo",focus:["Pernas","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"40 s",rest:"40 s",cue:"Alterne os pés em um apoio baixo, firme e antiderrapante."},
 {name:"Toque de ombros em prancha inclinada",focus:["Abdômen","Braços"],home:true,gym:true,beginner:false,styles:["HIIT","Calistenia","Funcional"],sets:"3",reps:"20–30 s",rest:"45–60 s",cue:"Apoie as mãos em superfície firme e evite girar o quadril."},
 {name:"Agachamento com alcance dos braços",focus:["Pernas","Glúteos","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"30–40 s",rest:"40 s",cue:"Faça agachamento confortável e alcance os braços à frente ao subir."},
 {name:"Passada para trás alternada com apoio",focus:["Pernas","Glúteos"],home:true,gym:true,beginner:true,styles:["Full body","Calistenia","Funcional"],sets:"3",reps:"8–10 por lado",rest:"75 s",cue:"Segure um apoio estável e dê passos curtos para trás, sem dor."},
 {name:"Passos laterais contínuos",focus:["Pernas","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"40 s",rest:"30–40 s",cue:"Dê passos laterais amplos e controlados, mantendo joelhos levemente flexionados."},
 {name:"Elevação alternada de joelhos",focus:["Abdômen","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"40 s",rest:"30–40 s",cue:"Eleve um joelho de cada vez em ritmo constante, sem inclinar o tronco."},
 {name:"Toque de calcanhar em pé",focus:["Pernas","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"40 s",rest:"30–40 s",cue:"Alterne o toque do calcanhar à frente, movimentando os braços naturalmente."},
 {name:"Abdominal em pé com joelho cruzado",focus:["Abdômen","Corpo inteiro"],home:true,gym:true,beginner:true,styles:["HIIT","Funcional"],sets:"3",reps:"30–40 s",rest:"30–40 s",cue:"Aproxime cotovelo e joelho opostos sem puxar o pescoço e sem acelerar demais."},
 {name:"Hip thrust com barra",focus:["Glúteos","Pernas"],home:false,gym:true,beginner:false,styles:["Musculação"],sets:"4",reps:"6–10",rest:"150 s",cue:"Apoie as costas no banco, mantenha o queixo recolhido e termine estendendo o quadril sem arquear a lombar."},
 {name:"Agachamento búlgaro",focus:["Glúteos","Pernas"],home:true,gym:true,beginner:false,styles:["Musculação"],sets:"3",reps:"8–10 por lado",rest:"120 s",cue:"Use apoio se necessário, incline levemente o tronco e desça apenas mantendo equilíbrio e joelho alinhado."},
 {name:"Coice de glúteo na polia",focus:["Glúteos"],home:false,gym:true,beginner:true,styles:["Musculação"],sets:"3",reps:"12–15 por lado",rest:"60–75 s",cue:"Mantenha o tronco estável e mova a perna pelo quadril, sem compensar com a lombar."},
 {name:"Leg press",focus:["Pernas","Glúteos"],home:false,gym:true,beginner:true,styles:["Musculação"],sets:"3",reps:"10–12",rest:"120 s",cue:"Ajuste a amplitude sem tirar o quadril do encosto; mantenha joelhos acompanhando os pés."},
];
const split: Record<number, Focus[][]> = {
 2:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços","Abdômen"]],
 3:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços"],["Glúteos","Pernas","Abdômen"]],
 4:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços"],["Glúteos","Pernas"],["Costas","Peito","Braços","Abdômen"]],
 5:[["Glúteos","Pernas","Abdômen"],["Costas","Peito","Braços"],["Glúteos","Pernas"],["Costas","Peito","Braços","Abdômen"],["Glúteos","Abdômen"]]
};
function movementPattern(e: Exercise): "push" | "pull" | "squat" | "hinge" | "core" | "arm" | "other" {
 const n = e.name.toLowerCase();
 if (/flexão|supino|mergulho|dips|desenvolvimento|pike/.test(n)) return "push";
 if (/barra fixa|remada|puxada/.test(n)) return "pull";
 if (/agachamento|afundo|avanço|passada|step-up|leg press|extensora/.test(n)) return "squat";
 if (/terra|ponte|elevação pélvica|hip thrust|mesa flexora|coice/.test(n)) return "hinge";
 if (/prancha|abdominal|crunch|dead bug|bird dog|pallof|mountain climber/.test(n)) return "core";
 if (/rosca|tríceps|bíceps|elevação lateral|face pull/.test(n)) return "arm";
 return "other";
}
function buildConjugatePairs(items: Exercise[], seed = 0) {
 const remaining = [...items];
 const pairs: Exercise[][] = [];
 while (remaining.length > 1) {
  const firstIndex = seed % remaining.length;
  const first = remaining.splice(firstIndex, 1)[0];
  const firstFocus = first.focus.filter(x => x !== "Corpo inteiro");
  const firstPattern = movementPattern(first);
  let bestIndex = 0;
  let bestScore = Number.POSITIVE_INFINITY;
  remaining.forEach((candidate, index) => {
   const candidateFocus = candidate.focus.filter(x => x !== "Corpo inteiro");
   const candidatePattern = movementPattern(candidate);
   const overlap = firstFocus.filter(x => candidateFocus.includes(x)).length;
   let score = overlap * 14;
   if (firstPattern === candidatePattern) score += 12;
   if ((firstPattern === "squat" || firstPattern === "hinge") && (candidatePattern === "squat" || candidatePattern === "hinge")) score += 14;
   if ((firstPattern === "push" && candidatePattern === "pull") || (firstPattern === "pull" && candidatePattern === "push")) score -= 9;
   if ((firstPattern === "core" && ["push","pull","squat","hinge","arm"].includes(candidatePattern)) || (candidatePattern === "core" && ["push","pull","squat","hinge","arm"].includes(firstPattern))) score -= 7;
   if ((firstPattern === "arm" && ["squat","hinge"].includes(candidatePattern)) || (candidatePattern === "arm" && ["squat","hinge"].includes(firstPattern))) score -= 8;
   if (candidateFocus.length === 0) score += 2;
   // Desempate alternado entre sessões para não repetir sempre a mesma combinação.
   score += ((index + seed) % Math.max(1, remaining.length)) * 0.015;
   if (score < bestScore) { bestScore = score; bestIndex = index; }
  });
  pairs.push([first, remaining.splice(bestIndex, 1)[0]]);
 }
 if (remaining.length) pairs.push([remaining[0]]);
 return pairs;
}
export default function WorkoutBuilder({ initialDays = "3", initialPlace = "Casa", initialLevel = "Iniciante", initialGoal = "Condicionamento", initialBmi = 0 }: { initialDays?: string; initialPlace?: string; initialLevel?: string; initialGoal?: string; initialBmi?: number }) {
 const goalFocus: Focus = initialGoal === "Força" ? "Corpo inteiro" : initialGoal === "Mobilidade e bem-estar" ? "Corpo inteiro" : initialGoal === "Emagrecer" ? "Corpo inteiro" : "Corpo inteiro";
 const goalStyle: Style = initialGoal === "Começar a correr" ? "Corrida" : initialGoal === "Força" ? "Musculação" : initialGoal === "Mobilidade e bem-estar" ? "Funcional" : "Full body";
 const [focus,setFocus]=useState<Focus>(goalFocus);
 const [style,setStyle]=useState<Style>(goalStyle);
 const [days,setDays]=useState(Math.min(5,Math.max(2,Number(initialDays)||3)));
 const [place,setPlace]=useState(initialPlace==="Academia"?"Academia":"Casa");
 const [level,setLevel]=useState(initialLevel);
 const [duration,setDuration]=useState("50");
 const [runningDistance,setRunningDistance]=useState("5 km");
 const [aiRequest,setAiRequest]=useState("");
 const [generatedRequest,setGeneratedRequest]=useState("");
 const [variation,setVariation]=useState(0);
 const [expanded,setExpanded]=useState<number|null>(0);
 const generateFromRequest=()=>{
  const q=aiRequest.trim().toLowerCase();
  if(!q)return;
  setGeneratedRequest(aiRequest.trim());
  // Interpreta modalidade, objetivo, foco, nível, ambiente, frequência e duração.
  if(/intermedi[aá]ri/.test(q))setLevel("Intermediário");
  else if(/avan[cç]ad/.test(q))setLevel("Avançado");
  else if(/iniciante|come[cç]ando|come[cç]ar do zero/.test(q))setLevel("Iniciante");
  if(/academia|academia completa|máquina|máquinas|polia|barra e anilha/.test(q))setPlace("Academia");
  else if(/em casa|na minha casa|sem academia|peso do corpo|sem equipamento/.test(q))setPlace("Casa");
  const dayMatch=q.match(/([2-5])\s*(?:dias|vezes)\s*(?:por semana|na semana)?/);
  if(dayMatch)setDays(Number(dayMatch[1]));
  const timeMatch=q.match(/(30|40|50|60)\s*(?:min|minutos)/);
  if(timeMatch)setDuration(timeMatch[1]==="30"?"40":timeMatch[1]);
  else if(/meia hora/.test(q))setDuration("40");
  else if(/quarenta/.test(q))setDuration("40");
  else if(/cinquenta/.test(q))setDuration("50");
  else if(/1 hora|uma hora|sess[aã]o longa/.test(q))setDuration("60");
  if(/gl[uú]te|bumbum/.test(q))setFocus("Glúteos");
  else if(/quadr[ií]ceps|posterior de coxa|pernas|membros inferiores/.test(q))setFocus("Pernas");
  else if(/abd[oô]men|core/.test(q))setFocus("Abdômen");
  else if(/bra[cç]o|b[ií]ceps|tr[ií]ceps|ombro/.test(q))setFocus("Braços");
  else if(/costas/.test(q))setFocus("Costas");
  else if(/peito|peitoral/.test(q))setFocus("Peito");
  else if(/corpo inteiro|full.?body/.test(q))setFocus("Corpo inteiro");
  if(/corrida|correr|5\s?km|10\s?km|15\s?km/.test(q)){
   setStyle("Corrida");
   setRunningDistance(/15\s?km/.test(q)?"15 km":/10\s?km/.test(q)?"10 km":"5 km");
  } else if(/calistenia|peso corporal/.test(q))setStyle("Calistenia");
  else if(/hiit|intervalado/.test(q))setStyle("HIIT");
  else if(/funcional/.test(q))setStyle("Funcional");
  else if(/full.?body|corpo inteiro/.test(q))setStyle("Full body");
  else if(/muscula[cç][aã]o|hipertrofia|ganho de massa|for[cç]a/.test(q))setStyle("Musculação");
  else if(/mobilidade|alongamento/.test(q))setStyle("Funcional");
  setVariation(v=>v+1);
  setExpanded(0);
 };
 const glutePriority=/gl[uú]te|bumbum|perna|inferior|posterior|quadr[ií]ceps/.test(generatedRequest.toLowerCase());
 const sessions=useMemo(()=>{
  const fullBodyGroups: Focus[]=["Glúteos","Pernas","Costas","Peito","Braços","Abdômen","Corpo inteiro"];
  const templates: Focus[][] = style==="Musculação" ? split[days] :
    style==="Corrida" ? Array.from({length:days},()=>fullBodyGroups) :
    Array.from({length:days},()=>fullBodyGroups);
  return templates.map((groups,index)=>{
   const candidates=library.filter(e=>(place==="Casa"?e.home:e.gym)&&e.styles.includes(style)&&groups.some(g=>e.focus.includes(g))&&(level==="Iniciante" ? e.beginner : level==="Intermediário" ? !e.beginner : true));
   const unique=candidates.filter((e,i,a)=>a.findIndex(x=>x.name===e.name)===i);
   const preferred=unique.filter(e=>e.focus.includes(focus));
   const gluteOrder=["Hip thrust com barra","Elevação pélvica","Agachamento búlgaro","Levantamento terra romeno com halteres","Agachamento goblet","Leg press","Coice de glúteo na polia","Abdução de quadril com faixa","Mesa flexora","Agachamento sumô","Afundo apoiado"];
   const glutePreferred=glutePriority&&focus==="Glúteos"&&style==="Musculação"?gluteOrder.map(n=>unique.find(e=>e.name===n)).filter((e):e is Exercise=>Boolean(e)):[];
   // A prioridade escolhida nunca é retirada pela rotação: primeiro entram os exercícios do foco,
   // depois os complementares. A variação acontece dentro de cada grupo, sem descaracterizar o pedido.
   const priority=glutePreferred.length?glutePreferred:preferred;
   const secondary=unique.filter(e=>!priority.includes(e));
   const rotate=(items:Exercise[],offset:number)=>items.length?[...items.slice(offset%items.length),...items.slice(0,offset%items.length)]:[];
   const priorityRotated=rotate(priority,index+variation);
   const secondaryRotated=rotate(secondary,index*2+variation);
   const ordered=[...priorityRotated,...secondaryRotated];
   const limit=Number(duration)>=60?10:Number(duration)>=50?8:6;
   const targetCount=Math.min(ordered.length,limit);
   const selected=ordered.slice(0,targetCount);
   return {title:`Treino ${String.fromCharCode(65+index)}`,groups,items:selected,pairs:buildConjugatePairs(selected,index+variation)};
  });
 },[days,place,level,duration,focus,style,glutePriority,variation]);
 return <section className="panel workout-builder">
  <span className="eyebrow">ASSISTENTE DE TREINO · PLANO PERSONALIZÁVEL</span>
  <h2>Seu treino, do seu jeito</h2>
  <div className="ai-workout-box">
   <label htmlFor="ai-workout-request"><b>Peça seu treino ao assistente</b><small>Escreva com suas palavras o que deseja treinar. Ex.: “Quero um treino pesado de pernas e glúteos na academia, com ênfase em hipertrofia”.</small></label>
   <textarea id="ai-workout-request" value={aiRequest} onChange={e=>setAiRequest(e.target.value)} rows={3} placeholder="Descreva o treino que você quer..." />
   <button type="button" className="home-primary" onClick={generateFromRequest} disabled={!aiRequest.trim()}>✦ Interpretar pedido e montar treino</button>
   {generatedRequest&&<p className="muted" role="status">Pedido interpretado: “{generatedRequest}”. Ajustamos o foco e as opções do plano abaixo. Revise o treino e adapte cargas e pausas ao seu nível.</p>}
  </div>
  <p>Plano inicial considerando sua avaliação. O pedido escrito também ajusta modalidade, foco, nível, local, frequência e duração quando essas informações aparecem no texto. Você pode revisar tudo abaixo antes de usar.</p>
  <div className="bmi"><Target/><div><b>Objetivo considerado: {initialGoal}</b><p>{initialGoal === "Emagrecer" ? "Prioridade em sessões de corpo inteiro, força e condicionamento progressivo. O treino não promete perda localizada nem substitui orientação nutricional." : initialGoal === "Força" ? "Prioridade em exercícios de resistência, técnica controlada e progressão gradual de carga." : initialGoal === "Mobilidade e bem-estar" ? "Prioridade em movimentos funcionais confortáveis, controle corporal e mobilidade sem forçar amplitudes." : initialGoal === "Começar a correr" ? "A preparação começa com condicionamento geral e baixo impacto. A corrida não é liberada automaticamente; siga avaliação profissional antes de iniciar." : "Prioridade em desenvolver condicionamento geral e força de forma gradual."}</p></div></div>
  <div className="form-grid">
   <label>Modalidade<select value={style} onChange={e=>setStyle(e.target.value as Style)}>{["Musculação","Full body","Calistenia","Funcional","HIIT","Corrida"].map(x=><option key={x}>{x}</option>)}</select></label>
   {style==="Corrida"&&<label>Distância da prova<select value={runningDistance} onChange={e=>setRunningDistance(e.target.value)}><option>5 km</option><option>10 km</option><option>15 km</option></select></label>}
   <label>Meu foco principal<select value={focus} onChange={e=>setFocus(e.target.value as Focus)}>{["Glúteos","Abdômen","Pernas","Braços","Costas","Peito","Corpo inteiro"].map(x=><option key={x}>{x}</option>)}</select></label>
   <label>Onde vou treinar<select value={place} onChange={e=>setPlace(e.target.value)}><option>Casa</option><option>Academia</option></select></label>
   <label>Nível<select value={level} onChange={e=>setLevel(e.target.value)}>{["Iniciante","Intermediário","Avançado"].map(x=><option key={x}>{x}</option>)}</select></label>
   <label>Dias por semana<select value={days} onChange={e=>setDays(Number(e.target.value))}>{[2,3,4,5].map(x=><option key={x} value={x}>{x} dias</option>)}</select></label>
   <label>Duração desejada<select value={duration} onChange={e=>setDuration(e.target.value)}><option value="40">40 minutos</option><option value="50">50 minutos</option><option value="60">60 minutos</option></select></label>
  </div>
  <div className="bmi"><Target/><div><b>Foco selecionado: {focus}</b><p>Os pares conjugados alternam exercícios de grupos musculares diferentes: faça uma série de A, depois uma série de B, descanse e repita a sequência. Exercícios abdominais fortalecem o core, mas não eliminam gordura localizada.</p></div></div>
  {style==="Corrida"&&<div className="safety-alert"><b>Plano progressivo para corrida de rua — {runningDistance}</b><p>Treino educativo para quem já consegue caminhar sem desconforto e não apresenta contraindicação. Faça três sessões não consecutivas por semana, com ritmo leve em que consiga conversar. Se estiver começando do zero, alterne corrida leve e caminhada; não tente cumprir os tempos correndo sem pausas.</p><p><b>Semana 1:</b> 1 min de trote + 2 min caminhando, repetir 8 vezes.</p><p><b>Semana 2:</b> 2 min de trote + 2 min caminhando, repetir 7 vezes.</p><p><b>Semana 3:</b> 3 min de trote + 2 min caminhando, repetir 6 vezes.</p><p><b>Semana 4:</b> 5 min de trote + 2 min caminhando, repetir 5 vezes.</p><p><b>Semana 5:</b> 8 min de trote + 2 min caminhando, repetir 4 vezes.</p><p><b>Semana 6:</b> 10 min de trote + 2 min caminhando, repetir 3 vezes.</p><p><b>Semana 7:</b> 15 min de corrida leve + 2 min caminhando, repetir 2 vezes.</p><p><b>Semana 8:</b> corrida leve contínua de até 30 min, somente se as semanas anteriores foram confortáveis.</p><p><b>Meta escolhida:</b> {runningDistance}. Para 5 km, consolide as 8 semanas acima e só avance quando conseguir correr 30 minutos confortavelmente. Para 10 km, depois dessa base, faça mais 4 semanas: longão leve de 35, 40, 45 e 50 minutos, respectivamente. Para 15 km, depois da base de 5 km, faça mais 8 semanas: longão leve de 40, 45, 50, 55, 60, 65, 70 e 55 minutos, respectivamente; a última semana reduz o volume para recuperação. Aumente apenas se estiver recuperado e sem dor; não há prazo garantido para completar a distância.</p><p><b>Fortalecimento conjugado 2 vezes por semana:</b> {level==="Iniciante" ? "faça 2–3 séries alternadas: A) agachamento até a cadeira + B) elevação de panturrilhas; A) ponte de glúteos + B) bird dog; A) step-up baixo + B) prancha inclinada." : "faça 3 séries alternadas: A) agachamento goblet ou agachamento búlgaro + B) elevação de panturrilhas; A) levantamento terra romeno + B) prancha com toque alternado nos ombros; A) avanço alternado + B) remada invertida. Ajuste a carga para terminar cada série com 1–3 repetições possíveis, mantendo a técnica."} Complete uma série de A e uma de B antes da pausa de 60–90 segundos.</p><p><b>Distribuição sugerida:</b> Dia 1 intervalos corrida/caminhada; Dia 2 caminhada confortável e fortalecimento; Dia 3 corrida leve mais longa. Deixe ao menos um dia de recuperação entre corridas.</p><p>Interrompa se houver dor que altere a passada, tontura, dor no peito ou falta de ar fora do esperado. Procure avaliação profissional antes de iniciar se houver doença, lesão, dor persistente, gravidez ou longo período de sedentarismo.</p></div>}
  <h3>Seu planejamento semanal</h3>
  <p className="muted">{style==="Full body"?"Full body: cada sessão trabalha os principais grupos musculares, com alternância de exercícios e recuperação entre dias.":style==="Calistenia"?"Calistenia: exercícios com o peso do corpo, com progressões e regressões conforme o nível.":style==="Funcional"?"Funcional: movimentos integrados para força, estabilidade e coordenação.":style==="HIIT"?"HIIT: blocos curtos de esforço alternados com recuperação; ajuste a intensidade ao condicionamento.":"Musculação: foco em força e hipertrofia com exercícios de resistência."}</p>
  <div className="workout-meta"><div><small>FREQUÊNCIA</small><b>{days} dias</b></div><div><small>SESSÃO</small><b>{duration} min</b></div><div><small>AMBIENTE</small><b>{place}</b></div></div>
  {style!=="Corrida"&&sessions.map((session,index)=><article className="workout-day" key={session.title}>
   <button type="button" className="secondary workout-day-toggle" aria-expanded={expanded===index} onClick={()=>setExpanded(expanded===index?null:index)}><span><b>{session.title} · Dia {index+1}</b><small>{session.groups.join(" · ")}</small></span><span>{expanded===index?"−":"+"}</span></button>
   {expanded===index&&<div className="workout-day-content">
    <p><b>Aquecimento:</b> 8–10 minutos de caminhada/bicicleta leve e mobilidade dinâmica confortável. Não pule esta etapa.</p>
    {session.pairs.map((pair,pairIndex)=><div className="conjugate-block" key={pairIndex}><b>{pair.length===2?`Bloco conjugado ${pairIndex+1} · alternância A/B`:`Exercício complementar ${pairIndex+1}`}</b>{pair.map((e,i)=><div className="planned-exercise" key={e.name}><div><b>{pair.length===2?`Exercício ${i===0?"A":"B"}: ${e.name}`:`Exercício: ${e.name}`}</b><p>{e.cue}</p><small>{Math.min(5,Number.parseInt(e.sets,10)+(level==="Iniciante"?0:level==="Intermediário"?1:2))} séries · {e.reps} repetições/tempo · descanso {e.rest}</small><a className="exercise-demo-link" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(e.name+" execução correta")}`} target="_blank" rel="noreferrer">▶ Ver execução em vídeo</a></div></div>)}<p className="muted">{pair.length===2?"Faça 1 série do exercício A e, logo em seguida, 1 série do exercício B. Isso completa uma volta. Descanse 60–90 segundos e repita a sequência até completar as séries prescritas dos dois exercícios. Exemplo: rosca bíceps → agachamento → descanso → repetir.":"Faça as séries deste exercício com a pausa indicada."} Se a técnica cair, aumente a pausa ou reduza a carga.</p></div>)}
    <p><b>Finalização:</b> 5–8 minutos de caminhada leve, respiração e mobilidade suave. Registre cargas e repetições.</p>
   </div>}
  </article>)}
  <div className="safety-alert"><b>Como progredir ao longo de 7 semanas</b><p><b>Semanas 1–2:</b> aprenda a técnica e termine as séries sentindo que conseguiria fazer mais 3 repetições.</p><p><b>Semanas 3–5:</b> quando completar o topo da faixa de repetições com boa técnica, aumente um pouco a carga ou a dificuldade; não aumente tudo ao mesmo tempo.</p><p><b>Semana 6:</b> consolide a execução sem treinar até a falha.</p><p><b>Semana 7:</b> reduza cerca de 20–30% das séries e reavalie conforto, técnica e recuperação. Depois, ajuste o próximo bloco.</p></div>
  <p className="muted"><Clock3 size={15}/> O tempo total inclui 8–10 min de aquecimento, as séries conjugadas de cada bloco, alternando A e B com pausas entre voltas e 5–8 min de finalização. Para 40/50/60 min, o plano agora seleciona até 6/8/10 exercícios principais; o tempo real varia conforme ritmo, carga e pausas. Não acelere a execução para caber no relógio.</p>
  {initialBmi >= 35 && <div className="safety-alert"><b>Adaptação importante</b><p>Como o IMC informado está na faixa de 35 ou mais, este plano não inclui corrida nem saltos como recomendação automática. Priorize movimentos confortáveis e obtenha orientação profissional individual antes de aumentar a intensidade.</p></div>}
  <p className="muted">Este é um plano educativo inicial baseado nas respostas da avaliação, não uma prescrição clínica. Se houver dor, limitação, condição clínica ou dúvida sobre a execução, suspenda o exercício e procure avaliação individual de profissional de Educação Física e/ou saúde. A seleção automática não substitui avaliação presencial.</p>
  <button type="button" className="secondary" onClick={()=>{setFocus("Glúteos");setStyle("Musculação");setDays(3);setPlace("Casa");setLevel("Iniciante");setDuration("50");setRunningDistance("5 km");setVariation(0);setGeneratedRequest("");setAiRequest("");setExpanded(0)}}><RotateCcw size={16}/> Restaurar opções iniciais</button>
 </section>;
}
