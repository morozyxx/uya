"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header_auth from "@/components/shared/Header_auth";
import Header_not_auth from "@/components/shared/Header_not_auth";
import PostImage from "@/components/posts/PostImage";

type ProfilePost = {
    id?: number;
    title: string;
    description: string;
    platform: string;
    link: string;
    image: string;
};

type UserProfile = {
    username: string;
    posts: ProfilePost[];
};

function isProfilePost(value: unknown): value is ProfilePost {
    if (typeof value !== "object" || value === null) return false;
    const post = value as Record<string, unknown>;

    return (
        (post.id === undefined || typeof post.id === "number") &&
        typeof post.title === "string" &&
        typeof post.description === "string" &&
        typeof post.platform === "string" &&
        typeof post.link === "string" &&
        typeof post.image === "string"
    );
}

function isUserProfile(value: unknown): value is UserProfile {
    if (typeof value !== "object" || value === null) return false;
    const profile = value as Record<string, unknown>;

    return (
        typeof profile.username === "string" &&
        Array.isArray(profile.posts) &&
        profile.posts.every(isProfilePost)
    );
}

type UserProfileProps = {
    username: string;
};

export default function UserProfilePage({ username }: UserProfileProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function checkAuth() {
            try {
                const response = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal,
                });
                if (!controller.signal.aborted) {
                    setIsAuthenticated(response.status === 200);
                }
            } catch {
                if (!controller.signal.aborted) setIsAuthenticated(false);
            }
        }

        void checkAuth();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadProfile() {
            setProfile(null);
            setIsLoading(true);
            setNotFound(false);
            setError("");

            try {
                const response = await fetch("/api/auth/user_profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username }),
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;
                if (response.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (response.status !== 200) {
                    setError(`Could not load this profile (HTTP ${response.status}).`);
                    return;
                }

                const result: unknown = await response.json();
                if (!isUserProfile(result)) {
                    setError("The server returned an invalid user profile.");
                    return;
                }

                setProfile(result);
            } catch {
                if (!controller.signal.aborted) {
                    setError("Unable to reach the server. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        void loadProfile();
        return () => controller.abort();
    }, [username]);

    return (
        <main className="min-h-screen px-4 pb-20 sm:px-6">
            {isAuthenticated ? <Header_auth /> : <Header_not_auth />}
            <section className="mx-auto max-w-6xl pt-14 sm:pt-20">
                <Link
                    className="text-sm text-violet-300 hover:text-violet-200"
                    href="/"
                >
                    ← Back to feed
                </Link>

                {isLoading ? (
                    <p className="mt-8 text-sm text-slate-300" role="status">
                        Loading profile...
                    </p>
                ) : notFound ? (
                    <p
                        className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-10 text-center text-sm text-slate-300"
                        role="status"
                    >
                        User @{username} was not found.
                    </p>
                ) : error ? (
                    <p
                        className="mt-8 rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] px-5 py-8 text-sm text-rose-200"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : profile ? (
                    <>
                        <div className="mt-8 border-b border-white/[0.08] pb-6">
                            <p className="font-mono text-xs tracking-[0.2em] text-violet-300">
                                CREATOR PROFILE
                            </p>
                            <h1 className="mt-3 text-3xl font-medium text-white sm:text-4xl">
                                @{profile.username}
                            </h1>
                            <p className="mt-3 text-sm text-slate-300">
                                {profile.posts.length}{" "}
                                {profile.posts.length === 1 ? "post" : "posts"}
                            </p>
                        </div>

                        {profile.posts.length > 0 ? (
                            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {profile.posts.map((post, index) => (
                                    <article
                                        key={post.id ?? `${post.title}-${index}`}
                                        className="glass-panel group overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:border-white/[0.18]"
                                    >
                                        <a href={post.link} target="_blank" rel="noreferrer">
                                            <PostImage src={post.image} alt={post.title} />
                                        </a>
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-slate-300">
                                                <span className="rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-2.5 py-1 text-violet-200">
                                                    {post.platform}
                                                </span>
                                                <Link
                                                    className="truncate text-slate-300 hover:text-violet-200"
                                                    href={`/profile/${encodeURIComponent(profile.username)}`}
                                                >
                                                    @{profile.username}
                                                </Link>
                                            </div>
                                            <h2 className="mt-4 text-lg leading-7 text-white">
                                                {post.title}
                                            </h2>
                                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                                {post.description}
                                            </p>
                                            <div className="mt-5 border-t border-white/[0.07] pt-4 text-right font-mono text-xs">
                                                <a
                                                    className="text-violet-300 transition-colors group-hover:text-violet-200"
                                                    href={post.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Open publication <span aria-hidden="true">↗</span>
                                                </a>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-10 text-center text-sm text-slate-300">
                                This user has not shared any posts yet.
                            </p>
                        )}
                    </>
                ) : null}
            </section>
        </main>
    );
}
