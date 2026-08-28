import Link from "next/link";

const features = [
  ["🧠", "How Well Do You Know Me?", "Answer questions about each other and reveal your answers when you're both ready."],
  ["👀", "Who Is More Likely?", "Find out who would oversleep, disappear, become famous, or start the chaos."],
  ["📖", "Lore", "Keep the stories, inside jokes, moments and memories that belong to the two of you."],
  ["🧠", "Deep Dive", "Ask the questions that go beyond small talk."],
  ["🔞", "After Dark", "A separate 18+ space for the questions you wouldn't put anywhere else."],
  ["⚔️", "Duel", "Compete head-to-head in reaction, memory and spot-the-difference games."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <div className="text-2xl font-black">
          Love<span className="gradient-text">Me</span>
        </div>

        <div className="flex gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/5">
            Log in
          </Link>
          <Link href="/signup" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black">
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-5 pb-20 pt-16 text-center md:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-400/5 px-4 py-2 text-sm text-pink-200">
          ❤️ A private space for two
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
          How well do you <span className="gradient-text">really</span> know each other?
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
          LoveMe turns your relationship into a private little world of questions,
          inside jokes, deep thoughts, memories and games.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="rounded-2xl bg-white px-7 py-4 font-bold text-black">
            Create your LoveMe
          </Link>
          <Link href="#features" className="rounded-2xl border border-white/10 px-7 py-4 font-semibold text-white">
            Explore features
          </Link>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([icon, title, text]) => (
            <div key={title} className="glass rounded-3xl p-6">
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-5 py-8 text-center text-sm text-zinc-600">
        LoveMe — made for two.
      </footer>
    </main>
  );
}
