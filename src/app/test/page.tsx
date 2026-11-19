import { db } from "@/lib/supabase";
import TestForm from "./test-form";
export const dynamic="force-dynamic";
export default async function TestPage({searchParams}:{searchParams:{name?:string}}){
 const name=(searchParams.name||"").trim().slice(0,120);
 const {data:questions,error}=await db().from("questions").select("id,prompt,type,options,position,required").eq("active",true).order("position");
 if(error) return <main className="shell"><div className="card">Tes belum dapat dimuat. Silakan coba kembali nanti.</div></main>;
 return <main className="shell"><header className="top"><div className="brand">ASSESSMENT PORTAL</div><span className="pill">PESERTA</span></header><section className="hero"><div className="eyebrow">LEMBAR PENGERJAAN</div><h1>Selamat mengerjakan, {name||"Peserta"}</h1><p>Jawablah setiap pertanyaan sesuai pemahamanmu. Jawaban esai akan dinilai secara manual oleh administrator.</p></section>{!name?<div className="card">Nama peserta tidak ditemukan. <a href="/" style={{textDecoration:"underline"}}>Kembali</a></div>:questions?.length?<TestForm name={name} questions={questions}/>:<div className="card">Belum ada soal yang dipublikasikan. Silakan hubungi administrator.</div>}</main>
}
