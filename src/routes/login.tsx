import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  const [error, setError] = useState("");
  const [next, setNext] = useState("/account");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setNext(params.get("next") || "/account");
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const success = login({ email, password });
    if (success) {
      window.location.assign(next);
    } else {
      setError("Email or password is incorrect. Please try again.");
    }
  };

  if (user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="rounded-3xl border border-border bg-white p-10 text-center">
          <h1 className="text-3xl font-semibold mb-4">You are already signed in</h1>
          <p className="text-muted-foreground mb-6">Continue to your account or search flights, hotels, and packages.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/account" className="btn-primary">Go to account</Link>
            <Link to="/flights" className="btn-outline">Search flights</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-24">
      <div className="rounded-3xl border border-border bg-white p-10 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Sign in to Rahi Travels</h1>
          <p className="text-muted-foreground mt-2">Access saved trip plans, wallet credit, and booking history.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
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
          <button type="submit" className="btn-primary w-full justify-center">Sign in</button>
        </form>
        <div className="mt-6 text-sm text-muted-foreground">
          New to Rahi Travels? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
