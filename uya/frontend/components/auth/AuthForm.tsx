"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";

type AuthFormProps = {
    mode: "sign-in" | "sign-up";
};

type ApiErrorBody = {
    detail?: string;
    message?: string;
};

const authEndpoints = {
    "sign-in": "http://localhost:8000/auth/sign_in",
    "sign-up": "http://localhost:8000/auth/sign_up",
} as const;

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const isSignUp = mode === "sign-up";
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isSignUp && new URLSearchParams(window.location.search).has("registered")) {
            setNotice("Your account was created. Sign in to continue.");
        }
    }, [isSignUp]);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (isSignUp && password.length < 8) {
            setError("Your password must be at least 8 characters long.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                authEndpoints[mode],
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(
                        isSignUp
                            ? { username, password, email }
                            : { username, password },
                    ),
                },
            );

            if (!isSignUp && response.status === 200) {
                router.replace("/");
                router.refresh();
                return;
            }

            if (isSignUp && response.status === 201) {
                router.replace("/sign-in?registered=true");
                return;
            }

            if (!isSignUp && response.status === 401) {
                setError("Invalid username or password.");
                return;
            }

            if (isSignUp && response.status === 409) {
                setError("That username is already taken. Please choose another.");
                return;
            }

            let apiMessage = "";
            try {
                const body = (await response.json()) as ApiErrorBody;
                apiMessage = body.detail ?? body.message ?? "";
            } catch {
                // Some error responses do not include a JSON body.
            }

            setError(
                apiMessage ||
                    `We couldn't ${isSignUp ? "create your account" : "sign you in"} (HTTP ${response.status}).`,
            );
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="relative flex min-h-screen flex-col px-4 pb-12 sm:px-6">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-28 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/[0.07] blur-[100px]"
            />

            <header className="mx-auto mt-6 w-full max-w-6xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
                >
                    <span aria-hidden="true">←</span>
                    Back to home
                </Link>
            </header>

            <section className="mx-auto my-auto w-full max-w-md py-12">
                <div className="mb-8 text-center">
                    <p className="text-xs tracking-[0.22em] text-violet-300">
                        YOUR NEXT CHAPTER STARTS HERE
                    </p>
                    <h1 className="mt-4 text-3xl font-medium tracking-tight text-white sm:text-4xl">
                        {isSignUp ? "Create your account" : "Welcome back"}
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        {isSignUp
                            ? "Join Uya and share what you’re looking forward to."
                            : "Sign in to keep up with what’s coming next."}
                    </p>
                </div>

                <div className="glass-panel relative overflow-hidden rounded-3xl border p-6 sm:p-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(147,197,253,0.07),transparent_55%)]"
                    />

                    {notice && (
                        <p
                            className="relative mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-200"
                            role="status"
                        >
                            {notice}
                        </p>
                    )}

                    <form className="relative space-y-5" onSubmit={handleSubmit}>
                        <label className="block space-y-2">
                            <span className="text-xs text-slate-200">Username</span>
                            <input
                                autoComplete="username"
                                className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Your username"
                                required
                            />
                        </label>

                        {isSignUp && (
                            <label className="block space-y-2">
                                <span className="text-xs text-slate-200">Email</span>
                                <input
                                    autoComplete="email"
                                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </label>
                        )}

                        <label className="block space-y-2">
                            <span className="text-xs text-slate-200">Password</span>
                            <input
                                autoComplete={isSignUp ? "new-password" : "current-password"}
                                className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder={isSignUp ? "At least 8 characters" : "Your password"}
                                minLength={isSignUp ? 8 : undefined}
                                required
                            />
                            {isSignUp && (
                                <span className="block text-[11px] text-slate-400">
                                    Use at least 8 characters.
                                </span>
                            )}
                        </label>

                        {error && (
                            <p
                                className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            className="flex h-12 w-full items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/[0.12] text-sm font-medium text-violet-100 transition hover:border-violet-200/40 hover:bg-violet-300/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? isSignUp
                                    ? "Creating account..."
                                    : "Signing in..."
                                : isSignUp
                                  ? "Create account"
                                  : "Sign in"}
                        </button>
                    </form>

                    <p className="relative mt-6 text-center text-sm text-slate-300">
                        {isSignUp ? "Already have an account?" : "New to Uya?"}{" "}
                        <Link
                            className="text-violet-300 transition-colors hover:text-violet-200"
                            href={isSignUp ? "/sign-in" : "/sign-up"}
                        >
                            {isSignUp ? "Sign in" : "Create an account"}
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
