import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import type { User } from "@/components/site/AppProvider";

export const Route = createFileRoute("/auth/google/callback")({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const { loginWithToken } = useApp();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthError = params.get("error");

    if (oauthError) {
      setError("Google sign-in was cancelled or denied.");
      return;
    }
    if (!code) {
      setError("Invalid OAuth callback — no code received.");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;

    fetch("/api/auth/google/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Rahi-Request": "true" },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.sessionToken && data.user) {
          loginWithToken(data.user as User, data.sessionToken);
          window.location.assign("/account");
        } else {
          setError(data.error || "Sign-in failed. Please try again.");
        }
      })
      .catch(() => setError("Network error. Please try again."));
  }, []);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Sign-in failed</h1>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <a href="/login" className="btn-primary inline-flex">Back to sign in</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-12">
      <div className="text-center animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}
