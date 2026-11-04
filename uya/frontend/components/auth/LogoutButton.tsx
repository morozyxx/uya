"use client";

import { useState } from "react";
import Image from "next/image";

type LogoutButtonProps = {
    showLabel?: boolean;
};

export default function LogoutButton({ showLabel = false }: LogoutButtonProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState("");

    async function handleLogout() {
        setIsLoggingOut(true);
        setError("");

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                setError(`Sign out failed (HTTP ${response.status}). Please try again.`);
                return;
            }

            window.location.assign("/");
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <div className="relative">
            <button
                className={`${showLabel ? "mobile-logout-button" : "top-nav-control inline-grid"} cursor-pointer disabled:cursor-wait`}
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label={isLoggingOut ? "Signing out" : "Logout"}
                title={isLoggingOut ? "Signing out" : "Logout"}
            >
                <Image className="h-5 w-5" src="/logout-icon.svg" alt="" />
                {showLabel && <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>}
            </button>
            {error && (
                <span
                    className="absolute right-0 top-full z-10 mt-2 w-60 rounded-lg border border-rose-300/20 bg-[#10090c] p-3 text-xs text-rose-200 shadow-xl"
                    role="alert"
                >
                    {error}
                </span>
            )}
        </div>
    );
}
