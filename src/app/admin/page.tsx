
import { db } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  noStore();

  const client = db();

  const [questionsResult, submissionsResult] = await Promise.all([
    client.from("questions").select("*", { count: "exact", head: true }),
    client.from("submissions").select("*", { count: "exact", head: true }),
  ]);

  return (
    <section>
      <div className="hero">
        <div className="eyebrow">ADMIN DASHBOARD</div>
        <h1>Kelola assessment kamu</h1>
        <p>Buat pertanyaan, bagikan link publik, dan periksa jawaban peserta dari satu tempat.</p>
      </div>

      {(questionsResult.error || submissionsResult.error) && (
        <div className="card" style={{ color: "red", marginBottom: 18 }}>
          <h3>Database Error</h3>
          <p>Soal: {questionsResult.error?.message || "Tidak ada error"}</p>
          <p>Submission: {submissionsResult.error?.message || "Tidak ada error"}</p>
        </div>
      )}

      <div className="row">
        <div className="card" style={{ flex: 1 }}>
          <div className="muted small">TOTAL SOAL</div>
          <h1>{questionsResult.count ?? 0}</h1>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="muted small">TOTAL SUBMISSION</div>
          <h1>{submissionsResult.count ?? 0}</h1>
        </div>
      </div>
    </section>
  );
}
