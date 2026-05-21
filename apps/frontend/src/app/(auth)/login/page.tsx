import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl border p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Sign in to EchoFlow</h1>
        {/* LoginForm goes here */}
        <p className="text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/register" className="underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
