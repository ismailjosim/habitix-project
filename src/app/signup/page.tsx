import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/app/brand-logo';
import { SignUpForm } from '@/components/signup/signUpForm';

export const metadata: Metadata = {
  title: 'Sign up | Habitix',
  description: 'Start with a student workspace.',
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <Link href="/" aria-label="Habitix home" className="mb-7 block w-fit">
          <BrandLogo priority className="h-12 w-auto max-w-52" />
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Start with a student workspace.</p>
        </div>

        <SignUpForm />

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link className="font-medium text-primary hover:underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
