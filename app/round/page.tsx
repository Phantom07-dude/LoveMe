"use client"

import { FormEvent, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { createQuestionRound, getQuestionRoundState, revealQuestionRound, saveQuestionAnswer } from "@/lib/loveme/data"

type Question = { id: string; prompt: string; category: string }
type User = { id: string }

export default function RoundPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [connectionId, setConnectionId] = useState("")
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null)
  const [status, setStatus] = useState("Loading your shared round…")
  const [saving, setSaving] = useState(false)

  async function loadRound(currentUser: User) {
    if (!supabase) return
    const { data: connection } = await supabase.from("connections").select("id").or(`user_one.eq.${currentUser.id},user_two.eq.${currentUser.id}`).eq("status", "active").limit(1).maybeSingle()
    if (!connection) { setStatus("Connect with your person before starting a shared round."); return }
    setConnectionId(connection.id)
    const { data: questions } = await supabase.from("questions").select("id,prompt,category").eq("is_adult", false).in("type", ["KNOW_ME", "DEEP"]).limit(1)
    const next = questions?.[0] as Question | undefined
    if (!next) { setStatus("No shared questions are available yet."); return }
    setQuestion(next)
    const state = await getQuestionRoundState(connection.id, next.id)
    const mine = state.answers.find((item) => item.user_id === currentUser.id)
    const other = state.answers.find((item) => item.user_id !== currentUser.id)
    setAnswer(mine?.answer ?? "")
    setPartnerAnswer(state.round?.status === "revealed" ? other?.answer ?? null : null)
    setStatus(state.round?.status === "revealed" ? "Both answers are revealed." : other ? "Your person has answered. Save yours to reveal the round." : "Answer privately. Your person will not see it until both of you answer.")
  }

  useEffect(() => {
    if (!supabase) { setStatus("LoveMe is not connected."); return }
    let active = true
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => { if (active && data.user) { const current = { id: data.user.id }; setUser(current); void loadRound(current) } else if (active) setStatus("Log in to open a shared round.") })
    return () => { active = false }
  }, [supabase])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !user || !question || !connectionId || !answer.trim()) return
    setSaving(true)
    try {
      await saveQuestionAnswer({ connectionId, questionId: question.id, userId: user.id, answer })
      const existing = await supabase.from("question_rounds").select("id").eq("connection_id", connectionId).eq("question_id", question.id).eq("status", "open").maybeSingle()
      const roundId = existing.data?.id ?? await createQuestionRound({ connectionId, questionId: question.id, userId: user.id })
      await revealQuestionRound(roundId)
      await loadRound(user)
    } catch { setStatus("Your answer could not be saved. Please try again.") } finally { setSaving(false) }
  }

  return <main className="min-h-screen px-5 py-8"><div className="mx-auto max-w-xl"><a href="/" className="text-sm text-primary">Back to LoveMe</a><section className="mt-12 rounded-[2rem] border border-border bg-card p-7"><p className="text-sm uppercase tracking-widest text-primary">Shared round</p><h1 className="mt-3 font-serif text-4xl">{question?.prompt ?? "Your person is waiting."}</h1><p className="mt-4 leading-7 text-muted-foreground">{status}</p>{user && question && <form onSubmit={submit} className="mt-7 flex flex-col gap-4"><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={6} required placeholder="Write your honest answer…" className="rounded-2xl border border-input bg-background px-4 py-3"/><button disabled={saving} className="min-h-12 rounded-xl bg-primary font-semibold text-primary-foreground">{saving ? "Saving…" : "Save private answer"}</button></form>}{partnerAnswer && <div className="mt-6 rounded-2xl border border-primary/30 bg-background p-5"><p className="text-xs uppercase tracking-widest text-primary">Their answer</p><p className="mt-3 whitespace-pre-wrap leading-7">{partnerAnswer}</p></div>}</section></div></main>
}
