"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RacePageClient({ fno }: { fno: string }) {
    const router = useRouter();

    useEffect(() => {
        router.push(`/race-shell/${fno}`);
    }, [fno, router]);

    return (
        <div className="flex justify-center items-center bg-black min-h-screen w-full">
            <p className="text-white text-lg">Loading...</p>
        </div>
    );
}