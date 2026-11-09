export type ProgramExercise = {
  name: string;
  technicalName: string;
  muscle: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tempo: string;
  gym: string;
  home: string;
  knee: string;
  back: string;
  observation: string;
};
export type ProgramDay = { label: string; focus: string; exercises: ProgramExercise[] };
export type ExampleProgram = {
  id: string;
  title: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  split: string;
  frequency: string;
  description: string;
  days: ProgramDay[];
};

const ex = (name:string, technicalName:string, muscle:string, gym:string, home:string, knee:string, back:string, reps="8–12", sets=2, restSeconds=90, tempo="2 segundos para descer e 2 para subir"):ProgramExercise => ({
  name, technicalName, muscle, sets, reps, restSeconds, tempo, gym, home, knee, back,
  observation:"Movimento controlado. Use uma carga que permita terminar a série com cerca de 2 a 3 repetições possíveis, sem perder a técnica."
});

const beginnerDay: ProgramDay = {
  label:"Corpo inteiro", focus:"Peito, costas, pernas, quadril, ombros e abdômen",
  exercises:[
    ex("Sentar e levantar","Agachamento com apoio","Pernas","Sentar e levantar de um banco ou cadeira firme, ajustando a altura.","Sentar e levantar de uma cadeira firme; use as mãos como apoio se necessário.","Use cadeira mais alta e amplitude confortável; não force dor no joelho.","Mantenha o tronco firme e incline o corpo a partir do quadril, sem arredondar as costas.","8–10",2,120),
    ex("Empurrar peso deitado","Supino reto com halteres ou máquina","Peito","Empurrar os pesos ou a máquina à frente, deitado no banco.","Deitar no chão e empurrar garrafas leves para cima, ou fazer flexão na parede.","Se apoiar no chão incomodar, faça flexão na parede ou sentado com elástico.","Mantenha as costas apoiadas e não arqueie a lombar.","8–12",2,120),
    ex("Puxar peso para baixo","Puxada frontal","Costas","Puxar a barra da máquina em direção à parte alta do peito.","Puxar elástico preso acima da cabeça ou fazer remada com elástico.","Use posição sentada estável e carga leve; não balance o corpo.","Não incline excessivamente o tronco nem compense arqueando a lombar.","10–12",2,90),
    ex("Levar quadril para trás","Movimento de dobrar o quadril com peso leve","Posterior de coxa","Levar o quadril para trás segurando pesos leves junto às pernas.","Levar o quadril para trás com mãos nas coxas ou segurando garrafas leves.","Mantenha joelhos levemente dobrados e movimento sem dor.","Faça movimento curto, coluna confortável e peso próximo ao corpo; interrompa se houver dor.","8–10",2,120),
    ex("Levantar braços de lado","Elevação lateral","Ombros","Levantar halteres leves para os lados até uma altura confortável.","Levantar garrafas pequenas para os lados, sem elevar além do confortável.","Faça sentado se ficar em pé incomodar; não balance o corpo.","Sente-se com apoio e mantenha o tronco sem inclinar para os lados.","10–12",2,90),
    ex("Segurar corpo reto apoiado","Prancha inclinada","Abdômen","Apoiar antebraços em banco firme e manter o corpo alinhado.","Apoiar as mãos na parede ou em bancada firme e manter o corpo alinhado.","Escolha posição que não exija ajoelhar nem cause desconforto.","Mantenha respiração contínua e coluna em posição confortável; reduza o tempo se perder o controle.","15–25 segundos",2,60,"Manter posição com respiração contínua")
  ]
};

