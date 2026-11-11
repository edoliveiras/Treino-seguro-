/* PENDENTE DE REVISÃO CLÍNICA — conteúdo de treino/alimentação requer validação profissional antes da abertura pública. */
import { useEffect, useMemo, useState } from "react";
import { createFoodPhotoSignedUrl, deleteFoodPhoto, uploadFoodPhoto, validateFoodPhoto } from "./foodPhotoStorage";

export type FoodLog = { id: string; name: string; grams: number; unit?: "g" | "ml"; kcal: number; date: string; photoPath?: string };
export type ActivityLog = { id: string; name: string; minutes: number; kcal: number; date: string };

const foods = [
  { name: "Arroz branco cozido", kcal: 128 }, { name: "Arroz integral cozido", kcal: 124 },
  { name: "Feijão carioca cozido", kcal: 76 }, { name: "Feijão preto cozido", kcal: 77 },
  { name: "Peito de frango grelhado sem pele", kcal: 159 }, { name: "Patinho grelhado", kcal: 219 },
  { name: "Ovo cozido", kcal: 146 }, { name: "Banana prata", kcal: 98 },
  { name: "Maçã com casca", kcal: 56 }, { name: "Pão francês", kcal: 300 },
  { name: "Aveia em flocos", kcal: 394 }, { name: "Batata-doce cozida", kcal: 77 },
  { name: "Batata inglesa cozida", kcal: 52 }, { name: "Macarrão cozido", kcal: 157 },
  { name: "Mandioca cozida", kcal: 125 }, { name: "Abóbora cabotiá cozida", kcal: 48 },
  { name: "Brócolis cozido", kcal: 25 }, { name: "Alface", kcal: 11 },
  { name: "Tomate", kcal: 15 }, { name: "Queijo minas frescal", kcal: 264 },
  { name: "Leite integral", kcal: 61 }, { name: "Iogurte natural", kcal: 51 },
  { name: "Azeite de oliva", kcal: 884 }, { name: "Abacate", kcal: 96 },
  { name: "Tapioca (goma hidratada)", kcal: 240 }, { name: "Cuscuz de milho cozido", kcal: 113 },
  { name: "Água", kcal: 0, unit: "ml" }, { name: "Café sem açúcar", kcal: 2, unit: "ml" },
  { name: "Café com açúcar", kcal: 35, unit: "ml" }, { name: "Suco de laranja natural", kcal: 37, unit: "ml" },
  { name: "Suco de uva integral", kcal: 58, unit: "ml" }, { name: "Refrigerante tipo cola", kcal: 42, unit: "ml" },
  { name: "Leite desnatado", kcal: 35, unit: "ml" },
];

const activities = [
  { name: "Caminhada leve", met: 3.0 }, { name: "Caminhada moderada", met: 3.8 },
  { name: "Caminhada rápida", met: 4.8 }, { name: "Corrida leve", met: 7.0 },
  { name: "Corrida moderada", met: 8.3 }, { name: "Bicicleta leve", met: 4.0 },
  { name: "Bicicleta moderada", met: 6.8 }, { name: "Musculação leve", met: 3.0 },
  { name: "Musculação moderada", met: 3.5 }, { name: "Musculação intensa", met: 6.0 },
  { name: "Calistenia moderada", met: 3.8 }, { name: "Calistenia vigorosa", met: 8.0 },
  { name: "HIIT vigoroso", met: 8.0 }, { name: "Dança moderada", met: 4.5 },
  { name: "Subir escadas", met: 8.8 }, { name: "Natação moderada", met: 6.0 },
];

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");

