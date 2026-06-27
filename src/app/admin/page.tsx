"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  LogOut,
  MessageSquareText,
  Play,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { CelebraLogo } from "@/components/Brand";
import type { Question, QuestionPatch } from "@/lib/types";

const ADMIN_KEY = "celebrateen_admin_password";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function sortSelected(questions: Question[]) {
  return [...questions]
    .filter((question) => question.selected)
    .sort((a, b) => {
      const posA = a.position ?? Number.MAX_SAFE_INTEGER;
      const posB = b.position ?? Number.MAX_SAFE_INTEGER;

      if (posA !== posB) {
        return posA - posB;
      }

      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedQuestions = useMemo(() => sortSelected(questions), [questions]);
  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return questions;
    }

    return questions.filter((question) => {
      const author = question.name || "Anônimo";
      return `${author} ${question.question}`.toLowerCase().includes(term);
    });
  }, [questions, search]);

  const loadQuestions = useCallback(
    async (nextPassword = storedPassword, remember = false) => {
      if (!nextPassword) {
        return;
      }

      setLoading(true);
      setError("");

      const response = await fetch("/api/questions", {
        headers: { "x-admin-password": nextPassword },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      setLoading(false);

      if (!response.ok) {
        localStorage.removeItem(ADMIN_KEY);
        setStoredPassword("");
        setError(result.error ?? "Não foi possível carregar as perguntas.");
        return;
      }

      if (remember) {
        localStorage.setItem(ADMIN_KEY, nextPassword);
        setStoredPassword(nextPassword);
        setPassword(nextPassword);
      }

      setQuestions(result.questions ?? []);
    },
    [storedPassword],
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPassword = password.trim();

    if (!nextPassword) {
      setError("Digite a senha administrativa.");
      return;
    }

    await loadQuestions(nextPassword, true);
  }

  async function syncUpdates(updates: QuestionPatch[]) {
    if (!storedPassword || !updates.length) {
      return;
    }

    setSaving(true);
    setError("");

    const response = await fetch("/api/questions", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": storedPassword,
      },
      body: JSON.stringify({ updates }),
    });

    const result = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(result.error ?? "Não foi possível salvar a seleção.");
      await loadQuestions();
    }
  }

  function applySelection(nextSelected: Question[]) {
    const selectedMap = new Map(
      nextSelected.map((question, index) => [
        question.id,
        { selected: true, position: index },
      ]),
    );

    const nextQuestions = questions.map((question) => {
      const selected = selectedMap.get(question.id);

      if (!selected) {
        return { ...question, selected: false, position: null };
      }

      return { ...question, ...selected };
    });

    setQuestions(nextQuestions);

    void syncUpdates(
      nextQuestions.map((question) => ({
        id: question.id,
        selected: question.selected,
        position: question.position,
      })),
    );
  }

  function toggleQuestion(question: Question) {
    if (question.selected) {
      applySelection(selectedQuestions.filter((item) => item.id !== question.id));
      return;
    }

    applySelection([...selectedQuestions, question]);
  }

  function moveQuestion(id: string, direction: -1 | 1) {
    const currentIndex = selectedQuestions.findIndex((item) => item.id === id);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= selectedQuestions.length) {
      return;
    }

    const reordered = [...selectedQuestions];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, moved);
    applySelection(reordered);
  }

  function clearSelection() {
    applySelection([]);
  }

  function logout() {
    localStorage.removeItem(ADMIN_KEY);
    setStoredPassword("");
    setPassword("");
    setQuestions([]);
  }

  function startPresentation() {
    window.open("/apresentacao", "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_KEY) ?? "";

    if (saved && saved !== storedPassword) {
      const timer = window.setTimeout(() => {
        void loadQuestions(saved, true);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [loadQuestions, storedPassword]);

  if (!storedPassword) {
    return (
      <main className="admin-bg flex min-h-dvh items-center justify-center px-5 py-8">
        <form
          onSubmit={handleLogin}
          className="glass-panel w-full max-w-sm rounded-2xl p-6"
        >
          <CelebraLogo compact />
          <h1 className="soft-title mt-4 text-center text-2xl">
            Área administrativa
          </h1>
          <label className="mt-6 block">
            <span className="text-sm font-semibold uppercase text-slate-700">
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="glass-control mt-2 h-12 w-full rounded-xl px-4 text-slate-800 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/15"
            />
          </label>
          {error ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <button className="liquid-button mt-5 h-12 w-full rounded-xl text-sm font-semibold uppercase text-white transition">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-bg min-h-dvh">
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[250px_1fr]">
        <aside className="glass-panel m-4 flex rounded-2xl px-5 py-5 text-slate-700 lg:min-h-[calc(100dvh-2rem)] lg:flex-col">
          <CelebraLogo compact className="grid place-items-center" />
          <nav className="mt-8 grid gap-2 text-sm font-semibold">
            <span className="liquid-button flex items-center gap-3 rounded-xl px-4 py-3 text-white">
              <MessageSquareText size={18} />
              Perguntas
            </span>
          </nav>
          <button
            onClick={logout}
            className="mt-8 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white/40 lg:mt-auto"
          >
            <LogOut size={18} />
            Sair
          </button>
        </aside>

        <section className="px-4 py-6 sm:px-8 lg:px-10">
          <header className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <h1 className="soft-title text-3xl">
                Todas as perguntas
              </h1>
              <p className="muted-copy mt-1 font-medium">
                Selecione e ordene as perguntas para a apresentação.
              </p>
            </div>
            <label className="glass-card flex h-12 min-w-72 items-center gap-3 rounded-xl px-4">
              <Search size={20} className="text-zinc-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar pergunta ou nome..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>
            <div className="glass-card rounded-xl px-5 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-zinc-500">
                Total de perguntas
              </p>
              <strong className="block text-2xl font-semibold text-slate-800">
                {questions.length}
              </strong>
            </div>
          </header>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => void loadQuestions()}
              disabled={loading}
              className="glass-card inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold uppercase text-slate-700 transition hover:border-pink-300 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Atualizar
            </button>
            {saving ? (
              <span className="text-sm font-semibold text-slate-600">
                Salvando ordem...
              </span>
            ) : null}
            {error ? (
              <span className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredQuestions.map((question) => (
              <article
                key={question.id}
                className="glass-card min-h-40 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleQuestion(question)}
                    className={`grid size-7 shrink-0 place-items-center rounded-lg border transition ${
                      question.selected
                        ? "border-pink-500 bg-pink-500 text-white"
                        : "border-slate-300 bg-white/50 text-transparent hover:border-pink-300"
                    }`}
                    aria-label="Selecionar pergunta"
                  >
                    <Check size={16} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-slate-800">
                      {question.name || "Anônimo"}
                    </h2>
                    <p className="text-xs font-medium text-zinc-500">
                      {formatTime(question.created_at)}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-lg font-medium leading-snug text-slate-800">
                  {question.question}
                </p>
              </article>
            ))}
          </div>

          <section className="glass-panel mt-6 rounded-2xl p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 className="soft-title text-2xl">
                  Perguntas selecionadas ({selectedQuestions.length})
                </h2>
                <p className="muted-copy mt-1 text-sm font-medium">
                  Use os botões para definir a sequência no telão.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={startPresentation}
                  disabled={!selectedQuestions.length}
                  className="liquid-button inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold uppercase text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play size={17} />
                  Iniciar apresentação
                </button>
                <button
                  onClick={clearSelection}
                  disabled={!selectedQuestions.length}
                  className="glass-control inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold uppercase text-slate-600 transition hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Limpar seleção
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {selectedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="glass-card grid gap-3 rounded-xl p-3 sm:grid-cols-[48px_1fr_auto] sm:items-center"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-pink-500 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {question.name || "Anônimo"}
                    </p>
                    <p className="truncate text-sm font-medium text-slate-600">
                      {question.question}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveQuestion(question.id, -1)}
                      disabled={index === 0}
                      className="glass-control grid size-10 place-items-center rounded-xl text-slate-700 transition hover:border-pink-300 hover:text-pink-600 disabled:opacity-35"
                      aria-label="Mover para cima"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      onClick={() => moveQuestion(question.id, 1)}
                      disabled={index === selectedQuestions.length - 1}
                      className="glass-control grid size-10 place-items-center rounded-xl text-slate-700 transition hover:border-pink-300 hover:text-pink-600 disabled:opacity-35"
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button
                      onClick={() => toggleQuestion(question)}
                      className="glass-control grid size-10 place-items-center rounded-xl text-slate-700 transition hover:border-red-300 hover:text-red-600"
                      aria-label="Remover da seleção"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}

              {!selectedQuestions.length ? (
                <div className="rounded-xl border border-dashed border-slate-300/80 p-8 text-center text-sm font-semibold text-slate-500">
                  Nenhuma pergunta selecionada.
                </div>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
