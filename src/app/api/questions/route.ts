import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createSupabaseAdmin } from "@/lib/supabase";
import type { QuestionPatch } from "@/lib/types";

export const dynamic = "force-dynamic";

type IncomingPatch = {
  id: unknown;
  selected: unknown;
  position: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getSupabase() {
  try {
    return createSupabaseAdmin();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return jsonError("Senha administrativa inválida.", 401);
  }

  const supabase = getSupabase();

  if (!supabase) {
    return jsonError("Configure as variáveis do Supabase.", 500);
  }

  const url = new URL(request.url);
  const selectedOnly = url.searchParams.get("selected") === "true";

  let query = supabase.from("questions").select("*");

  if (selectedOnly) {
    query = query
      .eq("selected", true)
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ questions: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = getSupabase();

  if (!supabase) {
    return jsonError("Configure as variáveis do Supabase.", 500);
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (question.length < 3) {
    return jsonError("Escreva uma pergunta antes de enviar.");
  }

  if (question.length > 600) {
    return jsonError("A pergunta deve ter no máximo 600 caracteres.");
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      name: name || null,
      question,
    })
    .select("*")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ question: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return jsonError("Senha administrativa inválida.", 401);
  }

  const supabase = getSupabase();

  if (!supabase) {
    return jsonError("Configure as variáveis do Supabase.", 500);
  }

  const body = await request.json().catch(() => null);
  const updates: IncomingPatch[] = Array.isArray(body?.updates)
    ? body.updates
    : [];

  if (!updates.length) {
    return jsonError("Nenhuma pergunta para atualizar.");
  }

  const sanitized: QuestionPatch[] = updates.map((item) => ({
    id: String(item.id),
    selected: Boolean(item.selected),
    position:
      typeof item.position === "number" && Number.isFinite(item.position)
        ? item.position
        : null,
  }));

  for (const update of sanitized) {
    const { error } = await supabase
      .from("questions")
      .update({
        selected: update.selected,
        position: update.selected ? update.position : null,
      })
      .eq("id", update.id);

    if (error) {
      return jsonError(error.message, 500);
    }
  }

  return NextResponse.json({ ok: true });
}
