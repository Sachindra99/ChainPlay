"use client";

import React, { useState, useEffect } from "react";
import GrantsBackground from "@/components/ui/GrantsBackground";
import abi from "@/app/abi";
import CardDemo from "@/components/blocks/cards-demo-2";
import { useAccount, useReadContract } from "wagmi";
import { Loader2 } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const contractAddress = "0xb8c26348fD46D55004207412bCC8D61BdF380F74";

interface Grant {
  creator: string;
  duration: bigint;
  finalized: boolean;
  games: any[];
  grantURI: string;
  name: string;
  startTime: bigint;
  totalAmount: bigint;
  totalVotes: bigint;
}

export default function Component() {
  const account = useAccount();
  const [loading, setLoading] = useState(true);
  const result = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllGrants",
  });
  const grantsData = result.data as Grant[];

  const timeLeft = (duration: bigint, startTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const endTime = startTime + duration;
    const timeLeftInSeconds = endTime > now ? endTime - now : 0n;

    if (timeLeftInSeconds === 0n) {
      return "Time is Over!";
    }

    const days = timeLeftInSeconds / 86400n;
    const hours = (timeLeftInSeconds % 86400n) / 3600n;
    const minutes = (timeLeftInSeconds % 3600n) / 60n;

    let timeString = "";
    if (days > 0n) timeString += `${days} days `;
    if (hours > 0n) timeString += `${hours} hours `;
    if (minutes > 0n || timeString === "") timeString += `${minutes} mins`;

    return timeString.trim();
  };

  useEffect(() => {
    if (grantsData) {
      setLoading(false);
    }
  }, [grantsData]);

  return (
    <GrantsBackground>
      <div className="container mx-auto px-4 py-8 z-50">
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <Loader2 className="animate-spin text-green-900" size={72} />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-5xl font-bold text-white">Listed Grants</h1>
              <HoverBorderGradient>Create Grant</HoverBorderGradient>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {grantsData?.map((grant: Grant, index: number) => (
                <CardDemo
                  key={index}
                  blockieAddress={grant.creator}
                  grantCreator={grant.creator}
                  grantDuration={timeLeft(grant.duration, grant.startTime)}
                  backgroundImage={grant.grantURI}
                  grantName={grant.name}
                  numberOfGames={grant.games.length}
                  grantStatus={grant.finalized ? "Finalized" : "Active"}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </GrantsBackground>
  );
}
