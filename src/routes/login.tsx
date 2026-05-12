import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Rahi Travels" },
      { name: "description", content: "Secure sign in to manage bookings and loyalty rewards." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("/account");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setNext(params.get("next") || "/account");
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const success = await login({ email, password });
    if (success) {
      window.location.assign(next);
    } else {
      setError("Email or password is incorrect. Please try again.");
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-sm animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            {user.name[0]}
          </div>
          <h1 className="text-2xl font-semibold mb-2">You're signed in</h1>
          <p className="text-muted-foreground mb-6">Continue to your account or search for trips.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/account" className="btn-primary">Go to account</Link>
            <Link to="/flights" className="btn-outline">Search flights</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <span className="logo-mark">R</span>
            <span className="font-bold text-xl">Rahi Travels</span>
          </div>
          <h1 className="text-2xl font-bold mt-4 mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to access your bookings, wallet &amp; saved trips.</p>
        </div>

        <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-destructive/8 border border-destructive/30 px-4 py-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            New to Rahi Travels?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