const upperDay: ProgramDay = {
  label:"Superior", focus:"Peito, costas, ombros, bíceps e tríceps",
  exercises:[
    ex("Empurrar peso deitado","Supino reto","Peito","Máquina ou halteres no banco.","Flexão na parede ou no apoio alto; elástico à frente.","Prefira apoio estável e amplitude confortável.","Mantenha tronco apoiado e não force arco lombar.","8–12",3,90),
    ex("Puxar peso sentado","Remada baixa","Costas","Puxar o cabo em direção ao abdômen, sentado.","Puxar elástico preso à frente ou mochila leve.","Apoie os pés e evite compensar com o corpo.","Mantenha coluna confortável e não arredonde as costas.","8–12",3,90),
    ex("Empurrar peso acima","Desenvolvimento de ombros","Ombros","Empurrar halteres ou máquina acima da cabeça, sem travar os cotovelos.","Empurrar elástico ou garrafas leves acima da cabeça; pode fazer sentado.","Faça sentado se precisar de mais estabilidade.","Evite arquear a lombar; reduza a altura se perder a posição.","8–12",2,90),
    ex("Dobrar braços com peso","Rosca direta","Bíceps","Dobrar os cotovelos segurando barra ou halteres.","Dobrar os cotovelos com elástico ou garrafas.","Pode fazer sentado para maior estabilidade.","Encoste as costas no apoio e não balance o tronco.","10–12",2,60),
    ex("Esticar braços com cabo","Extensão de tríceps na polia","Tríceps","Esticar os cotovelos empurrando a corda para baixo.","Esticar os cotovelos com elástico preso acima ou atrás.","Use posição estável, sem ajoelhar.","Mantenha o tronco firme e não incline para compensar.","10–12",2,60),
    ex("Puxar corda ao rosto","Puxada alta para o rosto","Ombros e costas","Puxar a corda em direção ao rosto, com cotovelos abertos e carga leve.","Puxar elástico preso na altura dos olhos.","Faça em pé com apoio se necessário.","Não projete a cabeça nem arqueie a lombar.","12–15",2,90)
  ]
};
const lowerDay: ProgramDay = {
  label:"Inferior", focus:"Coxas, posterior, glúteos e panturrilhas",
  exercises:[
    ex("Agachar com apoio","Agachamento com apoio","Coxas e glúteos","Agachar segurando apoio fixo ou usando banco como referência.","Sentar e levantar de cadeira firme.","Use cadeira mais alta e movimento sem dor; não force profundidade.","Mantenha tronco firme e evite arredondar a lombar.","8–12",3,120),
    ex("Empurrar plataforma","Leg press","Coxas e glúteos","Empurrar a plataforma com os pés, sem travar os joelhos.","Sentar e levantar de cadeira ou agachar com apoio.","Reduza a amplitude e a carga se houver desconforto; não aproxime demais os joelhos do peito.","Mantenha quadril e costas apoiados no encosto.","10–12",3,120),
    ex("Dobrar pernas sentado","Cadeira flexora","Posterior de coxa","Dobrar os joelhos na máquina sentado.","Deitado de barriga para baixo, dobrar uma perna de cada vez sem peso ou com elástico leve.","Use amplitude confortável e sem dor no joelho.","Mantenha o quadril apoiado e não force a lombar.","10–12",2,90),
    ex("Subir quadril apoiado","Elevação pélvica","Glúteos","Subir o quadril com a parte alta das costas apoiada em banco.","Ponte de glúteos no chão.","Se deitar incomodar, escolha outra opção com orientação.","Suba sem arquear excessivamente a lombar; pare antes de perder o controle.","10–12",3,90),
    ex("Subir calcanhares","Elevação de panturrilhas","Panturrilhas","Subir e descer os calcanhares segurando apoio ou máquina.","Subir na ponta dos pés segurando cadeira ou parede.","Faça sentado se houver dor ou dificuldade de equilíbrio.","Mantenha tronco estável e evite inclinar o corpo.","12–15",2,60),
    ex("Abrir pernas sentado","Abdução de quadril","Quadril e glúteos","Abrir as pernas na máquina com carga leve.","Sentado, afastar os joelhos com faixa elástica leve.","Não force abertura nem provoque dor no quadril ou joelho.","Mantenha tronco apoiado e estável.","12–15",2,60)
  ]
};

