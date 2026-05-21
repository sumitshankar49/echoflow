import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl border p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Create an account</h1>
        {/* RegisterForm goes here */}
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
