import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Componente Recharts pentru grafic
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Emoțiile dintre care poate alege utilizatorul
const EMOTIONS = [
  "Bucurie",
  "Liniște",
  "Tristețe",
  "Furie",
  "Frică",
  "Anxietate",
  "Rușine",
  "Vinovăție",
  "Gelozie",
  "Invidie",
  "Mândrie",
  "Dezgust",
];

const EMOTION_DETAILS = {
  Bucurie:
    "A simți că faci progrese rezonabile spre realizarea unui scop important pentru tine. Bucuria apare când ceva merge bine în direcția valorilor și dorințelor tale.",
  Liniște:
    "A simți că o situație stresantă sau amenințătoare a trecut, iar acum ești în siguranță. Este starea de calm după ce pericolul, presiunea sau conflictul s-au diminuat.",
  Tristețe:
    "A fi trăit o pierdere importantă: o persoană, o relație, o oportunitate sau o parte din tine. Tristețea semnalează faptul că ceva valoros pentru tine nu mai este.",
  Furie:
    "A percepe o ofensă umilitoare la adresa ta sau a celor apropiați. Furia apare când simți că ai fost tratat nedrept, desconsiderat sau atacat.",
  Anxietate:
    "A te confrunta cu o amenințare incertă, greu de definit, dar simțită ca periculoasă. Anxietatea este frica orientată spre viitor, față de ceea ce „s-ar putea întâmpla”.",
  Frică:
    "A te confrunta cu un pericol imediat sau o amenințare serioasă pentru siguranța ta (fizică sau psihologică). Frica semnalează nevoia de protecție și siguranță.",
  Rușine:
    "A simți că nu ai reușit să trăiești conform propriului tău ideal despre tine. Rușinea apare când crezi că „nu ești suficient de bun” în fața ochilor tăi sau ai celorlalți.",
  Vinovăție:
    "A simți că ai încălcat o regulă morală importantă pentru tine sau că ai făcut rău cuiva. Vinovăția semnalează nevoia de a repara, de a cere iertare sau de a schimba ceva.",
  Gelozie:
    "A resimți resentiment și teamă față de o a treia persoană care amenință o relație importantă pentru tine. Gelozia apare când îți este teamă să nu pierzi afecțiunea sau atenția cuiva.",
  Invidie:
    "A-ți dori ceea ce are altcineva (calități, succes, relații, obiecte) și a te compara dezavantajos cu acea persoană. Invidia poate ascunde dorințe, nevoi și valori personale neîmplinite.",
  Mândrie:
    "A-ți întări identitatea de sine asumându-ți meritul pentru o realizare sau un lucru valoros (al tău sau al grupului cu care te identifici). Mândria sănătoasă apare când recunoști efortul și progresul real.",
  Dezgust:
    "A simți repulsie față de ceva perceput ca fiind „indigestibil” – murdar, contaminat sau profund incompatibil cu valorile tale. Dezgustul te ajută să te îndepărtezi de ceea ce simți că îți face rău.",
};

const STORAGE_KEY = "emotion-journal-simple-v1";

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load entries from localStorage", e);
      return [];
    }
  });

  const [situation, setSituation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [behavior, setBehavior] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save entries to localStorage", e);
    }
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emotion.trim()) {
      alert("Please enter an emotion.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      situation: situation.trim(),
      emotion: emotion.trim(),
      behavior: behavior.trim(),
    };

    setEntries((prev) => [newEntry, ...prev]);

    setSituation("");
    setEmotion("");
    setBehavior("");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all entries?")) {
      setEntries([]);
    }
  };

  const emotionStats = getEmotionStats(entries);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Glow background, ca în platforma App4Mind */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:py-10">
        <Header />

        {/* Layout principal: formular + listă + grafic pe o singură pagină */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <JournalForm
            situation={situation}
            setSituation={setSituation}
            emotion={emotion}
            setEmotion={setEmotion}
            behavior={behavior}
            setBehavior={setBehavior}
            onSubmit={handleSubmit}
          />

          <StatsPanel
            entries={entries}
            emotionStats={emotionStats}
            onClearAll={handleClearAll}
          />
        </div>

        <JournalList entries={entries} />
      </main>
    </div>
  );
}

// ---------------- HEADER ----------------
function Header() {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-[11px] text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          CBT · Conștientizare Emoțională · ABC Simplificat (Situație → Emoție →
          Comportament)
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
          Jurnal Emoțional Simplificat
          <span className="block bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-lg text-transparent md:text-xl">
            Pasul 1 – Observă situația, emoția și comportamentul
          </span>
        </h1>
        <p className="max-w-2xl text-sm text-slate-300 md:text-base">
          Acesta este un jurnal CBT simplificat. Pentru fiecare situație, alege
          o emoție principală și notează ce ai făcut. Mai târziu, poți vedea ce
          emoții sunt cel mai des prezente în viața ta folosind graficul din
          dreapta.
        </p>
      </motion.div>
    </header>
  );
}

