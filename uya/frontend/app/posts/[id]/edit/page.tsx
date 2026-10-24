import { Suspense } from "react";
import PostEditor from "@/components/posts/PostEditor";

export default function EditPostPage() {
    return (
        <Suspense fallback={<p role="status">Loading post editor...</p>}>
            <PostEditor mode="edit" />
        </Suspense>
    );
}
