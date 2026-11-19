
import { db } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Thanks({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  noStore();

  const id = searchParams.id;

  if (!id) {
    return (
      <main className="shell">
        <section className="card" style={{ textAlign: "center", marginTop: 70 }}>
          <div style={{ fontSize: 44 }}>✓</div>
          <h1>Jawaban berhasil dikirim</h1>
          <p className="muted">
            Terima kasih telah menyelesaikan assessment.
            Jawabanmu telah tercatat.
          </p>
          <a className="btn" href="/" style={{ display: "inline-block", marginTop: 12 }}>
            Kembali ke halaman utama
          </a>
        </section>
      </main>
    );
  }

  const { data: submission, error } = await db()
    .from("submissions")
    .select("id,name,submitted_at,score,correct_count,graded_count,feedback,answers")
    .eq("id", id)
    .single();

  if (error || !submission) {
    return (
      <main className="shell">
        <section className="card">
          <h1>Hasil ujian tidak ditemukan</h1>
          <p className="muted">
            Silakan hubungi administrator.
          </p>
        </section>
      </main>
    );
  }

  const feedback = Array.isArray(submission.feedback)
    ? submission.feedback
    : [];

  const wrongCount =
    (submission.graded_count || 0) -
    (submission.correct_count || 0);

  return (
    <main className="shell">
      <header className="top">
        <div className="brand">ASSESSMENT PORTAL</div>
        <span className="pill">HASIL UJIAN</span>
      </header>

      <section className="hero">
        <div className="eyebrow">ASSESSMENT SELESAI</div>
        <h1>Hasil Ujian</h1>
        <p>
          Selamat, {submission.name}. Jawabanmu berhasil disimpan.
        </p>
      </section>

      <section className="card">
        <div className="muted small">NILAI AKHIR</div>
        <div style={{ fontSize: 52, fontWeight: 800, margin: "12px 0" }}>
          {submission.score !== null
            ? Number(submission.score).toFixed(2)
            : "—"}
        </div>

        <p className="muted small">
          Nilai dihitung dari soal pilihan ganda.
        </p>

        <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="pill">
            Benar: {submission.correct_count || 0}
          </div>
          <div className="pill">
            Salah: {wrongCount}
          </div>
          <div className="pill">
            Total PG: {submission.graded_count || 0}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Pembahasan Jawaban</h2>
        <p className="muted small">
          Berikut hasil pemeriksaan jawaban pilihan gandamu.
        </p>

        {feedback.length === 0 && (
          <p className="muted">
            Tidak ada soal pilihan ganda untuk dinilai.
          </p>
        )}

        {feedback.map((item: any, index: number) => (
          <div className="q" key={item.question_id}>
            <div className="row between">
              <span className="pill">SOAL {index + 1}</span>
              <strong style={{ color: item.is_correct ? "green" : "red" }}>
                {item.is_correct ? "BENAR" : "SALAH"}
              </strong>
            </div>

            <h3 style={{ marginTop: 14 }}>{item.prompt}</h3>

            <p>
              <strong>Jawabanmu:</strong>{" "}
              {item.selected_answer || "Tidak dijawab"}
            </p>

            {!item.is_correct && (
              <p>
                <strong>Jawaban yang benar:</strong>{" "}
                {item.correct_answer || "Belum ditentukan"}
              </p>
            )}

            <div className="notice">
              <strong>Penjelasan:</strong>
              <p style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                {item.explanation || "Belum ada penjelasan."}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Penilaian Esai</h2>
        <p className="muted">
          Jawaban esai tidak termasuk dalam nilai otomatis.
          Admin akan melakukan pemeriksaan dan penilaian secara manual.
        </p>
      </section>

      <section className="card" style={{ textAlign: "center" }}>
        <h2>Terima Kasih!</h2>
        <p className="muted">
          Jawabanmu telah tercatat dalam sistem assessment.
        </p>
        <a className="btn" href="/" style={{ display: "inline-block", marginTop: 12 }}>
          Kembali ke halaman utama
        </a>
      </section>
    </main>
  );
}