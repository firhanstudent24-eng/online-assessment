
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 120);
    const answers = body.answers;

    if (
      !name ||
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return NextResponse.json(
        { error: "Data peserta tidak valid." },
        { status: 400 }
      );
    }

    const client = db();

    const { data: questions, error: qerr } = await client
      .from("questions")
      .select(
        "id,prompt,type,options,required,correct_answer,explanation"
      )
      .eq("active", true)
      .order("position");

    if (qerr || !questions?.length) {
      return NextResponse.json(
        { error: "Soal belum tersedia." },
        { status: 400 }
      );
    }

    const allowed = new Set(questions.map((q) => q.id));
    const cleanAnswers: Record<string, string> = {};

    for (const key of Object.keys(answers)) {
      if (!allowed.has(key)) continue;

      const value = answers[key];

      if (typeof value !== "string") {
        return NextResponse.json(
          { error: "Format jawaban tidak valid." },
          { status: 400 }
        );
      }

      cleanAnswers[key] = value;
    }

    for (const q of questions) {
      const val = cleanAnswers[q.id];

      if (q.required && (!val || !val.trim())) {
        return NextResponse.json(
          { error: "Ada pertanyaan wajib yang belum dijawab." },
          { status: 400 }
        );
      }

      if (
        val &&
        q.type === "multiple_choice" &&
        (!Array.isArray(q.options) || !q.options.includes(val))
      ) {
        return NextResponse.json(
          { error: "Pilihan jawaban tidak valid." },
          { status: 400 }
        );
      }

      if (val && val.length > 12000) {
        return NextResponse.json(
          { error: "Jawaban terlalu panjang." },
          { status: 400 }
        );
      }
    }

    // Menghitung nilai pilihan ganda secara otomatis
    const multipleChoiceQuestions = questions.filter(
      (q) => q.type === "multiple_choice"
    );

    const gradedCount = multipleChoiceQuestions.length;

    const feedback = multipleChoiceQuestions.map((q) => {
      const selectedAnswer = cleanAnswers[q.id] || "";
      const correctAnswer = q.correct_answer || "";

      const isCorrect =
        selectedAnswer !== "" &&
        selectedAnswer === correctAnswer;

      return {
        question_id: q.id,
        prompt: q.prompt,
        selected_answer: selectedAnswer,
        correct_answer: correctAnswer,
        explanation: q.explanation || "",
        is_correct: isCorrect,
      };
    });

    const correctCount = feedback.filter(
      (item) => item.is_correct
    ).length;

    const score =
      gradedCount > 0
        ? Number(((correctCount / gradedCount) * 100).toFixed(2))
        : null;

    // Menyimpan jawaban dan hasil penilaian
    const { data: submission, error } = await client
      .from("submissions")
      .insert({
        name,
        answers: cleanAnswers,
        score,
        correct_count: correctCount,
        graded_count: gradedCount,
        feedback,
      })
      .select("id,submitted_at")
      .single();

    if (error) throw error;

    // Menyiapkan email administrator
    const rows = questions
      .map(
        (q, i) =>
          `<h3>${i + 1}. ${escapeHtml(q.prompt)}</h3>
          <p style="white-space:pre-wrap">${escapeHtml(
            String(cleanAnswers[q.id] || "Tidak dijawab")
          )}</p>`
      )
      .join("");

    let emailStatus = "not_configured";

    if (
      process.env.RESEND_API_KEY &&
      process.env.RESULT_EMAIL &&
      process.env.EMAIL_FROM
    ) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const sent = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.RESULT_EMAIL,
        subject: `Hasil assessment baru: ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif">
            <h2>Submission assessment baru</h2>
            <p><b>Nama peserta:</b> ${escapeHtml(name)}</p>
            <p><b>Waktu:</b> ${new Date(
              submission.submitted_at
            ).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}</p>
            <p><b>Nilai otomatis:</b> ${score ?? "Tidak tersedia"}</p>
            <p><b>Jawaban benar:</b> ${correctCount} dari ${gradedCount}</p>
            <hr/>
            ${rows}
            <hr/>
            <p>ID submission: ${submission.id}</p>
          </div>
        `,
      });

      if (sent.error) {
        console.error("Resend error", sent.error);
        emailStatus = "failed";
      } else {
        emailStatus = "sent";
      }
    }

    return NextResponse.json({
      ok: true,
      id: submission.id,
      score,
      correctCount,
      gradedCount,
      emailStatus,
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      {
        error:
          "Terjadi kendala saat menyimpan jawaban. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]!
  );
}