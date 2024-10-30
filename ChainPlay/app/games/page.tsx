"use client";

import React, { useState, useEffect } from "react";
import GrantsBackground from "@/components/ui/GrantsBackground";
import CardDemoGame from "@/components/blocks/cards-games";
import abi from "@/app/abi";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import AddGame from "@/components/AddGame";

const contractAddress = "0x44378e1beefC422568ABa878c74168369e4840C6";

interface Game {
  details: string;
  developer: string;
  funding: bigint;
  genre: string;
  imageURI: string;
  name: string;
  voteCount: bigint;
  videoURI: string;
  gameURI: string;
}

export default function GamesList() {
  const [loading, setLoading] = useState(true);

  // Fetch games data using getAllGames function from the contract
  const { data, refetch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllGames",
  });

  // Update data when GameAdded event is triggered
  useWatchContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: "GameSubmitted",
    onLogs(data) {
      console.log("New game added:", data);
      refetch();
    },
  });

  const gamesData = data as Game[];

  useEffect(() => {
    if (gamesData) {
      setLoading(false);
    }
  }, [gamesData]);

  return (
    <GrantsBackground>
      <div className="container mx-auto px-4 py-8 z-50">
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <Loader2 className="animate-spin text-lime-400" size={72} />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-5xl font-bold text-white">Listed Games</h1>
              <AddGame />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4">
              {gamesData?.map((game, index) => (
                <Link href={`/games/${Number(index + 1)}`} key={index}>
                  <CardDemoGame
                    name={game.name}
                    developer={game.developer}
                    voteCount={Number(game.voteCount)}
                    funding={Number(game.funding) / 10 ** 18}
                    imageURI={game.imageURI}
                    genre={game.genre}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </GrantsBackground>
  );
}
