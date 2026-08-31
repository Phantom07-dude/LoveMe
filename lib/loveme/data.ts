import { createClient } from "@/lib/supabase/client"

export async function createConnection(userId: string) {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured.")
  const { data, error } = await supabase.rpc("create_private_connection", { owner_id: userId })
  if (error) throw error
  return data as string
}

export async function hashInviteToken(token: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function createInvite(connectionId: string, userId: string) {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured.")
  const token = crypto.randomUUID().replaceAll("-", "")
  const { error } = await supabase.from("connection_invites").insert({
    connection_id: connectionId,
    token_hash: await hashInviteToken(token),
    created_by: userId,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })
  if (error) throw error
  return token
}

export async function saveQuestionAnswer(input: { connectionId: string; questionId: string; userId: string; answer: string }) {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured.")
  const { error } = await supabase.from("question_answers").upsert({
    connection_id: input.connectionId,
    question_id: input.questionId,
    user_id: input.userId,
    answer: input.answer.trim(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "connection_id,question_id,user_id" })
  if (error) throw error
}

export async function addCustomQuestion(input: { connectionId: string; userId: string; prompt: string; isAdult: boolean }) {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured.")
  const { error } = await supabase.from("custom_questions").insert({ connection_id: input.connectionId, created_by: input.userId, prompt: input.prompt.trim(), is_adult: input.isAdult })
  if (error) throw error
}

export async function addLoreEntry(input: { connectionId: string; userId: string; title: string; body: string }) {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured.")
  const { error } = await supabase.from("lore_entries").insert({ connection_id: input.connectionId, created_by: input.userId, title: input.title.trim(), body: input.body.trim() })
  if (error) throw error
}

export async function saveReaction(input: { entryId: string; userId: string; reaction: string }) {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured.")
  const { error } = await supabase.from("lore_reactions").upsert({ entry_id: input.entryId, user_id: input.userId, reaction: input.reaction }, { onConflict: "entry_id,user_id" })
  if (error) throw error
}

export async function setAfterDarkEnabled(connectionId: string, enabled: boolean) {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured.")
  const { error } = await supabase.from("connection_settings").upsert({ connection_id: connectionId, after_dark_enabled: enabled, updated_at: new Date().toISOString() })
  if (error) throw error
}
