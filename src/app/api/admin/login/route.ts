import {NextRequest,NextResponse} from "next/server";
import {createAdminSession} from "@/lib/auth";
export async function POST(req:NextRequest){const form=await req.formData();const password=String(form.get("password")||"");if(!process.env.ADMIN_PASSWORD||password!==process.env.ADMIN_PASSWORD)return NextResponse.redirect(new URL("/admin/login?error=1",req.url));await createAdminSession();return NextResponse.redirect(new URL("/admin",req.url));}
