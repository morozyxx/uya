"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";

type ProfileResponse = {
    username?: unknown;
    email?: unknown;
};

type ApiErrorResponse = {
    detail?: unknown;
    message?: unknown;
};

const authApiUrl = "/api/auth";

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body = (await response.json()) as ApiErrorResponse;
        const message = body.detail ?? body.message;
        return typeof message === "string" && message.length > 0 ? message : fallback;
    } catch {
        return fallback;
    }
}

export default function EditProfileForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadProfile() {
            try {
                const response = await fetch(`${authApiUrl}/me`, {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;

                if (response.status === 401) {
                    router.replace("/sign-in");
                    return;
                }

                if (response.status !== 200) {
                    setError(`Could not load your profile (HTTP ${response.status}).`);
                    return;
                }

                const profile = (await response.json()) as ProfileResponse;
                if (
                    typeof profile.username !== "string" ||
                    typeof profile.email !== "string"
                ) {
                    setError("The profile response is missing a username or email address.");
                    return;
                }

                setUsername(profile.username);
                setEmail(profile.email);
            } catch {
                if (!controller.signal.aborted) {
                    setError("Unable to reach the server. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) setIsLoadingProfile(false);
            }
        }

        void loadProfile();
        return () => controller.abort();
    }, [router]);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("Your new password must be at least 8 characters long.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`${authApiUrl}/edit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    old_password: oldPassword,
                    new_password: newPassword,
                    email,
                }),
            });

            if (response.status === 200) {
                router.replace("/");
                router.refresh();
                return;
            }

            if (response.status === 401) {
                setError(
                    await getErrorMessage(
                        response,
                        "The current password is incorrect or your session has expired.",
                    ),
                );
                return;
            }

            if (response.status === 409) {
                setError("That username is already taken. Please choose another.");
                return;
            }

            setError(
                await getErrorMessage(
                    response,
                    `Could not update your profile (HTTP ${response.status}).`,
                ),
            );
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteAccount() {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This will permanently delete your account and all of your posts.",
        );
        if (!confirmed) return;

        setError("");
        setIsDeleting(true);

        try {
            const response = await fetch(`${authApiUrl}/delete`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.status === 200) {
                router.replace("/");
                router.refresh();
                return;
            }

            if (response.status === 401) {
                router.replace("/sign-in");
                return;
            }

            setError(
                await getErrorMessage(
                    response,
                    `Could not delete your account (HTTP ${response.status}).`,
                ),
            );
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <main className="relative flex min-h-screen flex-col px-4 pb-12 sm:px-6">
            <header className="mx-auto mt-6 w-full max-w-6xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
                >
                    <span aria-hidden="true">←</span>
                    Back to home
                </Link>
            </header>

            <section className="mx-auto my-auto w-full max-w-lg py-12">
                <div className="mb-8">
                    <p className="font-mono text-xs tracking-[0.2em] text-violet-300">
                        ACCOUNT SETTINGS
                    </p>
                    <h1 className="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
                        Edit your profile
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Update your account details and confirm the changes with your current password.
                    </p>
                </div>

                <div className="glass-panel relative overflow-hidden rounded-3xl border p-6 sm:p-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(147,197,253,0.07),transparent_55%)]"
                    />

                    {isLoadingProfile ? (
                        <p className="relative text-sm text-slate-300" role="status">
                            Loading your profile...
                        </p>
                    ) : (
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
                                    required
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-xs text-slate-200">Email</span>
                                <input
                                    autoComplete="email"
                                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-xs text-slate-200">Old password</span>
                                <input
                                    autoComplete="current-password"
                                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                    name="old_password"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(event) => setOldPassword(event.target.value)}
                                    required
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-xs text-slate-200">New password</span>
                                <input
                                    autoComplete="new-password"
                                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                    name="new_password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />
                                <span className="block text-[11px] text-slate-400">
                                    Use at least 8 characters.
                                </span>
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
                                disabled={isSaving || isDeleting}
                            >
                                {isSaving ? "Saving changes..." : "Save changes"}
                            </button>
                            <div className="border-t border-slate-400/20 pt-5">
                                <p className="mb-3 text-xs leading-5 text-slate-400">
                                    Deleting your account also permanently deletes all of your posts.
                                </p>
                                <button
                                    className="button-glass flex h-11 w-full items-center justify-center rounded-xl border border-rose-500/30 px-4 text-sm font-medium text-rose-800 hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
                                    type="button"
                                    onClick={() => void handleDeleteAccount()}
                                    disabled={isSaving || isDeleting}
                                >
                                    {isDeleting ? "Deleting account..." : "Delete account"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}
