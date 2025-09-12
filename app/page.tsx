import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <section className="mx-auto w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">FB ProductWise</h1>
        <p className="mt-4 text-lg text-gray-600">App Router • TypeScript • Tailwind CSS • npm</p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-lg bg-gray-100 px-5 py-3">
          <code className="text-sm text-gray-800">npm run dev</code>
        </div>
        <div className="mt-6">
          <Link href="/productwisedetails" className="text-gray-700 underline hover:text-gray-900">
            View ProductWise Details
          </Link>
        </div>
      </section>
    </main>
  );
}