// ---------------- FORMULAR ----------------
function JournalForm({
  situation,
  setSituation,
  emotion,
  setEmotion,
  behavior,
  setBehavior,
  onSubmit,
}) {
  return (
    <motion.section
      className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/80"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={onSubmit} className="space-y-4 text-sm">
        {/* Situația */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Situație / context
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/40 focus:border-cyan-400 focus:ring"
            placeholder="Unde erai? Cu cine? Ce se întâmpla?"
          />
          <p className="text-[11px] text-slate-400">
            Exemplu: „În mașină, întârziam la muncă, era aglomerație și îmi suna
            telefonul.”
          </p>
        </div>

        {/* Emoția */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Emoția principală pe care ai simțit-o*
          </label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/50 focus:border-cyan-400 focus:ring"
          >
            <option value="">Alege o emoție…</option>
            {EMOTIONS.map((emo) => (
              <option key={emo} value={emo}>
                {emo}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Începe prin a alege o singură emoție dominantă. Mai târziu, în
            aplicațiile următoare, vom lucra și cu gândurile și distorsiunile
            cognitive.
          </p>

          {emotion && EMOTION_DETAILS[emotion] && (
            <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-200">
              <div className="mb-1 text-[11px] font-semibold text-cyan-300">
                Tema relațională centrală a acestei emoții
              </div>
              <p>{EMOTION_DETAILS[emotion]}</p>
            </div>
          )}
        </div>

        {/* Comportamentul */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Ce ai făcut? (comportament)
          </label>
          <textarea
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/40 focus:border-cyan-400 focus:ring"
            placeholder="Cum ai reacționat? (ex.: te-ai certat, ai evitat, ai mâncat, te-ai închis în tine, ai stat pe telefon)"
          />
          <p className="text-[11px] text-slate-400">
            Aici observăm simplu reacția. Mai târziu vei învăța cum gândurile
            influențează acest comportament.
          </p>
        </div>

        {/* Buton salvare */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400">
            *Emoția este obligatorie. Situația și comportamentul te ajută să
            observi tipare, dar pot fi notate pe scurt.
          </p>
          <button
            type="submit"
            disabled={!emotion}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Salvează înregistrarea
          </button>
        </div>
      </form>
    </motion.section>
  );
}

// ---------------- PANOU STATISTICI + GRAFIC ----------------
function StatsPanel({ entries, emotionStats, onClearAll }) {
  return (
    <motion.aside
      className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/80"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-100">
          Prezentare generală a emoțiilor
        </h2>
        <p className="text-[11px] text-slate-400">
          Acest grafic arată de câte ori apare fiecare emoție în înregistrările
          tale. Te ajută să vezi ce emoții sunt dominante în ultima perioadă.
        </p>
      </div>

      {/* Graficul propriu-zis */}
      <div className="h-56 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
        {emotionStats.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
            Adaugă cel puțin o înregistrare pentru a vedea graficul.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="emotion"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  fontSize: 12,
                  color: "#e5e7eb",
                }}
              />
              {/* Bară stil App4Mind: cyan + emerald */}
              <Bar
                dataKey="count"
                fill="url(#emotionGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient
                  id="emotionGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Total înregistrări: {entries.length}</span>
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 font-semibold text-slate-200 hover:border-rose-500 hover:text-rose-300"
        >
          Șterge tot
        </button>
      </div>
    </motion.aside>
  );
}

// ---------------- LISTA CU ÎNREGISTRĂRI ----------------
function JournalList({ entries }) {
  return (
    <section className="mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Situații înregistrate
        </h2>
        <p className="text-[11px] text-slate-400">
          Cele mai noi înregistrări apar primele.
        </p>
      </div>

      {entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
          Nicio înregistrare încă. Începe prin a adăuga o situație, a alege o
          emoție și notează cum ai reacționat.
        </div>
      )}

      <AnimatePresence>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <motion.article
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200 shadow-lg shadow-slate-950/80"
            >
              <header className="mb-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {entry.emotion}
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(entry.date).toLocaleString()}
                </span>
              </header>

              {entry.situation && (
                <EntryField label="Situație / context">
                  {entry.situation}
                </EntryField>
              )}
              {entry.behavior && (
                <EntryField label="Comportament">{entry.behavior}</EntryField>
              )}
            </motion.article>
          ))}
        </div>
      </AnimatePresence>
    </section>
  );
}

function EntryField({ label, children }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="text-[11px] text-slate-200">{children}</div>
    </div>
  );
}

function getEmotionStats(entries) {
  const map = {};

  for (const entry of entries) {
    if (!entry.emotion) continue;
    map[entry.emotion] = (map[entry.emotion] || 0) + 1;
  }

  return Object.entries(map).map(([emotion, count]) => ({
    emotion,
    count,
  }));
}
