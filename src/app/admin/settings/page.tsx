import {db} from "@/lib/supabase";
import SettingsForm from "./settings-form";
export const dynamic="force-dynamic";
export default async function Settings(){const {data}=await db().from("settings").select("*").eq("id",1).maybeSingle();return <section className="card"><h2>Pengaturan tes</h2><SettingsForm initial={data}/></section>}
