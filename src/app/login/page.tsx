import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/app/brand-logo';
import { LoginForm } from '@/components/login/loginForm';

export const metadata: Metadata = {
  title: 'Log in | Habitix',
  description: 'Access your Habitix workspace.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <Link href="/" aria-label="Habitix home" className="mb-7 block w-fit">
          <BrandLogo priority className="h-12 w-auto max-w-52" />
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Access your Habitix workspace.</p>
        </div>

        <LoginForm />

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New to Habitix?{' '}
          <Link className="font-medium text-primary hover:underline" href="/sign-up">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
