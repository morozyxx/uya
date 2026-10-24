"use client";

import { useEffect, useMemo, useState } from "react";
import Header_auth from "@/components/shared/Header_auth";
import Header_not_auth from "@/components/shared/Header_not_auth";
import SearchBar from "@/components/shared/SearchBar";
import PostImage from "@/components/posts/PostImage";

type AuthState = "loading" | "authenticated" | "unauthenticated" | "error";
type PublicPost = {
    title: string;
    description: string;
    platform: string;
    link: string;
    image: string;
    username: string;
};

function isPublicPost(value: unknown): value is PublicPost {
    if (typeof value !== "object" || value === null) return false;
    const post = value as Record<string, unknown>;

    return (
        typeof post.title === "string" &&
        typeof post.description === "string" &&
        typeof post.platform === "string" &&
        typeof post.link === "string" &&
        typeof post.image === "string" &&
        typeof post.username === "string"
    );
}

export default function Home() {
    const [authState, setAuthState] = useState<AuthState>("loading");
    const [posts, setPosts] = useState<PublicPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [postsError, setPostsError] = useState("");
    const [search, setSearch] = useState("");
    const [platformFilter, setPlatformFilter] = useState("All");

    useEffect(() => {
        const controller = new AbortController();

        async function checkAuth() {
            try {
                const response = await fetch("http://localhost:8000/auth/me", {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;
                if (response.status === 200) setAuthState("authenticated");
                else if (response.status === 401) setAuthState("unauthenticated");
                else setAuthState("error");
            } catch {
                if (!controller.signal.aborted) setAuthState("error");
            }
        }

        async function loadPublicPosts() {
            try {
                const response = await fetch("http://localhost:8000/posts/", {
                    method: "GET",
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;
                if (!response.ok) {
                    setPostsError(`Could not load announcements (HTTP ${response.status}).`);
                    return;
                }

                const result: unknown = await response.json();
                if (!Array.isArray(result) || !result.every(isPublicPost)) {
                    setPostsError("The server returned an invalid announcements list.");
                    return;
                }

                setPosts(result);
            } catch {
                if (!controller.signal.aborted) {
                    setPostsError("Unable to reach the server. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) setIsLoadingPosts(false);
            }
        }

        void checkAuth();
        void loadPublicPosts();

        return () => controller.abort();
    }, []);

    const platforms = useMemo(
        () => ["All", ...new Set(posts.map((post) => post.platform))],
        [posts],
    );

    const filteredPosts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return posts.filter((post) => {
            const matchesPlatform =
                platformFilter === "All" || post.platform === platformFilter;
            const matchesSearch =
                query.length === 0 ||
                `${post.title} ${post.description} ${post.username} ${post.platform}`
                    .toLowerCase()
                    .includes(query);

            return matchesPlatform && matchesSearch;
        });
    }, [platformFilter, posts, search]);

    return (
        <main className="min-h-screen px-4 pb-20 sm:px-6">
            {authState === "authenticated" ? <Header_auth /> : <Header_not_auth />}

            <section className="mx-auto max-w-6xl pt-16 sm:pt-24">
                <div className="max-w-3xl">
                    <p className="mb-5 flex items-center gap-2 font-mono text-xs tracking-[0.22em] text-violet-300">
                        <span className="h-px w-7 bg-violet-400" />
                        WHERE CURIOSITY BEGINS
                    </p>
                    <h1 className="text-4xl font-medium leading-[1.15] tracking-[-0.07em] text-white sm:text-6xl">
                        Coming soon is{" "}
                        <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                            just the beginning.
                        </span>
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                        Discover upcoming videos, streams, and posts from creators you
                        love. Everything worth looking forward to, in one feed.
                    </p>
                    {authState === "error" && (
                        <p className="mt-3 text-xs text-amber-300/80" role="status">
                            Couldn’t verify your sign-in. Showing the public feed.
                        </p>
                    )}
                </div>

                <div className="mt-12 flex flex-col gap-4 border-y border-white/[0.08] py-5 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-mono text-xs tracking-[0.18em] text-slate-400">
                            THE ANNOUNCEMENT FEED
                        </p>
                        <h2 className="mt-1 text-lg text-white">Coming up next</h2>
                    </div>
                    <SearchBar value={search} onChange={setSearch} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter by platform">
                    {platforms.map((platform) => (
                        <button
                            key={platform}
                            type="button"
                            onClick={() => setPlatformFilter(platform)}
                            aria-pressed={platformFilter === platform}
                            className={`platform-filter rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                                platformFilter === platform
                                    ? "selected border-violet-300/30 bg-violet-300/10"
                                    : "border-white/[0.1] bg-white/[0.025] text-slate-300 hover:border-white/20"
                            }`}
                        >
                            {platform}
                        </button>
                    ))}
                </div>

                {isLoadingPosts ? (
                    <p className="mt-10 text-sm text-slate-300" role="status">
                        Loading announcements...
                    </p>
                ) : postsError ? (
                    <p
                        className="mt-10 rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] px-5 py-8 text-sm text-rose-200"
                        role="alert"
                    >
                        {postsError}
                    </p>
                ) : filteredPosts.length > 0 ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPosts.map((post, index) => (
                            <article
                                key={`${post.username}-${post.title}-${index}`}
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
                                        <span className="truncate text-slate-300">
                                            @{post.username}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-lg leading-7 text-white">
                                        {post.title}
                                    </h3>
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
                    <p className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-10 text-center text-sm text-slate-300">
                        {posts.length === 0
                            ? "No announcements have been shared yet."
                            : "No announcements found. Try another search or platform."}
                    </p>
                )}
            </section>
        </main>
    );
}
