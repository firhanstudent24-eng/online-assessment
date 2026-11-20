
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const b = await req.json();

  if (
    !b.prompt?.trim() ||
    !["essay", "multiple_choice"].includes(b.type)
  ) {
    return NextResponse.json(
      { error: "Pertanyaan dan jenis soal wajib diisi." },
      { status: 400 }
    );
  }

  if (b.type === "multiple_choice") {
    if (!Array.isArray(b.options) || b.options.length < 2) {
      return NextResponse.json(
        { error: "Pilihan ganda minimal memiliki dua opsi." },
        { status: 400 }
      );
    }

    if (!b.correct_answer || !b.options.includes(b.correct_answer)) {
      return NextResponse.json(
        { error: "Jawaban yang benar wajib ditentukan." },
        { status: 400 }
      );
    }

    if (!b.explanation?.trim()) {
      return NextResponse.json(
        { error: "Penjelasan jawaban wajib diisi." },
        { status: 400 }
      );
    }
  }

  const { error } = await db()
    .from("questions")
    .insert({
      prompt: b.prompt.trim(),
      type: b.type,
      options: b.type === "essay" ? [] : b.options,
      correct_answer:
        b.type === "essay" ? null : b.correct_answer,
      explanation:
        b.type === "essay" ? null : b.explanation.trim(),
      position: b.position || 1,
      active: !!b.active,
      required: !!b.required,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const b = await req.json();

  if (!b.id || !b.prompt?.trim()) {
    return NextResponse.json(
      { error: "Data soal tidak lengkap." },
      { status: 400 }
    );
  }

  if (!["essay", "multiple_choice"].includes(b.type)) {
    return NextResponse.json(
      { error: "Jenis soal tidak valid." },
      { status: 400 }
    );
  }

  if (b.type === "multiple_choice") {
    if (!Array.isArray(b.options) || b.options.length < 2) {
      return NextResponse.json(
        { error: "Pilihan ganda minimal memiliki dua opsi." },
        { status: 400 }
      );
    }

    if (!b.correct_answer || !b.options.includes(b.correct_answer)) {
      return NextResponse.json(
        { error: "Jawaban yang benar wajib ditentukan." },
        { status: 400 }
      );
    }

    if (!b.explanation?.trim()) {
      return NextResponse.json(
        { error: "Penjelasan jawaban wajib diisi." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await db()
    .from("questions")
    .update({
      prompt: b.prompt.trim(),
      type: b.type,
      options: b.type === "essay" ? [] : b.options,
      correct_answer:
        b.type === "essay" ? null : b.correct_answer,
      explanation:
        b.type === "essay" ? null : b.explanation.trim(),
      position: b.position,
      active: !!b.active,
      required: !!b.required,
    })
    .eq("id", b.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        error: "Soal tidak ditemukan. ID soal tidak cocok dengan database."
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID soal wajib diisi." },
      { status: 400 }
    );
  }

  const { error } = await db()
    .from("questions")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}