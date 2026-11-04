import { Suspense } from "react";
import UserProfile from "./UserProfile";

type ProfilePageProps = {
    params: Promise<{ username: string }>;
};

async function ProfileForUsername({ params }: ProfilePageProps) {
    const { username } = await params;

    return <UserProfile username={username} />;
}

export default function ProfilePage(props: ProfilePageProps) {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen px-4 pb-20 sm:px-6">
                    <p className="mx-auto max-w-6xl pt-14 text-sm text-slate-300 sm:pt-20">
                        Loading profile...
                    </p>
                </main>
            }
        >
            <ProfileForUsername {...props} />
        </Suspense>
    );
}
