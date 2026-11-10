export type StrictLevel = "Iniciante" | "Intermediário" | "Avançado";
export type StrictGroup = "Peito" | "Costas" | "Ombros" | "Bíceps" | "Tríceps" | "Antebraço" | "Quadríceps" | "Posterior de coxa" | "Glúteos" | "Panturrilha" | "Abdômen" | "Lombar e core profundo" | "Cardio" | "Alongamento" | "Equilíbrio";
export type StrictExercise = { name:string; group:StrictGroup; level:StrictLevel; home:boolean; pains:string[] };

// Catálogo transcrito da biblioteca de referência enviada pelo responsável pelo app.
// Cada item aparece em um único grupo principal; C = casa; J/L/O = restrições.
const rows: [string,string,string][] = [
["Peito","I","Flexão com as mãos na parede~C;Flexão com as mãos no sofá/banco~C;Supino na máquina (peito na máquina)~;Flexão com os joelhos no chão~C;Crucifixo na máquina (voador)~"],
["Peito","M","Supino reto com halteres~O;Supino inclinado com halteres~O;Flexão de braço no chão~CO;Crucifixo com halteres~O;Cruzamento de polia (crossover)~"],
["Peito","A","Supino reto com barra~O;Supino inclinado com barra~O;Flexão com os pés elevados~CO;Mergulho nas paralelas (peito)~O;Flexão com palma (explosiva)~CO"],
["Costas","I","Puxada na frente (puxador alto)~;Remada sentada na máquina~;Remada com elástico~C;Remada com garrafas/mochila (apoiado no sofá)~C"],
["Costas","M","Remada baixa na polia~L;Remada com halteres apoiado no banco~;Puxada com pegada fechada~;Barra fixa com ajuda (máquina ou elástico)~C"],
["Costas","A","Remada curvada com barra~L;Barra fixa~C;Remada cavalinho~L;Levantamento terra~JL"],
["Ombros","I","Elevação lateral com garrafas~C;Desenvolvimento na máquina~O;Elevação frontal com halteres leves~C"],
["Ombros","M","Desenvolvimento com halteres sentado~O;Elevação lateral com halteres~;Elevação lateral na polia~;Crucifixo invertido (ombro de trás) na máquina~;Remada alta~O"],
["Ombros","A","Desenvolvimento com barra~LO;Desenvolvimento Arnold~O;Crucifixo invertido com halteres~;Parada de mão na parede (apoio invertido)~CO"],
["Bíceps","I","Rosca direta com halteres leves~C;Rosca com elástico~C;Rosca na máquina~;Rosca alternada~C"],
["Bíceps","M","Rosca martelo~C;Rosca na polia~;Rosca com barra reta~;Rosca scott (banco inclinado de apoio)~;Rosca concentrada~;Rosca com barra W~"],
["Bíceps","A","Rosca inclinada (banco a 45°)~;Rosca 21 (7 baixo + 7 alto + 7 completas)~;Rosca na barra fixa (pegada invertida)~"],
["Tríceps","I","Tríceps na polia com corda~;Tríceps com elástico~C;Tríceps banco (apoio das mãos, pés no chão e joelhos dobrados)~CO;Tríceps na máquina~"],
["Tríceps","M","Tríceps testa com halteres~;Tríceps francês (um halter atrás da cabeça)~O;Tríceps na polia com barra reta~;Tríceps coice (chute para trás)~C;Flexão fechada (mãos juntas)~CO"],
["Tríceps","A","Tríceps testa com barra W~;Mergulho nas paralelas (tríceps)~O;Tríceps banco com pés elevados~CO;Supino fechado~O"],
["Antebraço","I","Apertar bolinha/toalha~C;Rosca de punho com halter leve~C"],
["Antebraço","M","Rosca de punho invertida~C;Caminhada do fazendeiro (carregar peso)~C"],
["Antebraço","A","Pendurar na barra (segurar o máximo de tempo)~C"],
["Quadríceps","I","Sentar e levantar da cadeira~C;Leg press (com pouco peso)~J;Cadeira extensora (leve)~J;Agachamento com apoio (segurando em algo)~CJ"],
["Quadríceps","M","Agachamento livre~CJ;Agachamento no banco (agachar até sentar)~CJ;Avanço (passada)~CJ;Afundo (passo à frente e agacha)~CJ;Subida no banco/degrau com halteres~CJ"],
["Quadríceps","A","Agachamento búlgaro~CJ;Agachamento com barra~JL;Hack (máquina)~J;Agachamento com salto~CJ"],
["Posterior de coxa","I","Mesa flexora (deitado)~;Cadeira flexora (sentado)~"],
["Posterior de coxa","M","Flexão de perna em pé na polia~;Stiff com halteres~L;Flexora com bola/deslizando toalha~C"],
["Posterior de coxa","A","Stiff com barra~L;Levantamento terra romeno~L;Flexora nórdica (descida controlada)~C"],
["Glúteos","I","Ponte de glúteo (deitado, sobe o quadril)~C;Glúteo de quatro apoios (chute para trás)~C;Abdução de quadril (abridora de pernas)~;Passo lateral com elástico~C"],
["Glúteos","M","Elevação de quadril com um peso (hip thrust)~C;Glúteo na polia~;Ponte com uma perna só~C;Passada longa para trás~CJ"],
["Glúteos","A","Hip thrust com barra~;Agachamento sumô~J;Elevação de quadril com pés elevados~C"],
["Panturrilha","I","Ficar na ponta dos pés (no chão)~C;Panturrilha sentado (máquina)~"],
["Panturrilha","M","Panturrilha em pé na máquina~;Ponta dos pés no degrau~C"],
["Panturrilha","A","Panturrilha em um pé só no degrau~C;Panturrilha no leg press~"],
["Abdômen","I","Abdominal curto (só levanta os ombros)~CL;Prancha com joelhos apoiados~C;Elevação de joelhos deitado~CL;Dead bug (braço e perna opostos deitado)~C"],
["Abdômen","M","Prancha completa~C;Prancha lateral~C;Abdominal na máquina~L;Elevação de pernas deitado~CL;Bicicleta no ar~C"],
["Abdômen","A","Abdominal na polia (ajoelhado)~;Elevação de pernas na barra fixa~;Roda abdominal~CL;Prancha com movimento (toque nos ombros/escalador)~C"],
["Lombar e core profundo","I","Gato-camelo (quatro apoios)~C;Ponte de glúteo~C;Pássaro-cachorro (braço e perna opostos)~C"],
["Lombar e core profundo","M","Extensão lombar no chão (superman leve)~CL;Extensão lombar na máquina~L"],
["Lombar e core profundo","A","Extensão lombar no banco romano~L"],
["Cardio","I","Caminhada leve (20–30 min)~C;Bicicleta ergométrica~;Elíptico~;Caminhada rápida / esteira inclinada~C"],
["Cardio","M","Caminhada + trote (1 min trota / 2 min anda)~CJ;Corrida leve contínua~CJ"],
["Cardio","A","Tiros (30 s forte / 90 s leve)~CJ;Corrida intervalada~CJ;Pular corda~CJ"],
["Alongamento","I","Joelhos ao peito deitado~C;Posição da criança~C;Alongar parte de trás da coxa (deitado, perna no alto)~C;Alongar parte da frente da coxa (em pé)~C;Alongar o quadril (avanço baixo)~C;Alongar o peito na porta~C;Alongar glúteo (tornozelo no joelho oposto)~C;Torção deitado~C"],
["Equilíbrio","I","Ficar em um pé só (com apoio)~C;Andar na linha reta (pé na frente do outro)~C"],
["Equilíbrio","M","Ficar em um pé só (sem apoio)~C"],
["Equilíbrio","A","Um pé só com olhos fechados~C;Um pé só em superfície instável (almofada)~C"]
];
const levelMap:Record<string,StrictLevel>={I:"Iniciante",M:"Intermediário",A:"Avançado"};
export const STRICT_EXERCISES:StrictExercise[] = rows.flatMap(([group,level,names]) =>
 names.split(";").map(raw=>{const [name,flags=""]=raw.split("~");return {name,group:group as StrictGroup,level:levelMap[level],home:flags.includes("C"),pains:[...flags].filter(flag=>flag!=="C")};})
);
export function getStrictExercises(groups:StrictGroup[],level:StrictLevel,place:"Casa"|"Academia",pains:string[]):StrictExercise[] {
 const rank:Record<StrictLevel,number>={Iniciante:0,Intermediário:1,Avançado:2};
 return STRICT_EXERCISES.filter(e=>groups.includes(e.group)&&rank[e.level]<=rank[level]&&(place==="Academia"||e.home)&&!e.pains.some(p=>pains.includes(({J:"Joelho",L:"Lombar",O:"Ombro"} as Record<string,string>)[p]))).sort((a,b)=>rank[a.level]-rank[b.level]);
}
export function expandStrictGroups(selected:string[]):StrictGroup[] {
 const all:StrictGroup[]=["Peito","Costas","Ombros","Bíceps","Tríceps","Antebraço","Quadríceps","Posterior de coxa","Glúteos","Panturrilha","Abdômen","Lombar e core profundo","Cardio","Alongamento","Equilíbrio"];
 if(selected.includes("Corpo inteiro")) return all.filter(g=>g!=="Alongamento"&&g!=="Equilíbrio");
 const expanded=[...selected];
 if(expanded.includes("Pernas")) expanded.push("Quadríceps","Posterior de coxa","Glúteos","Panturrilha");
 if(expanded.includes("Braços")) expanded.push("Bíceps","Tríceps","Ombros","Antebraço");
 const map:Record<string,StrictGroup>={"Ombro":"Ombros","Lombar":"Lombar e core profundo"};
 return [...new Set(expanded.map(x=>map[x]??x).filter((x):x is StrictGroup=>all.includes(x as StrictGroup)))];
}
