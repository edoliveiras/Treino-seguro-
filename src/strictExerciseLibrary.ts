export type StrictLevel = "Iniciante" | "Intermediário" | "Avançado";
export type StrictGroup = "Peito" | "Costas" | "Ombros" | "Bíceps" | "Tríceps" | "Antebraço" | "Quadríceps" | "Posterior de coxa" | "Glúteos" | "Panturrilha" | "Abdômen" | "Lombar e core profundo" | "Cardio" | "Alongamento" | "Equilíbrio";
export type StrictExercise = { name:string; group:StrictGroup; level:StrictLevel; home:boolean; pains:string[] };
const rows = [
["Peito","I","C","Flexão na parede;Flexão com mãos no sofá;Flexão com joelhos no chão;Supino na máquina;Voador na máquina"],
["Peito","M","G","Supino reto com halteres~O;Supino inclinado com halteres~O;Flexão no chão~O;Crucifixo com halteres~O;Cruzamento na polia"],
["Peito","A","G","Supino reto com barra~O;Supino inclinado com barra~O;Flexão com pés elevados~O;Mergulho nas paralelas para peito~O;Flexão explosiva~O"],
["Costas","I","C","Puxada na frente;Remada sentada na máquina;Remada com elástico;Remada com garrafas apoiado no sofá"],
["Costas","M","C","Remada baixa na polia~L;Remada com halter apoiado no banco;Puxada pegada fechada;Barra fixa com ajuda"],
["Costas","A","C","Remada curvada com barra~L;Barra fixa;Remada cavalinho~L;Levantamento terra~LJ"],
["Ombros","I","C","Elevação lateral com garrafas;Desenvolvimento na máquina~O;Elevação frontal leve"],
["Ombros","M","C","Desenvolvimento com halteres sentado~O;Elevação lateral com halteres;Elevação lateral na polia;Voador invertido na máquina;Remada alta~O"],
["Ombros","A","C","Desenvolvimento com barra~OL;Desenvolvimento Arnold~O;Crucifixo invertido com halteres;Parada de mão na parede~O"],
["Bíceps","I","C","Rosca direta leve;Rosca com elástico;Rosca na máquina;Rosca alternada"],
["Bíceps","M","C","Rosca martelo;Rosca na polia;Rosca com barra reta;Rosca scott;Rosca concentrada;Rosca com barra W"],
["Bíceps","A","C","Rosca inclinada no banco;Rosca 21;Rosca na barra fixa com pegada invertida"],
["Tríceps","I","C","Tríceps na polia com corda;Tríceps com elástico;Tríceps no banco com joelhos dobrados~O;Tríceps na máquina"],
["Tríceps","M","C","Tríceps testa com halteres;Tríceps francês~O;Tríceps na polia com barra reta;Tríceps coice;Flexão fechada~O"],
["Tríceps","A","C","Tríceps testa com barra W;Mergulho nas paralelas para tríceps~O;Tríceps no banco com pés elevados~O;Supino fechado~O"],
["Antebraço","I","C","Apertar bolinha ou toalha;Rosca de punho leve"],
["Antebraço","M","C","Rosca de punho invertida;Caminhada do fazendeiro carregando peso"],
["Antebraço","A","C","Pendurar na barra o máximo de tempo"],
["Quadríceps","I","C","Sentar e levantar da cadeira;Leg press leve~J;Cadeira extensora leve~J;Agachamento com apoio~J"],
["Quadríceps","M","C","Agachamento livre~J;Agachamento até sentar no banco~J;Avanço~J;Afundo~J;Subida no degrau com halteres~J"],
["Quadríceps","A","C","Agachamento búlgaro~J;Agachamento com barra~JL;Hack na máquina~J;Agachamento com salto~J"],
["Posterior de coxa","I","G","Mesa flexora;Cadeira flexora"],
["Posterior de coxa","M","C","Flexora em pé na polia;Stiff com halteres~L;Flexora deslizando toalha"],
["Posterior de coxa","A","C","Stiff com barra~L;Terra romeno~L;Flexora nórdica"],
["Glúteos","I","C","Ponte de glúteo;Glúteo de quatro apoios;Abdução na máquina;Passo lateral com elástico"],
["Glúteos","M","C","Elevação de quadril com peso;Glúteo na polia;Ponte com uma perna só;Passada para trás~J"],
["Glúteos","A","C","Hip thrust com barra;Agachamento sumô~J;Elevação de quadril com pés elevados"],
["Panturrilha","I","C","Ponta dos pés no chão;Panturrilha sentado na máquina"],
["Panturrilha","M","C","Panturrilha em pé na máquina;Ponta dos pés no degrau"],
["Panturrilha","A","C","Panturrilha em um pé só no degrau;Panturrilha no leg press"],
["Abdômen","I","C","Abdominal curto~L;Prancha com joelhos apoiados;Elevação de joelhos deitado~L;Dead bug"],
["Abdômen","M","C","Prancha completa;Prancha lateral;Abdominal na máquina~L;Elevação de pernas deitado~L;Bicicleta no ar"],
["Abdômen","A","C","Abdominal na polia;Elevação de pernas na barra fixa;Roda abdominal~L;Prancha com toque nos ombros"],
["Lombar e core profundo","I","C","Gato-camelo;Pássaro-cachorro"],
["Lombar e core profundo","M","C","Superman leve no chão~L;Extensão lombar na máquina~L"],
["Lombar e core profundo","A","C","Extensão lombar no banco romano~L"],
["Cardio","I","C","Caminhada leve 20–30 min;Bicicleta ergométrica;Elíptico;Caminhada rápida"],
["Cardio","M","C","Caminhada + trote, 1 min trota e 2 min anda~J;Corrida leve~J"],
["Cardio","A","C","Tiros 30 s forte e 90 s leve~J;Corrida intervalada~J;Pular corda~J"],
["Alongamento","I","C","Joelhos ao peito deitado;Posição da criança;Parte de trás da coxa deitado;Parte da frente da coxa em pé;Quadril em avanço baixo;Peito na porta;Glúteo com tornozelo no joelho oposto;Torção deitado"],
["Equilíbrio","I","C","Um pé só com apoio;Andar na linha reta"],
["Equilíbrio","M","C","Um pé só sem apoio"],
["Equilíbrio","A","C","Um pé só de olhos fechados;Um pé só em almofada"]
] as const;
const levelMap:Record<string,StrictLevel>={I:"Iniciante",M:"Intermediário",A:"Avançado"};
export const STRICT_EXERCISES:StrictExercise[] = rows.flatMap(([group,level,place,names]) =>
 names.split(";").map(raw=>{const [name,flags=""]=raw.split("~");return {name,group:group as StrictGroup,level:levelMap[level],home:place==="C",pains:[...flags]};})
);
export function getStrictExercises(groups:StrictGroup[],level:StrictLevel,place:"Casa"|"Academia",pains:string[]):StrictExercise[] {
 const rank:Record<StrictLevel,number>={Iniciante:0,Intermediário:1,Avançado:2};
 return STRICT_EXERCISES.filter(e=>groups.includes(e.group)&&rank[e.level]<=rank[level]&&(place==="Academia"||e.home)&&!e.pains.some(p=>pains.includes(({J:"Joelho",L:"Lombar",O:"Ombro"} as Record<string,string>)[p])));
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
