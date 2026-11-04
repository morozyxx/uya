"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import Header_auth from "@/components/shared/Header_auth";
import { isPost, type ApiErrorBody, type PostInput } from "@/components/posts/PostTypes";

const postsApiUrl = "/api/posts";
const popularPlatforms = [
    "YouTube",
    "Instagram",
    "TikTok",
    "Twitch",
    "Telegram",
    "X",
    "Facebook",
    "Discord",
    "Reddit",
    "Snapchat",
    "Threads",
    "Pinterest",
    "LinkedIn",
    "Kick",
    "Vimeo",
    "Spotify",
    "Patreon",
    "Substack",
    "uya-highlights",
    "Other",
] as const;

async function readError(response: Response, fallback: string): Promise<string> {
    try {
        const body = (await response.json()) as ApiErrorBody;
        const message = body.detail ?? body.message;
        return typeof message === "string" && message ? message : fallback;
    } catch {
        return fallback;
    }
}

type PostEditorProps = {
    mode: "create" | "edit";
};

export default function PostEditor({ mode }: PostEditorProps) {
    const router = useRouter();
    const params = useParams<{ id?: string }>();
    const postId = mode === "edit" ? Number(params.id) : null;
    const [form, setForm] = useState<PostInput>({
        title: "",
        description: "",
        platform: "",
        link: "",
        image: "",
    });
    const [isLoading, setIsLoading] = useState(mode === "edit");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (mode !== "edit") return;
        if (postId === null || !Number.isSafeInteger(postId) || postId < 0) {
            setError("Invalid post ID.");
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadPost() {
            try {
                const response = await fetch(`${postsApiUrl}/all`, {
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

                const post = result.find((item) => item.id === postId);
                if (!post) {
                    setError("This post could not be found.");
                    return;
                }

                setForm({
                    title: post.title,
                    description: post.description,
                    platform: post.platform,
                    link: post.link,
                    image: post.image,
                });
            } catch {
                if (!controller.signal.aborted) {
                    setError("Unable to reach the server. Please try again.");
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        void loadPost();
        return () => controller.abort();
    }, [mode, postId]);

    function updateField(field: keyof PostInput, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (Object.values(form).some((value) => value.trim().length === 0)) {
            setError("Please fill in every field.");
            return;
        }
        if (form.title.length > 128 || form.description.length > 512) {
            setError("Title must be 128 characters or fewer and description 512 characters or fewer.");
            return;
        }
        if (mode === "edit" && postId === null) {
            setError("Invalid post ID.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(
                `${postsApiUrl}/${mode === "create" ? "new" : "edit"}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(
                        mode === "create" ? form : { id: postId, ...form },
                    ),
                },
            );

            if (response.status === 401) {
                setError("Your session has expired. Please sign in again.");
                return;
            }
            if (mode === "create" && response.status === 201) {
                router.replace("/posts");
                router.refresh();
                return;
            }
            if (mode === "edit" && response.status === 202) {
                router.replace("/posts");
                router.refresh();
                return;
            }

            setError(
                await readError(
                    response,
                    `Could not ${mode === "create" ? "create" : "update"} this post (HTTP ${response.status}).`,
                ),
            );
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    const fields: { name: "title" | "link" | "image"; label: string; type: "text" | "url"; placeholder: string }[] = [
        { name: "title", label: "Title", type: "text", placeholder: "Give your announcement a title" },
        { name: "link", label: "Publication link", type: "url", placeholder: "https://..." },
        { name: "image", label: "Preview image URL", type: "url", placeholder: "https://..." },
    ];

    return (
        <main className="min-h-screen px-4 pb-20 sm:px-6">
            <Header_auth />
            <section className="mx-auto max-w-3xl pt-12 sm:pt-16">
                <Link className="text-sm text-slate-300 transition hover:text-white" href="/posts">
                    ← Back to your posts
                </Link>
                <div className="mb-8 mt-8">
                    <p className="font-mono text-xs tracking-[0.2em] text-violet-300">
                        CREATOR STUDIO
                    </p>
                    <h1 className="mt-3 text-3xl font-medium text-white sm:text-4xl">
                        {mode === "create" ? "Create a post" : "Edit post"}
                    </h1>
                </div>

                <div className="glass-panel relative overflow-hidden rounded-3xl border p-6 sm:p-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(147,197,253,0.07),transparent_55%)]"
                    />
                    {isLoading ? (
                        <p className="relative text-sm text-slate-300" role="status">
                            Loading post...
                        </p>
                    ) : (
                        <form className="relative space-y-5" onSubmit={handleSubmit}>
                            {fields.slice(0, 1).map((field) => (
                                <label className="block space-y-2" key={field.name}>
                                    <span className="text-xs text-slate-200">{field.label}</span>
                                    <input
                                        className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                        type={field.type}
                                        value={form[field.name]}
                                        onChange={(event) => updateField(field.name, event.target.value)}
                                        placeholder={field.placeholder}
                                        maxLength={field.name === "title" ? 128 : undefined}
                                        required
                                    />
                                    {field.name === "title" && (
                                        <span className="block text-right text-[11px] text-slate-400" aria-live="polite">
                                            {form.title.length}/128
                                        </span>
                                    )}
                                </label>
                            ))}

                            <label className="block space-y-2">
                                <span className="text-xs text-slate-200">Platform</span>
                                <select
                                    className="post-platform-select h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                    value={form.platform}
                                    onChange={(event) => updateField("platform", event.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        Select a platform
                                    </option>
                                    {form.platform &&
                                        !popularPlatforms.some((platform) => platform === form.platform) && (
                                        <option value={form.platform}>{form.platform}</option>
                                    )}
                                    {popularPlatforms.map((platform) => (
                                        <option key={platform} value={platform}>
                                            {platform}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {fields.slice(1).map((field) => (
                                <label className="block space-y-2" key={field.name}>
                                    <span className="text-xs text-slate-200">{field.label}</span>
                                    <input
                                        className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                        type={field.type}
                                        value={form[field.name]}
                                        onChange={(event) => updateField(field.name, event.target.value)}
                                        placeholder={field.placeholder}
                                        required
                                    />
                                </label>
                            ))}

                            <label className="block space-y-2">
                                <span className="text-xs text-slate-200">Description</span>
                                <textarea
                                    className="min-h-36 w-full resize-y rounded-xl border border-white/[0.09] bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/40 focus:ring-1 focus:ring-violet-300/20"
                                    value={form.description}
                                    onChange={(event) => updateField("description", event.target.value)}
                                    placeholder="Tell your audience what’s coming..."
                                    maxLength={512}
                                    required
                                />
                                <span className="block text-right text-[11px] text-slate-400" aria-live="polite">
                                    {form.description.length}/512
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
                                disabled={isSaving || isLoading}
                            >
                                {isSaving
                                    ? "Saving..."
                                    : mode === "create"
                                      ? "Publish post"
                                      : "Save changes"}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}