const pushDay: ProgramDay = {
  label:"Empurrar", focus:"Peito, ombros e tríceps",
  exercises:[
    ex("Empurrar peso deitado","Supino reto com barra ou halteres","Peito","Supino em banco com barra ou halteres.","Flexão no chão ou em apoio alto, conforme capacidade.","Use apoio alto se necessário e amplitude confortável.","Mantenha pés firmes e lombar confortável no banco.","6–10",3,150),
    ex("Empurrar peso inclinado","Supino inclinado","Peito","Empurrar halteres em banco levemente inclinado.","Flexão com mãos em bancada firme.","Evite apoio instável e não force ombro.","Mantenha costelas e quadril alinhados.","8–12",3,120),
    ex("Empurrar peso acima","Desenvolvimento de ombros","Ombros","Empurrar halteres ou máquina acima da cabeça.","Empurrar elástico ou garrafas sentado.","Faça sentado e com amplitude confortável.","Não arqueie a lombar para terminar a repetição.","8–12",3,120),
    ex("Levantar braços de lado","Elevação lateral","Ombros","Levantar halteres para os lados com controle.","Levantar garrafas pequenas para os lados.","Reduza a altura se houver dor no ombro.","Faça sentado se ajudar a manter o tronco estável.","12–15",2,60),
    ex("Esticar braços com cabo","Extensão de tríceps na polia","Tríceps","Esticar os cotovelos empurrando a corda para baixo.","Esticar braços com elástico preso acima.","Fique em posição estável, sem ajoelhar.","Evite inclinar o tronco e mantenha abdômen firme.","10–12",3,90),
    ex("Esticar braço acima","Extensão de tríceps acima da cabeça","Tríceps","Estender os cotovelos segurando um halter leve acima da cabeça.","Esticar elástico acima da cabeça ou fazer extensão sentado.","Use amplitude sem dor no ombro.","Mantenha tronco apoiado e não arqueie a lombar.","10–12",2,90)
  ]
};
const pullDay: ProgramDay = {
  label:"Puxar", focus:"Costas e bíceps",
  exercises:[
    ex("Puxar peso para baixo","Puxada frontal","Costas","Puxar barra da máquina em direção ao peito.","Puxar elástico preso acima da cabeça.","Não balance o corpo nem force ombros.","Mantenha tronco estável e sem inclinar demais.","8–12",3,120),
    ex("Puxar peso sentado","Remada baixa","Costas","Puxar cabo em direção ao abdômen.","Puxar elástico preso à frente ou mochila leve.","Apoie os pés e use carga controlável.","Coluna confortável, sem arredondar ou girar o tronco.","8–12",3,120),
    ex("Puxar peso apoiado","Remada unilateral","Costas","Puxar halter apoiando uma mão em banco firme.","Puxar mochila ou elástico com um braço, apoiando a outra mão.","Use base estável e carga leve.","Apoie o tronco e evite girar a lombar.","10–12",2,90),
    ex("Puxar corda ao rosto","Puxada alta para o rosto","Costas e ombros","Puxar corda em direção ao rosto com carga leve.","Puxar elástico preso na altura dos olhos.","Mantenha postura estável.","Evite projetar a cabeça e arquear a lombar.","12–15",2,60),
    ex("Dobrar braços com peso","Rosca direta","Bíceps","Dobrar cotovelos com barra ou halteres.","Dobrar cotovelos com elástico ou garrafas.","Faça sentado se necessário.","Não balance o tronco para ajudar.","8–12",3,75),
    ex("Dobrar braços neutro","Rosca martelo","Bíceps e antebraço","Dobrar cotovelos com halteres na posição neutra.","Dobrar cotovelos segurando garrafas ou elástico.","Use carga leve e sem impulso.","Mantenha cotovelos próximos ao corpo.","10–12",2,60)
  ]
};
const legsDay: ProgramDay = {
  label:"Pernas", focus:"Coxas, posterior, glúteos e panturrilhas",
  exercises:[
    ex("Agachar com peso","Agachamento com barra","Coxas e glúteos","Agachar com barra leve e supervisão.","Agachar segurando mochila leve junto ao peito ou sentar e levantar.","Use amplitude individual sem dor; não é obrigatório agachar fundo.","Mantenha tronco firme e carga compatível com a técnica.","6–10",3,150),
    ex("Empurrar plataforma","Leg press","Coxas e glúteos","Empurrar a plataforma com controle e sem travar joelhos.","Agachar com apoio ou sentar e levantar com carga leve.","Reduza amplitude se o joelho incomodar; sem dor crescente.","Mantenha quadril e costas apoiados no encosto.","8–12",3,120),
    ex("Descer peso pernas retas","Levantamento terra romeno","Posterior de coxa e glúteos","Levar quadril para trás com pesos próximos às pernas.","Levar quadril para trás com mochila leve ou sem peso.","Joelhos destravados; reduza amplitude se houver desconforto.","Coluna neutra e carga próxima; não desça além do controle.","8–10",3,150),
    ex("Dobrar pernas sentado","Cadeira flexora","Posterior de coxa","Dobrar joelhos na máquina sentado.","Dobrar uma perna de cada vez com elástico leve.","Movimento controlado e sem dor.","Mantenha quadril apoiado.","10–12",2,90),
    ex("Subir quadril apoiado","Elevação pélvica","Glúteos","Subir quadril com costas apoiadas e peso leve/moderado.","Ponte de glúteos no chão.","Escolha amplitude confortável.","Evite hiperestender a lombar no alto.","8–12",3,120),
    ex("Subir calcanhares","Elevação de panturrilhas","Panturrilhas","Subir e descer calcanhares na máquina ou com apoio.","Subir na ponta dos pés segurando parede ou cadeira.","Faça sentado se houver dor ou instabilidade.","Tronco estável, sem balanço.","12–15",3,60)
  ]
};

