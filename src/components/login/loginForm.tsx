'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleSignInButton } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { signIn } from '@/lib/auth-client';
import type { LoginFormProps } from '@/types';

export function LoginForm({ callbackUrl = '/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await signIn.email({
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error.message ?? 'Unable to sign in.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div>
      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <GoogleSignInButton
          label="Sign in with Google"
          callbackUrl={callbackUrl}
          onError={setError}
        />

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Or continue with email
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1.5 text-sm font-medium">
          <span>Email</span>
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          <span>Password</span>
          <PasswordInput name="password" autoComplete="current-password" required />
        </label>
        <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
