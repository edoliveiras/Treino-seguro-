export type WorkoutLevel = "Iniciante" | "Intermediário" | "Avançado";
export type TrainingPlace = "Casa" | "Academia";
export type HomeEquipment = "Peso do corpo" | "Elásticos" | "Halteres";
export type PainArea = "Joelho" | "Lombar";
export type ExerciseLike = { name: string; technicalName?: string; focus: string[]; home: boolean; gym: boolean; beginner: boolean; styles: string[]; sets?: string; reps?: string; rest?: string; cue?: string };
export type WorkoutRules = { level: WorkoutLevel; place: TrainingPlace; duration: 40 | 50 | 60; equipment?: HomeEquipment[]; pains?: PainArea[]; overweight?: boolean; week?: number; style?: string };
const text = (e: ExerciseLike) => `${e.name} ${e.technicalName ?? ""}`.toLowerCase();
export function requiredExerciseCount(level: WorkoutLevel, duration: 40 | 50 | 60) {
  if (level === "Iniciante") return duration === 40 ? 6 : 7;
  if (duration === 40) return 6;
  if (duration === 50) return 8;
  return level === "Avançado" ? 10 : 9;
}
export function exerciseEquipment(e: ExerciseLike): HomeEquipment[] {
  const n = text(e);
  const result: HomeEquipment[] = [];
  if (/el[aá]stic|faixa/.test(n)) result.push("Elásticos");
  if (/halter|dumbbell/.test(n)) result.push("Halteres");
  if (!result.length) result.push("Peso do corpo");
  return result;
}
export function isSafeForRules(e: ExerciseLike, rules: WorkoutRules): boolean {
  const n = text(e);
  if (rules.place === "Casa") {
    if (/mochila|remada na mesa|mesa|polia|cabo|m[aá]quina|barra fixa|step|degrau/i.test(n)) return false;
    if (!e.home) return false;
    const available = rules.equipment?.length ? rules.equipment : ["Peso do corpo"];
    if (!exerciseEquipment(e).every(x => available.includes(x))) return false;
  } else if (!e.gym) return false;
  if (rules.level === "Iniciante" && (!e.beginner || /barra livre|com barra|agachamento livre|terra com barra|pistol|afundo|avan[cç]o|burpee|pike|declinada|arqueira|mergulho|dips|barra fixa/i.test(n))) return false;
  if (rules.pains?.includes("Joelho") && /agachamento fundo|agachamento livre|agachamento sum[oô]|afundo|avan[cç]o|passada|salto|jump|pistol|step-up|burpee|polichinelo|pular/i.test(n)) return false;
  if (rules.pains?.includes("Lombar") && /remada curvada|terra pesado|levantamento terra|stiff|good morning|hiperextens[aã]o/i.test(n)) return false;
  if (rules.overweight && rules.level === "Iniciante" && /salto|jump|burpee|polichinelo|pistol|afundo|avan[cç]o|mountain climber/i.test(n)) return false;
  if (rules.overweight && /dead bug|bird dog|ponte de gl[uú]teos|prancha frontal|prancha lateral|crunch|abdominal no ch[aã]o/i.test(n)) return false;
  return true;
}
export function prescriptionForLevel(e: ExerciseLike, rules: WorkoutRules) {
  const week = Math.max(1, Math.min(7, rules.week ?? 1));
  if (rules.level === "Iniciante") return { sets: week < 3 ? "2–3" : "2–3", reps: "10–15", rest: "60–90 s", effort: "Termine sentindo que conseguiria fazer mais 3–4 repetições.", conjugates: week >= 3 };
  if (rules.level === "Intermediário") return { sets: "3–4", reps: "8–12", rest: "60–90 s", effort: "Termine com 2–3 repetições de reserva.", conjugates: true };
  return { sets: "3–5", reps: "6–12", rest: "60–120 s", effort: week <= 2 || week === 6 ? "Termine com 1–2 repetições de reserva; sem chegar à falha." : "Termine com 1–2 repetições de reserva.", conjugates: true };
}
export function ensureFullBodyGroups(groups: string[], style: string) {
  if (style !== "Full body") return groups;
  return ["Peito", "Costas", "Pernas", "Quadril/Glúteos", "Ombros", "Core"];
}
export function safetyNotice() {
  return "Interrompa se houver dor ou sintomas incomuns e procure um profissional.";
}
