import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/components/site/AppProvider";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Rahi Travels" },
      { name: "description", content: "Register for secure booking, wallet access, and trip management." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user, signup } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [next, setNext] = useState("/account");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setNext(params.get("next") || "/account");
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await signup({ name, email, phone, password });
    if (result.success) {
      window.location.assign(next);
    } else {
      setError(result.message || "An error occurred during signup");
    }
  };

  if (user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="rounded-3xl border border-border bg-white p-10 text-center">
          <h1 className="text-3xl font-semibold mb-4">You are already logged in</h1>
          <p className="text-muted-foreground mb-6">Manage your bookings or continue browsing packages.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/account" className="btn-primary">Go to account</Link>
            <Link to="/packages" className="btn-outline">Browse packages</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-24">
      <div className="rounded-3xl border border-border bg-white p-10 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Create your Rahi account</h1>
          <p className="text-muted-foreground mt-2">Sign up to save trip plans, book faster, and access your wallet.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          {error && <div className="rounded-2xl bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">{error}</div>}
          <button type="submit" className="btn-primary w-full justify-center">Create account</button>
        </form>
        <div className="mt-6 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
