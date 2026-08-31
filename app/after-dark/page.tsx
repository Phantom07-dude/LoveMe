"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { giveConsent, hasMutualAfterDarkConsent } from "@/lib/loveme/data"

type Profile = { is_adult: boolean }

export default function AfterDarkPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState("")
  const [connectionId, setConnectionId] = useState("")
  const [allowed, setAllowed] = useState(false)
  const [adult, setAdult] = useState(false)
  const [consented, setConsented] = useState(false)
  const [status, setStatus] = useState("Checking private access…")

  async function load(id: string) {
    if (!supabase) return
    const [{ data: profile }, { data: connection }] = await Promise.all([supabase.from("profiles").select("is_adult").eq("id", id).maybeSingle(), supabase.from("connections").select("id,user_two").or(`user_one.eq.${id},user_two.eq.${id}`).eq("status", "active").limit(1).maybeSingle()])
    const isAdult = Boolean((profile as Profile | null)?.is_adult)
    setAdult(isAdult)
    if (!connection?.id || !connection.user_two || !isAdult) { setStatus("After Dark requires an active connection and adult profiles."); return }
    setConnectionId(connection.id)
    const mutual = await hasMutualAfterDarkConsent(connection.id)
    setAllowed(mutual)
    setStatus(mutual ? "Both people opted in. This room is private to your connection." : "Both people must explicitly opt in before anything intimate is shown.")
  }

  useEffect(() => { if (!supabase) { setStatus("LoveMe is not connected."); return } supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => { if (data.user) { setUserId(data.user.id); void load(data.user.id) } else setStatus("Log in to open After Dark.") }) }, [supabase])
  async function optIn() { if (!userId || !connectionId || !adult) return; setConsented(true); try { await giveConsent(connectionId, userId); await load(userId) } catch { setConsented(false); setStatus("Consent could not be saved.") } }

  return <main className="min-h-screen px-5 py-8"><div className="mx-auto max-w-xl"><a href="/" className="text-sm text-primary">Back to LoveMe</a><section className="mt-12 rounded-[2rem] border border-border bg-card p-7"><p className="text-sm uppercase tracking-widest text-primary">Adults only</p><h1 className="mt-3 font-serif text-5xl">After Dark</h1><p className="mt-4 leading-7 text-muted-foreground">{status}</p>{!allowed && adult && connectionId && <button onClick={() => void optIn()} disabled={consented} className="mt-7 min-h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">{consented ? "Saving consent…" : "Opt in privately"}</button>}{allowed && <div className="mt-7 rounded-2xl border border-primary/30 bg-background p-5"><p className="font-semibold">Mutual consent confirmed.</p><p className="mt-2 leading-7 text-muted-foreground">Talk openly about boundaries, desire, and what helps you both feel safe. No intimate prompt is returned before mutual consent.</p></div>}</section></div></main>
}
