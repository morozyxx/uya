"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header_auth from "@/components/shared/Header_auth";
import PostImage from "@/components/posts/PostImage";
import { isPost, type Post } from "@/components/posts/PostTypes";

const postsEndpoint = "/api/posts/all";

export default function PostsDashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPosts() {
            try {
                const response = await fetch(postsEndpoint, {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;
                if (response.status === 401) {
                    window.location.replace("/sign-in");
                    return;
                }
                if (response.status !== 200) {
                    setError(`Could not load your posts (HTTP ${response.status}).`);
                    return;
                }

                const result: unknown = await response.json();
                if (!Array.isArray(result) || !result.every(isPost)) {
                    setError("The server returned an invalid posts list.");
                    return;
                }

                setPosts(result);
            } catch {
                if (!controller.signal.aborted) {
                    setError("Unable to reach the server. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        void loadPosts();
        return () => controller.abort();
    }, []);

    async function deletePost(post: Post) {
        if (!window.confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
            return;
        }

        setError("");
        setDeletingPostId(post.id);

        try {
            const response = await fetch("/api/posts/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id: post.id }),
            });

            if (response.status === 401) {
                window.location.replace("/sign-in");
                return;
            }

            if (!response.ok) {
                setError(`Could not delete this post (HTTP ${response.status}).`);
                return;
            }

            setPosts((currentPosts) => currentPosts.filter((item) => item.id !== post.id));
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setDeletingPostId(null);
        }
    }

    return (
        <main className="min-h-screen px-4 pb-20 sm:px-6">
            <Header_auth />
            <section className="mx-auto max-w-6xl pt-14 sm:pt-20">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="font-mono text-xs tracking-[0.2em] text-violet-300">
                            CREATOR STUDIO
                        </p>
                        <h1 className="mt-3 text-3xl font-medium text-white sm:text-4xl">
                            Your posts
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                            Manage the announcements you share with your audience.
                        </p>
                    </div>
                    <Link
                        href="/posts/new"
                        className="button-glass inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium text-violet-100"
                    >
                        Create a post <span className="ml-2" aria-hidden="true">+</span>
                    </Link>
                </div>

                {error && (
                    <p className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200" role="alert">
                        {error}
                    </p>
                )}

                {isLoading ? (
                    <p className="mt-10 text-sm text-slate-300" role="status">
                        Loading your posts...
                    </p>
                ) : !error && posts.length === 0 ? (
                    <div className="glass-panel mt-10 rounded-2xl border px-6 py-14 text-center">
                        <p className="text-lg text-white">Your feed starts here.</p>
                        <p className="mt-2 text-sm text-slate-300">
                            Create your first announcement to share what’s coming next.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="glass-panel overflow-hidden rounded-2xl border transition hover:border-white/[0.18]"
                            >
                                <a href={post.link} target="_blank" rel="noreferrer">
                                    <PostImage src={post.image} alt={post.title} />
                                </a>
                                <div className="p-5">
                                    <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-slate-300">
                                        <span className="rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-2.5 py-1 text-violet-200">
                                            {post.platform}
                                        </span>
                                        <span>#{post.id}</span>
                                    </div>
                                    <h2 className="mt-4 text-lg text-white">{post.title}</h2>
                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                        {post.description}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                                        <a
                                            className="text-xs text-violet-300 transition hover:text-violet-200"
                                            href={post.link}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open publication ↗
                                        </a>
                                        <Link
                                            className="button-glass post-action-button"
                                            href={`/posts/${post.id}/edit`}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            className="button-glass post-action-button disabled:cursor-wait disabled:opacity-50"
                                            type="button"
                                            onClick={() => void deletePost(post)}
                                            disabled={deletingPostId !== null}
                                        >
                                            {deletingPostId === post.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
