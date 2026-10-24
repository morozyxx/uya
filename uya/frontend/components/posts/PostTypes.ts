export type Post = {
    id: number;
    title: string;
    description: string;
    platform: string;
    link: string;
    image: string;
};

export type PostInput = Omit<Post, "id">;

export type ApiErrorBody = {
    detail?: unknown;
    message?: unknown;
};

export function isPost(value: unknown): value is Post {
    if (typeof value !== "object" || value === null) return false;
    const post = value as Record<string, unknown>;

    return (
        typeof post.id === "number" &&
        typeof post.title === "string" &&
        typeof post.description === "string" &&
        typeof post.platform === "string" &&
        typeof post.link === "string" &&
        typeof post.image === "string"
    );
}
