"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send, UserRound } from "lucide-react";
import { CelebraLogo, DecorativeStage } from "@/components/Brand";

export default function PublicQuestionPage() {
  const [wantsName, setWantsName] = useState(true);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: wantsName ? name : "",
        question,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(result.error ?? "Não foi possível enviar agora.");
      return;
    }

    setStatus("sent");
    setQuestion("");
    setMessage("Pergunta enviada. Obrigado por participar!");
  }

  return (
    <DecorativeStage className="public-stage">
      <section className="mx-auto flex w-full max-w-[1060px] flex-col px-5 py-8 sm:px-8">
        <div className="flex flex-col items-center">
          <CelebraLogo />

          <div className="mt-5 text-center">
            <h1 className="soft-title text-4xl uppercase">
              Faça sua pergunta!
            </h1>
            <p className="muted-copy mt-2 text-base font-medium">
              Sua pergunta pode abençoar outras vidas.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel mt-6 w-full max-w-[860px] rounded-2xl p-6 sm:p-8"
          >
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase text-slate-700">
              <UserRound size={18} />
              Deseja se identificar?
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWantsName(true)}
                className={`h-12 rounded-xl text-sm font-semibold uppercase ${
                  wantsName
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                    : "glass-control text-slate-700 hover:border-pink-300"
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setWantsName(false)}
                className={`h-12 rounded-xl text-sm font-semibold uppercase ${
                  !wantsName
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                    : "glass-control text-slate-700 hover:border-pink-300"
                }`}
              >
                Não
              </button>
            </div>
          </div>

          <div
            aria-hidden={!wantsName}
            className={`reveal-field ${wantsName ? "is-open" : ""}`}
          >
            <div className="min-h-0 overflow-hidden">
              <label className="block pt-6">
                <span className="text-sm font-semibold uppercase text-slate-700">
                  Nome{" "}
                  <span className="font-semibold text-zinc-500">
                    (opcional)
                  </span>
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={!wantsName}
                  maxLength={80}
                  placeholder="Digite seu nome"
                  className="glass-control mt-2 h-12 w-full rounded-xl px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/15"
                />
              </label>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="flex items-center gap-2 text-sm font-semibold uppercase text-slate-700">
              <MessageCircle size={18} />
              Sua pergunta
            </span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              minLength={3}
              maxLength={600}
              required
              placeholder="Digite sua pergunta aqui..."
              className="glass-control mt-3 min-h-36 w-full resize-y rounded-xl p-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/15"
            />
          </label>

          {message ? (
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === "sending"}
            className="liquid-button mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold uppercase text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "sending" ? "Enviando..." : "Enviar pergunta"}
            <Send size={17} />
          </button>
          </form>
        </div>

        <footer className="mx-auto mt-6 w-full max-w-[860px] border-t border-white/45 pt-4 text-center">
          <p className="text-xs font-semibold uppercase text-slate-600/90">
            Celebra Teen 2026
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700/90">
            Meu Filho para Deus
          </p>
        </footer>
      </section>
    </DecorativeStage>
  );
}
