"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CelebraLogo, DecorativeStage } from "@/components/Brand";
import type { Question } from "@/lib/types";

const ADMIN_KEY = "celebrateen_admin_password";

export default function PresentationPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentQuestion = questions[currentIndex];
  const hasQuestions = questions.length > 0;
  const questionTextSize =
    (currentQuestion?.question.length ?? 0) > 240
      ? "text-3xl"
      : (currentQuestion?.question.length ?? 0) > 130
        ? "text-4xl"
        : "text-5xl";
  const progress = useMemo(
    () =>
      questions.map((question, index) => ({
        id: question.id,
        active: index === currentIndex,
      })),
    [currentIndex, questions],
  );

  const goNext = useCallback(() => {
    if (!started) {
      setStarted(true);
      return;
    }

    setCurrentIndex((value) => Math.min(value + 1, questions.length - 1));
  }, [questions.length, started]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((value) => Math.max(value - 1, 0));
  }, []);

  useEffect(() => {
    async function loadSelectedQuestions() {
      const password = localStorage.getItem(ADMIN_KEY) ?? "";

      if (!password) {
        setLoading(false);
        setError("Abra esta tela a partir da área administrativa.");
        return;
      }

      const response = await fetch("/api/questions?selected=true", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));

      setLoading(false);

      if (!response.ok) {
        setError(result.error ?? "Não foi possível carregar a apresentação.");
        return;
      }

      setQuestions(result.questions ?? []);
    }

    void loadSelectedQuestions();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrevious]);

  if (loading) {
    return (
      <DecorativeStage>
        <section className="grid min-h-dvh place-items-center px-6 text-center">
          <div>
            <CelebraLogo />
            <p className="soft-title mt-8 text-3xl">
              Carregando...
            </p>
          </div>
        </section>
      </DecorativeStage>
    );
  }

  if (error || !hasQuestions) {
    return (
      <DecorativeStage>
        <section className="grid min-h-dvh place-items-center px-6 text-center">
          <div className="glass-panel max-w-xl rounded-2xl p-8">
            <CelebraLogo compact />
            <p className="soft-title mt-6 text-3xl">
              {error || "Nenhuma pergunta selecionada."}
            </p>
          </div>
        </section>
      </DecorativeStage>
    );
  }

  if (!started) {
    return (
      <DecorativeStage>
        <section
          onClick={() => setStarted(true)}
          className="grid min-h-dvh cursor-pointer place-items-center px-6 text-center"
        >
          <div>
            <CelebraLogo />
            <div className="mt-10 grid place-items-center">
              <div className="glass-card grid size-16 place-items-center rounded-full">
                <span className="text-3xl font-semibold text-slate-700">?</span>
              </div>
            </div>
            <h1 className="soft-title mt-8 text-4xl uppercase">
              Respondendo às perguntas...
            </h1>
            <p className="muted-copy mt-4 text-xl font-medium">
              Aguarde, em instantes começaremos.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <span className="size-4 rounded-full bg-pink-500" />
              <span className="size-4 rounded-full bg-yellow-300" />
              <span className="size-4 rounded-full bg-sky-500" />
            </div>
          </div>
        </section>
      </DecorativeStage>
    );
  }

  return (
    <DecorativeStage>
      <section className="grid min-h-dvh grid-cols-[88px_1fr_88px] items-center gap-3 px-3 py-8 sm:grid-cols-[140px_1fr_140px] sm:px-8">
        <button
          onClick={goPrevious}
          disabled={currentIndex === 0}
          className="liquid-button mx-auto grid size-16 place-items-center rounded-full text-white transition disabled:opacity-20 sm:size-20"
          aria-label="Pergunta anterior"
        >
          <ArrowLeft size={36} />
        </button>

        <article className="glass-panel mx-auto w-full max-w-4xl rounded-2xl px-6 py-8 text-center sm:px-12 sm:py-12">
          {currentQuestion.name ? (
            <div className="mx-auto mb-6 max-w-sm rounded-xl bg-yellow-300/80 px-6 py-2 text-base font-semibold uppercase text-slate-800">
              {currentQuestion.name}
            </div>
          ) : null}
          <h1
            className={`text-balance break-words font-semibold leading-tight text-slate-800 ${questionTextSize}`}
          >
            {currentQuestion.question}
          </h1>
        </article>

        <button
          onClick={goNext}
          disabled={currentIndex === questions.length - 1}
          className="liquid-button mx-auto grid size-16 place-items-center rounded-full text-white transition disabled:opacity-20 sm:size-20"
          aria-label="Próxima pergunta"
        >
          <ArrowRight size={36} />
        </button>

        <div className="col-span-3 flex justify-center gap-3">
          {progress.map((item) => (
            <span
              key={item.id}
              className={`size-3 rounded-full ${
                item.active ? "bg-pink-500" : "bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>
    </DecorativeStage>
  );
}
