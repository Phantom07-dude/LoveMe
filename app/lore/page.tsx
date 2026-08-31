"use client"

import { FormEvent, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { addLoreEntry, saveReaction } from "@/lib/loveme/data"

type Entry = { id: string; title: string; body: string; created_at: string }

export default function LorePage() {
  const supabase = createClient()
  const [userId, setUserId] = useState("")
  const [connectionId, setConnectionId] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [status, setStatus] = useState("Loading your private memories…")

  async function load() {
    if (!supabase || !userId) return
    const { data: connection } = await supabase.from("connections").select("id").or(`user_one.eq.${userId},user_two.eq.${userId}`).eq("status", "active").limit(1).maybeSingle()
    if (!connection) { setStatus("Connect with your person to start your shared Lore."); return }
    setConnectionId(connection.id)
    const { data, error } = await supabase.from("lore_entries").select("id,title,body,created_at").eq("connection_id", connection.id).order("created_at", { ascending: false })
    if (error) { setStatus("Your memories could not be loaded."); return }
    setEntries((data ?? []) as Entry[])
    setStatus(data?.length ? "Your shared memories, kept private." : "Your Lore is empty. Save a moment you want to keep.")
  }

  useEffect(() => { if (!supabase) return; supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => { if (data.user) { setUserId(data.user.id) } else setStatus("Log in to open Lore.") }) }, [supabase])
  useEffect(() => { void load() }, [userId])

  async function save(event: FormEvent) { event.preventDefault(); if (!userId || !connectionId || !title.trim() || !body.trim()) return; setStatus("Saving memory…"); try { await addLoreEntry({ connectionId, userId, title, body }); setTitle(""); setBody(""); await load() } catch { setStatus("That memory could not be saved.") } }
  async function react(id: string) { try { await saveReaction({ entryId: id, userId, reaction: "heart" }); setStatus("Reaction saved privately.") } catch { setStatus("That reaction could not be saved.") } }

  return <main className="min-h-screen px-5 py-8"><div className="mx-auto max-w-xl"><a href="/" className="text-sm text-primary">Back to LoveMe</a><section className="mt-12"><p className="text-sm uppercase tracking-widest text-primary">Shared archive</p><h1 className="mt-3 font-serif text-5xl">Lore</h1><p className="mt-4 text-muted-foreground">{status}</p><form onSubmit={save} className="mt-8 rounded-2xl border border-border bg-card p-5"><input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Memory title" className="min-h-12 w-full rounded-xl border border-input bg-background px-4"/><textarea value={body} onChange={(event) => setBody(event.target.value)} required rows={5} placeholder="What happened?" className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3"/><button className="mt-3 min-h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Save to Lore</button></form><div className="mt-6 grid gap-3">{entries.map((entry) => <article key={entry.id} className="rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold">{entry.title}</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-muted-foreground">{entry.body}</p><button onClick={() => void react(entry.id)} className="mt-4 text-sm text-primary">React privately</button></article>)}</div></section></div></main>
}
