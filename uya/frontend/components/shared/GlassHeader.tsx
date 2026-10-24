import Image from "next/image";
import Link from "next/link";

import LogoutButton from "@/components/auth/LogoutButton";

type GlassHeaderProps = {
    authenticated: boolean;
};

export default function GlassHeader({ authenticated }: GlassHeaderProps) {
    return (
        <header className="glass-panel glass-header relative isolate mx-auto mt-5 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[1.75rem] px-4 py-3 sm:mt-8 sm:px-6 sm:py-4">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(255,255,255,0.78),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.28),transparent_58%)]"
            />
            <div className="flex items-center justify-between gap-3 sm:gap-6">
                <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="overflow-hidden rounded-2xl border border-white/70 bg-slate-950 p-1.5 shadow-[0_8px_24px_rgba(24,42,69,0.24)] ring-1 ring-slate-500/10">
                        <Image
                            className="h-11 w-11 rounded-xl object-cover sm:h-14 sm:w-14"
                            src="/logo.png"
                            alt="Uya logo"
                            unoptimized
                            priority
                        />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                            uya
                        </h1>
                        <p className="hidden font-mono text-[10px] tracking-[0.16em] text-slate-300 sm:block">
                            YOUR UPCOMING HIGHLIGHTS
                        </p>
                    </div>
                </Link>
                <div className="top-nav-actions flex shrink-0 items-center gap-2">
                    {authenticated ? (
                        <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] py-1.5 pl-3 pr-1.5 sm:gap-3 sm:pl-4">
                            <span className="hidden text-xs text-slate-200 sm:inline">
                                My account
                            </span>
                            <Link
                                href="/posts"
                                aria-label="My posts"
                                title="My posts"
                                className="top-nav-control hidden sm:grid"
                            >
                                <Image
                                    className="h-5 w-5 brightness-0 opacity-75"
                                    src="/post-icon.svg"
                                    alt=""
                                />
                            </Link>
                            <Link
                                href="/profile/edit"
                                aria-label="Edit profile"
                                title="Edit profile"
                                className="top-nav-control grid"
                            >
                                <Image className="h-5 w-5 brightness-0 opacity-75" src="/profile-icon.svg" alt="Profile" />
                            </Link>
                            <LogoutButton />
                        </div>
                    ) : (
                        <>
                            <span
                                className="top-nav-control grid"
                                title="About Uya"
                            >
                                <Image className="h-5 w-5 brightness-0 opacity-75" src="/info-icon.svg" alt="About" />
                            </span>
                            <Link
                                href="/sign-in"
                                aria-label="Sign in"
                                title="Sign in"
                                className="top-nav-control grid"
                            >
                                <Image className="h-5 w-5 brightness-0 opacity-75" src="/login-icon.svg" alt="Sign in" />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
