"use client";

import { useState } from "react";

type PostImageProps = {
    src: string;
    alt: string;
};

export default function PostImage({ src, alt }: PostImageProps) {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
        return (
            <div className="flex aspect-[1.75/1] items-center justify-center bg-gradient-to-br from-[#0c111b] to-[#08090d] px-6 text-center text-sm text-slate-400">
                Preview unavailable
            </div>
        );
    }

    return (
        // Remote preview URLs can come from any platform, so use the browser's native image loader.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            className="aspect-[1.75/1] w-full object-cover"
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setHasError(true)}
        />
    );
}
