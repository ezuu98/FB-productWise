import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ProductWise Details",
  description: "In-depth overview of ProductWise features, specifications, and pricing.",
};

export default function ProductWiseDetailsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-6 py-12">
      <section className="mx-auto w-full max-w-4xl">
        <nav className="mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">ProductWise Details</span>
        </nav>

        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">ProductWise Details</h1>
          <p className="mt-4 text-lg text-gray-600">
            Explore the capabilities of ProductWise, including key features, technical specifications, and pricing.
          </p>
        </header>

        <section aria-labelledby="features-heading" className="mt-12">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">Key features</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            <li className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium">Insightful analytics</h3>
              <p className="mt-2 text-gray-600">Real-time dashboards that surface product KPIs to guide decisions.</p>
            </li>
            <li className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium">Collaboration</h3>
              <p className="mt-2 text-gray-600">Share roadmaps and feedback with stakeholders securely.</p>
            </li>
            <li className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium">Automation</h3>
              <p className="mt-2 text-gray-600">Streamline repetitive tasks with rules and scheduled jobs.</p>
            </li>
            <li className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium">Integrations</h3>
              <p className="mt-2 text-gray-600">Connect with your stack for seamless data flow.</p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="specs-heading" className="mt-12">
          <h2 id="specs-heading" className="text-2xl font-semibold tracking-tight">Technical specifications</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="mt-1 font-medium text-gray-900">99.9%</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Data residency</p>
              <p className="mt-1 font-medium text-gray-900">US/EU options</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">API</p>
              <p className="mt-1 font-medium text-gray-900">REST & Webhooks</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Security</p>
              <p className="mt-1 font-medium text-gray-900">SSO, RBAC, audit logs</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="pricing-heading" className="mt-12">
          <h2 id="pricing-heading" className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-gray-200 p-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-3xl font-bold">$29<span className="text-lg font-medium text-gray-600">/mo</span></p>
              <p className="mt-2 text-gray-600">Includes core features and email support.</p>
            </div>
            <Link
              href="/checkout"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-3 text-white hover:bg-gray-800 sm:mt-0"
            >
              Get started
            </Link>
          </div>
        </section>

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-700 underline hover:text-gray-900">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
