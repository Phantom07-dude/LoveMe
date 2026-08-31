"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = createClient()
  const [token, setToken] = useState("")
  const [status, setStatus] = useState("Checking invite…")
  const [user, setUser] = useState(false)
  useEffect(() => { params.then(({ token: value }) => setToken(value)); if (!supabase) { setStatus("LoveMe is not connected."); return } supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => { setUser(Boolean(data.user)); if (!data.user) setStatus("Log in or create your LoveMe account to accept this invite."); else setStatus("This invite is ready for you.") }) }, [supabase, params])
  async function accept() { if (!supabase || !token) return; setStatus("Joining your shared space…"); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) { setStatus("Please log in first, then open this invite again."); return } const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)); const hash = Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, "0")).join(""); const { error } = await supabase.rpc("accept_connection_invite", { invite_token_hash: hash, joining_user: auth.user.id }); setStatus(error ? "This invite is invalid, expired, or already used." : "Connected. Open your LoveMe home to begin."); if (!error) window.location.href = "/" }
  return <main className="grid min-h-screen place-items-center px-5"><section className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">♥</div><h1 className="mt-6 font-serif text-4xl">You&apos;ve been invited.</h1><p className="mt-3 leading-7 text-muted-foreground">LoveMe is a private space for exactly two people.</p><p className="mt-6 text-sm text-primary">{status}</p>{user && <button onClick={accept} className="mt-6 min-h-12 rounded-xl bg-primary px-6 font-semibold text-primary-foreground">Accept invite</button>}{!user && <a href="/" className="mt-6 inline-flex min-h-12 items-center rounded-xl border border-border px-6 font-semibold">Go to LoveMe</a>}</section></main>
}