export const EXAMPLE_PROGRAMS: ExampleProgram[] = [
  {
    id:"iniciante-corpo-inteiro",title:"Iniciante — Corpo inteiro",level:"Iniciante",split:"Corpo inteiro",frequency:"2 a 3 dias por semana, em dias alternados",
    description:"Duas ou três sessões de corpo inteiro, alternando os dias e deixando ao menos um dia de recuperação entre elas. Comece com duas séries e carga leve.",
    days:[beginnerDay]
  },
  {
    id:"intermediario-superior-inferior",title:"Intermediário — Superior e inferior",level:"Intermediário",split:"Superior e inferior",frequency:"3 a 4 dias por semana",
    description:"Alterne sessões de membros superiores e inferiores. Em quatro dias, repita cada sessão uma vez; em três dias, alterne a sessão que se repete na semana seguinte.",
    days:[upperDay,lowerDay]
  },
  {
    id:"avancado-empurrar-puxar-pernas",title:"Avançado — Empurrar, puxar e pernas",level:"Avançado",split:"Empurrar, puxar e pernas",frequency:"4 a 6 dias por semana",
    description:"Ciclo de três sessões. Com seis dias, repita o ciclo duas vezes; com quatro ou cinco dias, continue a sequência sem tentar compensar sessões perdidas.",
    days:[pushDay,pullDay,legsDay]
  }
];

export function getExampleProgram(level:string):ExampleProgram {
  return EXAMPLE_PROGRAMS.find(p=>p.level===level) ?? EXAMPLE_PROGRAMS[0];
}

export function getWeekPrescription(week:number, baseSets:number, baseReps:string, baseRest:number) {
  const w=Math.min(7,Math.max(1,week));
  if(w<=2) return {sets:Math.min(2,baseSets),reps:"10–12",restSeconds:Math.max(90,baseRest),tempo:"2 segundos para descer e 2 para subir",phase:"Adaptação técnica",effort:"Leve a moderado; termine com 3 a 4 repetições possíveis."};
  if(w<=5) return {sets:Math.min(3,baseSets+1),reps:baseReps,restSeconds:baseRest,tempo:"2 segundos para descer e 2 para subir",phase:"Progressão gradual",effort:"Moderado; termine com 2 a 3 repetições possíveis."};
  if(w===6) return {sets:Math.min(3,baseSets+1),reps:"8–10",restSeconds:Math.max(90,baseRest),tempo:"2 segundos para descer e 2 para subir",phase:"Consolidação",effort:"Moderado; sem chegar à falha."};
  return {sets:Math.max(1,Math.min(2,baseSets)),reps:"10–12",restSeconds:Math.max(90,baseRest),tempo:"2 segundos para descer e 2 para subir",phase:"Recuperação e reavaliação",effort:"Reduza a carga em cerca de 10 a 20% e priorize a técnica."};
}
