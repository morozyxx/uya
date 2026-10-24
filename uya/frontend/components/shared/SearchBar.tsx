import Image from "next/image";

type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <label className="glass-panel flex h-12 w-full items-center gap-3 rounded-xl border px-4 transition-shadow focus-within:ring-1 focus-within:ring-violet-300/40 sm:max-w-sm">
            <Image
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
                src="/magnifying-glass-icon.svg"
                alt=""
            />
            <input
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search creators and announcements"
                aria-label="Search creators and announcements"
            />
            <span className="hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">
                ⌕
            </span>
        </label>
    );
}