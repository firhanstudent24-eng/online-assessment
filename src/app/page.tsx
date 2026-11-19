import { db } from "@/lib/supabase";
export const dynamic="force-dynamic";
export default async function Home(){
 let title="Online Assessment", description="Silakan isi identitas dan kerjakan seluruh pertanyaan dengan teliti.";
 try { const {data}=await db().from("settings").select("title,description").eq("id",1).maybeSingle(); if(data){title=data.title;description=data.description;} } catch {}
 return <main className="shell"><header className="top"><div className="brand">ASSESSMENT PORTAL</div><span className="pill">PUBLIC TEST</span></header><section className="hero"><div className="eyebrow">ONLINE ASSESSMENT</div><h1>{title}</h1><p>{description}</p></section><section className="card"><h2>Mulai pengerjaan</h2><p className="muted">Masukkan nama lengkap untuk memulai tes. Jawaban akan dikirim setelah kamu menekan tombol submit.</p><form action="/test" method="get"><div className="field"><label htmlFor="name">Nama lengkap</label><input className="input" id="name" name="name" required maxLength={120} placeholder="Masukkan nama lengkap"/></div><button className="btn">Mulai tes →</button></form></section><p className="muted small" style={{textAlign:"center",marginTop:24}}>Pastikan seluruh jawaban sudah diperiksa sebelum dikirim.</p></main>
}