export default function CaloriesTracker({ weight, foodLogs, setFoodLogs, activityLogs, setActivityLogs, userId, photoConsent }: {
  weight: string; foodLogs: FoodLog[]; setFoodLogs: (v: FoodLog[] | ((old: FoodLog[]) => FoodLog[])) => void;
  activityLogs: ActivityLog[]; setActivityLogs: (v: ActivityLog[] | ((old: ActivityLog[]) => ActivityLog[])) => void;
  userId?: string; photoConsent: boolean;
}) {
  const [foodName, setFoodName] = useState(foods[0].name);
  const [grams, setGrams] = useState("100");
  const [foodPhoto, setFoodPhoto] = useState<File | undefined>();
  const [foodPhotoPreview, setFoodPhotoPreview] = useState<string | undefined>();
  const [signedPhotos, setSignedPhotos] = useState<Record<string, string>>({});
  const [photoStatus, setPhotoStatus] = useState("");
  const [activityName, setActivityName] = useState(activities[0].name);
  const [minutes, setMinutes] = useState("30");
  const date = today();
  useEffect(() => {
    if (!foodPhoto) { setFoodPhotoPreview(undefined); return; }
    const url = URL.createObjectURL(foodPhoto);
    setFoodPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foodPhoto]);
  useEffect(() => {
    if (!userId || !photoConsent) { setSignedPhotos({}); return; }
    let active = true;
    const refresh = async () => {
      const paths = [...new Set(foodLogs.map((item) => item.photoPath).filter((path): path is string => Boolean(path)))];
      const entries = await Promise.all(paths.map(async (path) => [path, await createFoodPhotoSignedUrl(userId, path)] as const));
      if (active) setSignedPhotos(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry[1]))));
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 45_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [foodLogs, userId, photoConsent]);
  const addFood = async () => {
    let photoPath: string | undefined;
    if (foodPhoto && userId && photoConsent) {
      try { photoPath = await uploadFoodPhoto(userId, foodPhoto); }
      catch (error) { setPhotoStatus(error instanceof Error ? error.message : "Não foi possível guardar a foto."); return; }
    }
    setFoodLogs(old => [...old, { id: crypto.randomUUID(), name: food.name, grams: Number(grams), unit: foodUnit, kcal: foodEstimate, date, ...(photoPath ? { photoPath } : {}) }]);
    setFoodPhoto(undefined);
    setPhotoStatus(photoPath ? "Alimento registrado e foto guardada em armazenamento privado." : "Alimento registrado. Nenhuma foto foi sincronizada.");
  };
  const bodyWeight = Number(weight);
  const food = foods.find(x => x.name === foodName) ?? foods[0];
  const activity = activities.find(x => x.name === activityName) ?? activities[0];
  const foodUnit = "unit" in food && food.unit === "ml" ? "ml" : "g";
  const foodEstimate = Number(grams) >= 0 ? food.kcal * Number(grams) / 100 : 0;
  const activityEstimate = bodyWeight > 0 && Number(minutes) > 0
    ? Math.max(0, activity.met - 1) * 3.5 * bodyWeight / 200 * Number(minutes) : 0;
  const todayFoods = useMemo(() => foodLogs.filter(x => x.date === date), [foodLogs, date]);
  const todayActivities = useMemo(() => activityLogs.filter(x => x.date === date), [activityLogs, date]);
  const consumed = todayFoods.reduce((sum, x) => sum + x.kcal, 0);
  const burned = todayActivities.reduce((sum, x) => sum + x.kcal, 0);
  return <div className="calorie-tracker">
    <section className="panel">
      <span className="eyebrow">CALCULADORA DE ALIMENTOS</span><h2>Calorias consumidas</h2>
      <p>Escolha o alimento ou bebida e informe a quantidade. As calorias são calculadas automaticamente enquanto você preenche, usando a referência por 100 g ou 100 ml.</p>
      <div className="form-grid">
        <label>Alimento<select value={foodName} onChange={e => setFoodName(e.target.value)}>{foods.map(x => <option key={x.name} value={x.name}>{x.name}</option>)}</select></label>
        <label>Quantidade ({foodUnit})<input type="number" min="0" max="3000" value={grams} onChange={e => setGrams(e.target.value)} /></label>
      </div>
      <label className="photo-upload">Foto do alimento (opcional)
        <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={!userId || !photoConsent} onChange={e => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          try {
            validateFoodPhoto(file);
            setFoodPhoto(file);
            setPhotoStatus("Foto selecionada. Antes do envio, será reduzida a até 1600 px e terá metadados EXIF/GPS removidos.");
          } catch (error) {
            setPhotoStatus(error instanceof Error ? error.message : "Não foi possível carregar a foto.");
            setFoodPhoto(undefined);
          }
          input.value = "";
        }} />
      </label>
      {foodPhotoPreview && <div className="food-photo-preview"><img src={foodPhotoPreview} alt="Prévia do alimento" /><button type="button" className="secondary" onClick={() => { setFoodPhoto(undefined); setPhotoStatus(""); }}>Remover foto</button></div>}
      <p className="muted">A foto é somente um anexo visual. As calorias são calculadas pela escolha manual do alimento e da quantidade. Para sincronizar fotos, entre na conta e autorize separadamente o uso de fotos de alimentos.</p>
      {photoStatus && <p className="muted" role="status">{photoStatus}</p>}
      <div className="calorie-preview"><span>{food.kcal} kcal / 100 {foodUnit}</span><b>{fmt(foodEstimate)} kcal nesta porção</b></div>
      <button className="primary" disabled={grams === "" || !Number.isFinite(Number(grams)) || Number(grams) < 0} onClick={() => void addFood()}>Adicionar alimento ao diário</button>
      <p className="muted">Inclua também bebidas. A preparação muda as calorias: selecione a versão mais parecida com a consumida; óleo, molhos e acompanhamentos devem ser registrados separadamente.</p>
    </section>
    <section className="panel">
      <span className="eyebrow">CALCULADORA DE ATIVIDADE</span><h2>Calorias gastas nos exercícios</h2>
      <p>Estimativa baseada no peso informado na avaliação, no tipo de atividade e no tempo realizado.</p>
      <div className="form-grid">
        <label>Exercício<select value={activityName} onChange={e => setActivityName(e.target.value)}>{activities.map(x => <option key={x.name}>{x.name}</option>)}</select></label>
        <label>Duração (minutos)<input type="number" min="1" max="600" value={minutes} onChange={e => setMinutes(e.target.value)} /></label>
      </div>
      <div className="calorie-preview"><span>{bodyWeight > 0 ? `Peso usado: ${bodyWeight} kg` : "Informe seu peso na aba Avaliação"}</span><b>{fmt(activityEstimate)} kcal estimadas</b></div>
      <button className="primary" disabled={!bodyWeight || bodyWeight <= 0 || !Number(minutes) || Number(minutes) <= 0} onClick={() => setActivityLogs(old => [...old, { id: crypto.randomUUID(), name: activity.name, minutes: Number(minutes), kcal: activityEstimate, date }])}>Registrar exercício</button>
      <p className="muted">Estimativa do gasto adicional acima do repouso, pela fórmula MET − 1. Intensidade real, condicionamento, pausas e características individuais alteram o resultado. Não é uma medição do relógio ou equipamento.</p>
    </section>
    <section className="panel">
      <span className="eyebrow">RESUMO DE HOJE</span><h2>Seu balanço calórico registrado</h2>
      <div className="calorie-summary">
        <div><small>CONSUMIDAS</small><b>{fmt(consumed)} kcal</b></div>
        <div><small>GASTAS EM EXERCÍCIOS</small><b>{fmt(burned)} kcal</b></div>
        <div><small>DIFERENÇA</small><b>{fmt(consumed - burned)} kcal</b></div>
      </div>
      <p className="muted">A diferença é apenas entre alimentos e exercícios registrados aqui. Não representa o balanço energético completo do dia: o corpo também gasta energia em repouso e nas atividades cotidianas. Não use esse número sozinho para definir dieta ou meta de emagrecimento.</p>
      <div className="calorie-log"><b>Alimentos de hoje</b>{todayFoods.length ? todayFoods.map(x => <div className="calorie-log-row" key={x.id}>{x.photoPath && signedPhotos[x.photoPath] && <img className="food-log-photo" src={signedPhotos[x.photoPath]} alt={"Foto de " + x.name} />}<span>{x.name} · {x.grams} {x.unit ?? "g"}</span><b>{fmt(x.kcal)} kcal</b><button aria-label={"Excluir " + x.name} onClick={async () => { if (x.photoPath && userId) { const removed = await deleteFoodPhoto(userId, x.photoPath); if (!removed) { setPhotoStatus("Não foi possível excluir a foto. Tente novamente."); return; } } setFoodLogs(old => old.filter(y => y.id !== x.id)); }}>×</button></div>) : <p>Nenhum alimento registrado hoje.</p>}</div>
      <div className="calorie-log"><b>Exercícios de hoje</b>{todayActivities.length ? todayActivities.map(x => <div className="calorie-log-row" key={x.id}><span>{x.name} · {x.minutes} min</span><b>{fmt(x.kcal)} kcal</b><button aria-label={"Excluir " + x.name} onClick={() => setActivityLogs(old => old.filter(y => y.id !== x.id))}>×</button></div>) : <p>Nenhum exercício registrado hoje.</p>}</div>
    </section>
    <p className="muted">Base alimentar de referência: TACO/NEPA-Unicamp. Valores aproximados por 100 g; não substituem avaliação nutricional. Gasto adicional estimado por MET, conforme o Compendium of Physical Activities. <a href="https://pacompendium.com/" target="_blank" rel="noreferrer">Consultar referência de atividades</a>.</p>
  </div>;
}
