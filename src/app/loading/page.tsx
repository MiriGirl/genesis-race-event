"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const finalNumber = searchParams.get("fno"); // get race number from query
  const [raceNumber, setRaceNumber] = useState("F---");

  useEffect(() => {
    if (!finalNumber) return;

    let count = 0;
    const interval = setInterval(() => {
      const randomDigits = Math.floor(10000 + Math.random() * 89999);
      setRaceNumber(`F${randomDigits}`);
      count++;

      if (count > 8) {
        clearInterval(interval);
        setRaceNumber(finalNumber);

        setTimeout(() => {
          router.push(`/${finalNumber}`);
        }, 2000);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [finalNumber, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div
        className="relative w-full h-screen"
        style={{
          maxWidth: "425px",
          margin: "0 auto",
          position: "relative",
          height: "100vh",
          backgroundImage: "url('/bg/loading-bg.jpg')",
          backgroundSize: "200%",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {/* Progress bar */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 0,
              width: "100%",
              height: "5px",
              backgroundColor: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div className="progress-bar"></div>
          </div>

          <h1
            className="text-3xl font-black text-center mt-12"
            style={{
              fontFamily: "Drag Racing, sans-serif",
              color: "#000",
              fontSize: 40,
              marginBottom: 40,
              marginTop: 80,
            }}
          >
            THE <br /> REAL RACE <br /> IS WITHIN
          </h1>

          <p
            style={{
              color: "#000",
              fontWeight: 600,
              fontSize: 20,
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Your race number is <br /> being generated
          </p>

          {/* Race number */}
          <div
            style={{
              fontFamily: "Drag Racing, sans-serif",
              color: "#000",
              fontSize: 50,
              marginBottom: 40,
            }}
          >
            {raceNumber}
          </div>

          <p
            style={{
              color: "#000",
              fontSize: 14,
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Engines are warming up... this may <br />
            take a few seconds. Stay in the zone!
          </p>

          <img
            src="/bg/innerdrive-black.png"
            alt="Innerdrive black footer"
            style={{
              display: "block",
              width: "70%",
              margin: "40px auto 0 auto",
            }}
          />
        </div>
      </div>
    </div>
  );
}