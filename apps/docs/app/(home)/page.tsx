import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        React Native Skia
      </h1>
      <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
        High Performance 2D Graphics for React Native.
        <br />
        Built for iOS, Android, macOS, and Web.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs/getting-started/installation"
          className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90"
        >
          Get Started
        </Link>
        <Link
          href="/docs/getting-started/hello-world"
          className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-fd-accent"
        >
          Hello World
        </Link>
      </div>
      <div className="mt-12 aspect-video w-full max-w-3xl overflow-hidden rounded-xl border">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/EHxEX78alZE"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </main>
  );
}
