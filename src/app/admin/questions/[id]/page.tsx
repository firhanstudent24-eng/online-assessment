import {db} from "@/lib/supabase";
import QuestionEditor from "../question-editor";
export const dynamic="force-dynamic";
export default async function EditQuestion({params}:{params:{id:string}}){const {data}=await db().from("questions").select("*").eq("id",params.id).single();if(!data)return <div className="card">Soal tidak ditemukan.</div>;return <section className="card"><h2>Edit soal</h2><QuestionEditor question={data}/></section>}
