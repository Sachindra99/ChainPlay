"use client";

import FuturisticBackground from "@/components/ui/GrantsBackground";
import abi from "@/app/abi";

import { ToastAction } from "@/components/ui/toast";
import {
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { Loader2, CalendarIcon } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { PlusCircle } from "lucide-react";

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

export const contractAddress = "0xb8c26348fD46D55004207412bCC8D61BdF380F74";

export default function Page({ params }: { params: { id: number } }) {
  const { data, isLoading } = useReadContract({
    abi: abi,
    address: contractAddress,
    functionName: "getGrant",
    args: [params.id + 1],
  });

  const grant = data as Grant | undefined;

  return (
    <FuturisticBackground>
      <div className="container mx-auto px-4 py-8 z-50 flex-col flex">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-white w-12 h-12" />
          </div>
        ) : grant ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-5xl font-bold text-white">{grant.name}</h1>
              <HoverBorderGradient>
                <div className="flex items-center">
                  <PlusCircle className="mr-2" />
                  Add Game
                </div>
              </HoverBorderGradient>
            </div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <CalendarIcon />
                <p className="text-xl font-bold text-white ml-2">
                  {new Date(
                    Number(grant.startTime) * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-xl font-bold text-white mr-2">
                  {grant.totalVotes}
                </p>
                <p className="text-xl font-bold text-white">Votes</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-white text-center">Grant not found.</p>
        )}
      </div>
    </FuturisticBackground>
  );
}
