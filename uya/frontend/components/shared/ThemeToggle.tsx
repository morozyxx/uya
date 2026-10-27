"use client";

import { useEffect } from "react";

const themeStorageKey = "uya-theme";

type ThemeToggleProps = {
    showLabel?: boolean;
};

export default function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
    useEffect(() => {
        if (window.localStorage.getItem(themeStorageKey) === "dark") {
            document.documentElement.dataset.theme = "dark";
        }
    }, []);

    function toggleTheme() {
        const nextTheme =
            document.documentElement.dataset.theme === "dark" ? "light" : "dark";

        document.documentElement.dataset.theme = nextTheme;
        window.localStorage.setItem(themeStorageKey, nextTheme);
    }

    return (
        <button
            type="button"
            className={showLabel ? "mobile-theme-toggle" : "top-nav-control grid"}
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle color theme"
        >
            <svg
                className="theme-icon theme-icon--sun h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
            <svg
                className="theme-icon theme-icon--moon h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
            </svg>
            {showLabel && <span>Change color theme</span>}
        </button>
    );
}
