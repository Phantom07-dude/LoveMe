"use client"

import { FormEvent, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { saveDuelMove, startDuel } from "@/lib/loveme/data"

type User = { id: string }
type Connection = { id: string }
type Session = { id: string; status: string; current_round: number }

const prompts = ["Who is more likely to plan the perfect surprise?", "Who would get lost even with Google Maps?", "Who is more likely to make a playlist for a very specific mood?"]

export default function DuelPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [choice, setChoice] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(true)
  const [moves, setMoves] = useState<Array<{ user_id: string; move_type: string; payload: { choice?: string } }>>([])

  useEffect(() => {
    if (!supabase) return
    let active = true
    async function load() {
      const auth = await supabase.auth.getUser()
      if (!auth.data.user || !active) { setBusy(false); return }
      setUser({ id: auth.data.user.id })
      const { data } = await supabase.from("connections").select("id").or(`user_one.eq.${auth.data.user.id},user_two.eq.${auth.data.user.id}`).eq("status", "active").limit(1).maybeSingle()
      if (data && active) {
        setConnection(data)
        const existing = await supabase.from("duel_sessions").select("id,status,current_round").eq("connection_id", data.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle()
        if (active) { setSession(existing.data as Session | null); if (existing.data) { const moveRows = await supabase.from("duel_moves").select("user_id,move_type,payload").eq("session_id", existing.data.id); if (active) setMoves((moveRows.data ?? []) as typeof moves) } }
      }
      if (active) setBusy(false)
    }
    void load()
    return () => { active = false }
  }, [supabase])

  async function begin() {
    if (!connection || !user) return
    setBusy(true); setNotice("")
    try { const id = await startDuel(connection.id, user.id); setSession({ id, status: "active", current_round: 1 }); setNotice("Duel started. Choose privately.") }
    catch { setNotice("Could not start a duel in this connection.") }
    finally { setBusy(false) }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!session || !user || !choice) return
    setBusy(true); setNotice("")
    try { const round = session.current_round; await saveDuelMove(session.id, user.id, `round_${round}`, { choice }); const nextMoves = [...moves.filter((move) => move.move_type !== `round_${round}`), { user_id: user.id, move_type: `round_${round}`, payload: { choice } }]; setMoves(nextMoves); if (nextMoves.filter((move) => move.move_type === `round_${round}`).length >= 2 && round < prompts.length) { await supabase.from("duel_sessions").update({ current_round: round + 1, updated_at: new Date().toISOString() }).eq("id", session.id); setSession({ ...session, current_round: round + 1 }); setChoice(""); setNotice("Round complete. The next prompt is ready.") } else if (round >= prompts.length) { await supabase.from("duel_sessions").update({ status: "complete", updated_at: new Date().toISOString() }).eq("id", session.id); setSession({ ...session, status: "complete" }); setNotice("Duel complete. Your choices are safely recorded.") } else setNotice("Your move is locked. Waiting for your person.") }
    catch { setNotice("Your move could not be saved.") }
    finally { setBusy(false) }
  }

  if (busy && !user) return <main className="grid min-h-screen place-items-center text-muted-foreground">Opening Duel…</main>
  return <main className="min-h-screen px-5 py-8"><div className="mx-auto max-w-xl"><a href="/" className="text-sm text-primary">← Back to LoveMe</a><section className="mt-16"><p className="text-sm uppercase tracking-widest text-primary">Private mini-game</p><h1 className="mt-3 font-serif text-5xl">Duel</h1>{!connection ? <p className="mt-5 text-muted-foreground">Duel unlocks after you connect with your person.</p> : !session ? <><p className="mt-5 text-muted-foreground">Pick a side without seeing your person’s move. Results reveal together.</p><button onClick={() => void begin()} disabled={busy} className="mt-8 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Start a duel</button></> : <form onSubmit={submit} className="mt-8 rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Round {session.current_round} of {prompts.length}</p><h2 className="mt-4 font-serif text-3xl">{session.status === "complete" ? "Duel complete" : prompts[session.current_round - 1]}</h2>{session.status === "complete" && <p className="mt-4 leading-7 text-muted-foreground">All rounds are recorded. Compare your answers together in your private space.</p>}<div className="mt-6 grid gap-3"><button type="button" onClick={() => setChoice("me")} className={`rounded-xl border p-4 text-left ${choice === "me" ? "border-primary bg-primary/10" : "border-border"}`}>Me</button><button type="button" onClick={() => setChoice("them")} className={`rounded-xl border p-4 text-left ${choice === "them" ? "border-primary bg-primary/10" : "border-border"}`}>My person</button></div><button disabled={!choice || busy} className="mt-6 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Lock my move</button></form>}{notice && <p role="status" className="mt-5 text-sm text-muted-foreground">{notice}</p>}</section></div></main>
}
