
import { db } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResultDetail({
  params,
}: {
  params: { id: string };
}) {
  noStore();

  const client = db();

  const { data: s, error } = await client
    .from("submissions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !s) {
    return (
      <section className="card">
        <a href="/admin/results" className="muted small">
          ← Kembali ke hasil
        </a>
        <p>Submission tidak ditemukan.</p>
      </section>
    );
  }

  const { data: qs } = await client
    .from("questions")
    .select("id,prompt,type,options")
    .order("position");

  const feedback = Array.isArray(s.feedback) ? s.feedback : [];

  const feedbackById = new Map(
    feedback.map((item: any) => [item.question_id, item])
  );

  const correctCount = Number(s.correct_count || 0);
  const gradedCount = Number(s.graded_count || 0);
  const wrongCount = Math.max(gradedCount - correctCount, 0);

  return (
    <section className="card">
      <a href="/admin/results" className="muted small">
        ← Kembali ke hasil
      </a>

      <h2 style={{ marginTop: 16 }}>{s.name}</h2>

      <p className="muted small">
        Dikirim:{" "}
        {new Date(s.submitted_at).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        })}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          margin: "20px 0",
        }}
      >
        <div className="q">
          <p className="muted small">Nilai pilihan ganda</p>
          <h2>
            {s.score !== null && s.score !== undefined
              ? Number(s.score).toFixed(2)
              : "Belum dinilai"}
          </h2>
        </div>

        <div className="q">
          <p className="muted small">Jawaban benar</p>
          <h2>{correctCount} / {gradedCount}</h2>
        </div>

        <div className="q">
          <p className="muted small">Jawaban salah</p>
          <h2>{wrongCount}</h2>
        </div>
      </div>

      <p className="muted small">
        Nilai hanya dihitung dari soal pilihan ganda.
        Jawaban esai tetap memerlukan pemeriksaan manual.
      </p>

      <h3 style={{ marginTop: 24 }}>Rincian Jawaban</h3>

      {qs?.map((q: any, i: number) => {
        const answer = s.answers?.[q.id];
        const isEssay = q.type === "essay";
        const result: any = feedbackById.get(q.id);

        return (
          <div className="q" key={q.id} style={{ marginTop: 16 }}>
            <span className="pill">
              SOAL {i + 1} · {isEssay ? "ESAI" : "PILIHAN GANDA"}
            </span>

            <h3 style={{ marginTop: 12 }}>{q.prompt}</h3>

            <p className="muted small">Jawaban peserta:</p>

            <p style={{ whiteSpace: "pre-wrap" }}>
              {answer ? (
                answer
              ) : (
                <em className="muted">Tidak dijawab</em>
              )}
            </p>

            {!isEssay && result && (
              <div style={{ marginTop: 12 }}>
                <p
                  style={{
                    fontWeight: 700,
                    color: result.is_correct ? "green" : "red",
                  }}
                >
                  {result.is_correct ? "✓ BENAR" : "✗ SALAH"}
                </p>

                {!result.is_correct && (
                  <p style={{ marginTop: 8 }}>
                    <strong>Kunci jawaban:</strong>{" "}
                    {result.correct_answer}
                  </p>
                )}

                {result.explanation && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Pembahasan:</strong>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {result.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {isEssay && (
              <p className="muted small" style={{ marginTop: 12 }}>
                Perlu diperiksa dan dinilai secara manual.
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}