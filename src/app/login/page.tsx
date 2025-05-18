"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectTo: window.location.origin + "/dashboard" }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Google login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleLogin} className="bg-white dark:bg-[#181825] p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center mb-2">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          className="border rounded px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded px-3 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-[#a78bfa] text-white rounded py-2 font-semibold hover:bg-[#bfa3fa] transition" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <button type="button" onClick={handleGoogle} className="bg-white border border-[#a78bfa] text-[#a78bfa] rounded py-2 font-semibold hover:bg-[#f3e8ff] transition" disabled={loading}>
          Continue with Google
        </button>
        <div className="text-center text-sm mt-2">
          Don&apos;t have an account? <a href="/register" className="text-[#a78bfa] hover:underline">Register</a>
        </div>
      </form>
    </div>
  );
}
