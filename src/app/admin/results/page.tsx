
import { db } from "@/lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Results() {
  noStore();

  const { data, error } = await db()
    .from("submissions")
    .select("id,name,submitted_at,answers,score,correct_count,graded_count")
    .order("submitted_at", { ascending: false });

  if (error) {
    return (
      <section className="card">
        <h2>Hasil Peserta</h2>
        <p style={{ color: "red" }}>
          Gagal mengambil data: {error.message}
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Hasil Peserta</h2>

      <p className="muted small">
        Nilai pilihan ganda dihitung otomatis. Jawaban esai
        tetap memerlukan pemeriksaan manual.
      </p>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Waktu submit</th>
              <th>Jumlah jawaban</th>
              <th>Jawaban benar</th>
              <th>Nilai</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {data?.map((s: any) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  {new Date(s.submitted_at).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}
                </td>
                <td>{Object.keys(s.answers || {}).length}</td>
                <td>
                  {s.graded_count !== null &&
                  s.graded_count !== undefined
                    ? `${s.correct_count || 0} / ${s.graded_count}`
                    : "Belum dinilai"}
                </td>
                <td>
                  {s.score !== null && s.score !== undefined
                    ? Number(s.score).toFixed(2)
                    : "—"}
                </td>
                <td>
                  <a
                    href={`/admin/results/${s.id}`}
                    style={{ color: "#3157a4" }}
                  >
                    Periksa jawaban
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!data?.length && (
        <p className="muted">
          Belum ada peserta yang mengirim jawaban.
        </p>
      )}
    </section>
  );
}