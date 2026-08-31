"use client"

import { FormEvent, useEffect, useState } from "react"
import { authIdentifier, createClient } from "@/lib/supabase/client"

type User = { id: string; user_metadata?: { username?: string; display_name?: string; avatar_emoji?: string } }

const features = [
  ["Know Me", "Answer for each other, then reveal what was really said.", "brain"],
  ["More Likely", "Point at the person who would absolutely do it.", "eyes"],
  ["Lore", "Keep the tiny moments that only make sense to you two.", "book"],
  ["Deep Dive", "The questions that make a conversation stay up late.", "heart"],
  ["After Dark", "A private, consensual space for grown-up honesty.", "adult"],
  ["Duel", "Fast little games for when you need to settle it.", "swords"],
]

function Brand() { return <div className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(246,112,158,.3)]">♥</span>Love<span className="text-primary">Me</span></div> }

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("signup")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [avatar, setAvatar] = useState("❤️")
  const [adult, setAdult] = useState(false)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    if (!supabase) return () => { mounted = false }
    supabase.auth.getUser().then((result: { data: { user: unknown } }) => { if (mounted) setUser(result.data.user as User | null) })
    const subscription = supabase.auth.onAuthStateChange((_event: string, session: { user: unknown } | null) => { if (mounted) setUser(session?.user as User | null) })
    return () => { mounted = false; subscription.data.subscription.unsubscribe() }
  }, [supabase])

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage(""); setBusy(true)
    try {
      if (!supabase) throw new Error("LoveMe is not connected yet. Add the Supabase environment variables to enable accounts.")
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) throw new Error("Use 3–24 letters, numbers, or underscores.")
      if (password.length < 8) throw new Error("Use a password with at least 8 characters.")
      if (mode === "signup" && !adult) throw new Error("LoveMe is for adults only. Confirm you are 18+ to continue.")
      const email = authIdentifier(username)
      const result = mode === "signup" ? await supabase.auth.signUp({ email, password, options: { data: { username, display_name: displayName || username, avatar_emoji: avatar, is_adult: adult } } }) : await supabase.auth.signInWithPassword({ email, password })
      if (result.error) throw new Error(mode === "login" ? "Invalid username or password." : result.error.message.includes("already") ? "That username is already taken." : "We could not create your account. Try again.")
      if (mode === "signup" && !result.data.session) setMessage("Account created. Check the confirmation message for your private sign-in link.")
      else setAuthOpen(false)
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong.") } finally { setBusy(false) }
  }

  if (user) return <Dashboard user={user} onLogout={() => { if (supabase) void supabase.auth.signOut(); else setUser(null) }} />
  return <main className="min-h-screen overflow-hidden"><div className="mx-auto max-w-6xl px-5 sm:px-8"><nav className="flex items-center justify-between py-6"><Brand /><button onClick={() => { setMode("login"); setAuthOpen(true) }} className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-card">Log in</button></nav><section className="relative flex min-h-[650px] flex-col items-center justify-center py-20 text-center"><div className="pointer-events-none absolute left-1/2 top-20 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" /><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-primary">✦ A private space for two</div><h1 className="max-w-4xl text-balance font-serif text-5xl leading-[.98] tracking-tight sm:text-7xl lg:text-8xl">How well do you <em className="text-primary">really</em> know each other?</h1><p className="mt-7 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">A private little world for questions, inside jokes, deep thoughts, memories, and games — made for exactly two people.</p><div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"><button onClick={() => { setMode("signup"); setAuthOpen(true) }} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-7 font-semibold text-primary-foreground shadow-[0_12px_35px_rgba(246,112,158,.2)] transition hover:-translate-y-0.5 hover:brightness-110">Create your LoveMe →</button><a href="#features" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-border bg-card/40 px-7 font-semibold transition hover:bg-card">See what&apos;s inside</a></div></section><section id="features" className="border-t border-border py-20"><div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-primary">The good stuff</p><h2 className="mt-2 font-serif text-4xl sm:text-5xl">Made for your kind of close.</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">No feed. No followers. No performing for strangers. Just your little world.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{features.map(([title, copy, icon]) => <article key={title} className="rounded-[1.5rem] border border-border bg-card/55 p-5 transition hover:-translate-y-1 hover:border-primary/40"><div className="flex items-center justify-between"><span className="text-2xl" aria-hidden="true">{icon === "adult" ? "18+" : icon === "swords" ? "⚔" : icon === "book" ? "▤" : icon === "heart" ? "♡" : icon === "eyes" ? "◉" : "✦"}</span><span className="text-muted-foreground">↗</span></div><h3 className="mt-7 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></article>)}</div></section><footer className="flex flex-col gap-3 border-t border-border py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><Brand /><span>Private by design. Exactly two people.</span></footer></div>{authOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-xl"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><Brand /><h2 className="mt-7 font-serif text-3xl">{mode === "signup" ? "Start your little world." : "Welcome back."}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === "signup" ? "Pick a username. No email required." : "Your private space is waiting."}</p></div><button type="button" onClick={() => setAuthOpen(false)} className="text-2xl text-muted-foreground" aria-label="Close">×</button></div><div className="mt-6 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium">Username<input required value={username} onChange={e => setUsername(e.target.value)} className="min-h-12 rounded-2xl border border-input bg-background px-4 outline-none focus:border-primary" autoComplete="username" /></label><label className="flex flex-col gap-2 text-sm font-medium">Password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="min-h-12 rounded-2xl border border-input bg-background px-4 outline-none focus:border-primary" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>{mode === "signup" && <><label className="flex flex-col gap-2 text-sm font-medium">Display name<input value={displayName} onChange={e => setDisplayName(e.target.value)} className="min-h-12 rounded-2xl border border-input bg-background px-4 outline-none focus:border-primary" /></label><label className="flex flex-col gap-2 text-sm font-medium">Emoji avatar<input value={avatar} onChange={e => setAvatar(e.target.value.slice(0, 4))} className="min-h-12 rounded-2xl border border-input bg-background px-4 text-2xl outline-none focus:border-primary" maxLength={4} /></label><label className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm"><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} className="size-4 accent-[var(--primary)]" /> I confirm I am 18 or older.</label></>}</div>{message && <p role="alert" className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{message}</p>}<button disabled={busy} className="mt-5 min-h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Opening..." : mode === "signup" ? "Create account" : "Log in"}</button><button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage("") }} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">{mode === "signup" ? "Already have a LoveMe? Log in" : "New here? Create your LoveMe"}</button></form></div>}</main>
}

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) { const name = user.user_metadata?.display_name || user.user_metadata?.username || "friend"; return <main className="min-h-screen"><div className="mx-auto max-w-5xl px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><Brand /><button onClick={onLogout} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Log out</button></header><section className="mt-12 rounded-[2rem] border border-border bg-card p-6 sm:p-10"><p className="text-sm text-muted-foreground">Your private home</p><h1 className="mt-2 font-serif text-5xl">Hey, {name} <span className="text-primary">{user.user_metadata?.avatar_emoji || "♡"}</span></h1><p className="mt-4 max-w-lg leading-7 text-muted-foreground">LoveMe is better with someone. Create an invite and keep this space just between you two.</p><button className="mt-7 min-h-12 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground">+ Invite your person</button></section><section className="mt-8 rounded-[2rem] border border-dashed border-border p-8 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-3xl">♡</div><h2 className="mt-5 text-xl font-semibold">No connections yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Your little world starts with one other person. Invite someone you trust.</p></section></div></main> }
