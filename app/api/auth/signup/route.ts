import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: unknown; password?: unknown; isAdult?: unknown }
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username) || password.length < 8 || body.isAdult !== true) {
      return NextResponse.json({ error: "invalid_details" }, { status: 400 })
    }
    const supabase = adminClient()
    if (!supabase) return NextResponse.json({ error: "service_unavailable" }, { status: 503 })
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${username}@auth.loveme.app`,
      password,
      email_confirm: true,
      user_metadata: { username, display_name: username, avatar_emoji: "❤️", is_adult: true },
    })
    if (error) {
      if (error.message.toLowerCase().includes("already") || error.status === 422) return NextResponse.json({ error: "account_exists" }, { status: 409 })
      console.error("[v0] signup service error", error)
      return NextResponse.json({ error: "signup_failed" }, { status: 500 })
    }
    return NextResponse.json({ userId: data.user?.id }, { status: 201 })
  } catch (error) {
    console.error("[v0] signup request error", error)
    return NextResponse.json({ error: "signup_failed" }, { status: 500 })
  }
}
