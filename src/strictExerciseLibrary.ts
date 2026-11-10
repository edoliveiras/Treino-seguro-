export type StrictLevel = "Iniciante" | "Intermediário" | "Avançado";
export type StrictGroup = "Peito" | "Costas" | "Ombros" | "Bíceps" | "Tríceps" | "Antebraço" | "Quadríceps" | "Posterior de coxa" | "Glúteos" | "Panturrilha" | "Abdômen" | "Lombar e core profundo" | "Cardio" | "Alongamento" | "Equilíbrio";
export type StrictExercise = { name:string; group:StrictGroup; level:StrictLevel; home:boolean; pains:string[] };
const rows: [string,string,string][] = [
["Peito","I","Flexão na parede~C;Flexão com mãos no sofá~C;Flexão com joelhos no chão~C;Supino na máquina;Voador na máquina"],
["Peito","M","Supino reto com halteres~O;Supino inclinado com halteres~O;Flexão no chão~CO;Crucifixo com halteres~O;Cruzamento na polia"],
["Peito","A","Supino reto com barra~O;Supino inclinado com barra~O;Flexão com pés elevados~CO;Mergulho nas paralelas para peito~O;Flexão explosiva~CO"],
["Costas","I","Puxada na frente;Remada sentada na máquina;Remada com elástico~C;Remada com garrafas apoiado no sofá~C"],
["Costas","M","Remada baixa na polia~L;Remada com halter apoiado no banco;Puxada pegada fechada;Barra fixa com ajuda~C"],
["Costas","A","Remada curvada com barra~L;Barra fixa~C;Remada cavalinho~L;Levantamento terra~LJ"],
["Ombros","I","Elevação lateral com garrafas~C;Desenvolvimento na máquina~O;Elevação frontal leve~C"],
["Ombros","M","Desenvolvimento com halteres sentado~O;Elevação lateral com halteres~C;Elevação lateral na polia;Voador invertido na máquina;Remada alta~O"],
["Ombros","A","Desenvolvimento com barra~OL;Desenvolvimento Arnold~O;Crucifixo invertido com halteres;Parada de mão na parede~CO"],
["Bíceps","I","Rosca direta leve~C;Rosca com elástico~C;Rosca na máquina;Rosca alternada~C"],
["Bíceps","M","Rosca martelo~C;Rosca na polia;Rosca com barra reta;Rosca scott;Rosca concentrada;Rosca com barra W"],
["Bíceps","A","Rosca inclinada no banco;Rosca 21;Rosca na barra fixa com pegada invertida"],
["Tríceps","I","Tríceps na polia com corda;Tríceps com elástico~C;Tríceps no banco com joelhos dobrados~CO;Tríceps na máquina"],
["Tríceps","M","Tríceps testa com halteres;Tríceps francês~O;Tríceps na polia com barra reta;Tríceps coice~C;Flexão fechada~CO"],
["Tríceps","A","Tríceps testa com barra W;Mergulho nas paralelas para tríceps~O;Tríceps no banco com pés elevados~CO;Supino fechado~O"],
["Antebraço","I","Apertar bolinha ou toalha~C;Rosca de punho leve~C"],
["Antebraço","M","Rosca de punho invertida~C;Caminhada do fazendeiro carregando peso~C"],
["Antebraço","A","Pendurar na barra o máximo de tempo~C"],
["Quadríceps","I","Sentar e levantar da cadeira~C;Leg press leve~J;Cadeira extensora leve~J;Agachamento com apoio~CJ"],
["Quadríceps","M","Agachamento livre~CJ;Agachamento até sentar no banco~CJ;Avanço~CJ;Afundo~CJ;Subida no degrau com halteres~CJ"],
["Quadríceps","A","Agachamento búlgaro~CJ;Agachamento com barra~JL;Hack na máquina~J;Agachamento com salto~CJ"],
["Posterior de coxa","I","Mesa flexora;Cadeira flexora"],
["Posterior de coxa","M","Flexora em pé na polia;Stiff com halteres~L;Flexora deslizando toalha~C"],
["Posterior de coxa","A","Stiff com barra~L;Terra romeno~L;Flexora nórdica~C"],
["Glúteos","I","Ponte de glúteo~C;Glúteo de quatro apoios~C;Abdução na máquina;Passo lateral com elástico~C"],
["Glúteos","M","Elevação de quadril com peso;Glúteo na polia;Ponte com uma perna só~C;Passada para trás~CJ"],
["Glúteos","A","Hip thrust com barra;Agachamento sumô~J;Elevação de quadril com pés elevados~C"],
["Panturrilha","I","Ponta dos pés no chão~C;Panturrilha sentado na máquina"],
["Panturrilha","M","Panturrilha em pé na máquina;Ponta dos pés no degrau~C"],
["Panturrilha","A","Panturrilha em um pé só no degrau~C;Panturrilha no leg press"],
["Abdômen","I","Abdominal curto~CL;Prancha com joelhos apoiados~C;Elevação de joelhos deitado~CL;Dead bug~C"],
["Abdômen","M","Prancha completa~C;Prancha lateral~C;Abdominal na máquina~L;Elevação de pernas deitado~CL;Bicicleta no ar~C"],
["Abdômen","A","Abdominal na polia;Elevação de pernas na barra fixa;Roda abdominal~L;Prancha com toque nos ombros~C"],
["Lombar e core profundo","I","Gato-camelo~C;Pássaro-cachorro~C"],
["Lombar e core profundo","M","Superman leve no chão~CL;Extensão lombar na máquina~L"],
["Lombar e core profundo","A","Extensão lombar no banco romano~L"],
["Cardio","I","Caminhada leve 20–30 min~C;Bicicleta ergométrica;Elíptico;Caminhada rápida~C"],
["Cardio","M","Caminhada + trote, 1 min trota e 2 min anda~CJ;Corrida leve~CJ"],
["Cardio","A","Tiros 30 s forte e 90 s leve~CJ;Corrida intervalada~CJ;Pular corda~CJ"],
["Alongamento","I","Joelhos ao peito deitado~C;Posição da criança~C;Parte de trás da coxa deitado~C;Parte da frente da coxa em pé~C;Quadril em avanço baixo~C;Peito na porta~C;Glúteo com tornozelo no joelho oposto~C;Torção deitado~C"],
["Equilíbrio","I","Um pé só com apoio~C;Andar na linha reta~C"],
["Equilíbrio","M","Um pé só sem apoio~C"],
["Equilíbrio","A","Um pé só de olhos fechados~C;Um pé só em almofada~C"]
];
const levelMap:Record<string,StrictLevel>={I:"Iniciante",M:"Intermediário",A:"Avançado"};
export const STRICT_EXERCISES:StrictExercise[] = rows.flatMap(([group,level,names]) =>
 names.split(";").map(raw=>{const [name,flags=""]=raw.split("~");return {name,group:group as StrictGroup,level:levelMap[level],home:flags.includes("C"),pains:[...flags].filter(flag=>flag!=="C")};})
);
export function getStrictExercises(groups:StrictGroup[],level:StrictLevel,place:"Casa"|"Academia",pains:string[]):StrictExercise[] {
 const rank:Record<StrictLevel,number>={Iniciante:0,Intermediário:1,Avançado:2};
 return STRICT_EXERCISES.filter(e=>groups.includes(e.group)&&rank[e.level]<=rank[level]&&(place==="Academia"||e.home)&&!e.pains.some(p=>pains.includes(({J:"Joelho",L:"Lombar",O:"Ombro"} as Record<string,string>)[p]))).sort((a,b)=>rank[b.level]-rank[a.level]);
}
export function expandStrictGroups(selected:string[]):StrictGroup[] {
 const all:StrictGroup[]=["Peito","Costas","Ombros","Bíceps","Tríceps","Antebraço","Quadríceps","Posterior de coxa","Glúteos","Panturrilha","Abdômen","Lombar e core profundo","Cardio","Alongamento","Equilíbrio"];
 if(selected.includes("Corpo inteiro")) return all;
 const expanded=[...selected];
 if(expanded.includes("Pernas")) expanded.push("Quadríceps","Posterior de coxa","Glúteos","Panturrilha");
 if(expanded.includes("Braços")) expanded.push("Bíceps","Tríceps","Ombros","Antebraço");
 const map:Record<string,StrictGroup>={"Ombro":"Ombros","Lombar":"Lombar e core profundo"};
 return [...new Set(expanded.map(x=>map[x]??x).filter((x):x is StrictGroup=>all.includes(x as StrictGroup)))];
}
