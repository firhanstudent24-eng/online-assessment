
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="shell">
      <header className="top">
        <div className="brand">ASSESSMENT CONTROL</div>
        <form action="/api/admin/logout" method="post">
          <button className="btn secondary">Keluar</button>
        </form>
      </header>

      <nav className="adminnav">
        <Link href="/admin">Ringkasan</Link>
        <Link href="/admin/questions">Kelola Soal</Link>
        <Link href="/admin/results">Hasil Peserta</Link>
        <Link href="/admin/settings">Pengaturan</Link>
      </nav>

      {children}
    </main>
  );
}
