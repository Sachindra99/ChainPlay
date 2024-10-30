"use client";
import FuturisticBackground from "@/components/ui/GrantsBackground";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import abi from "@/app/abi";

import CardDemo from "@/components/blocks/cards-games";
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

function genreEnum(genre: string) {
  switch (genre) {
    case "Action":
      return 0;
    case "Adventure":
      return 1;
    case "RPG":
      return 2;
    case "Strategy":
      return 3;
    case "Sports":
      return 4;
    case "Puzzle":
      return 5;
    default:
      return 0;
  }
}

// Simple CSS Spinner
const Spinner = () => (
  <div className="flex justify-center items-center mt-20">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lime-400"></div>
  </div>
);

export default function Page({ params }: { params: { genre: string } }) {
  const router = useRouter();
  const [gamesData, setGamesData] = useState<Game[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const { data, isLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllGamesByGenre",
    args: [genreEnum(params.genre)],
  });

  useEffect(() => {
    if (!isLoading) {
      setGamesData(data as Game[]);
      setLoading(false);
    }
  }, [data, isLoading]);

  return (
    <FuturisticBackground>
      <div className="container mx-auto px-4 py-8 z-50 flex-col flex">
        <div className="flex items-center mb-8">
          <div className="hover:bg-slate-500/60 rounded-full w-12 h-12 flex justify-center items-center">
            <ArrowLeft
              className="cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>
          <h1 className="text-white text-5xl ml-4">{params.genre} Games</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center text-lime-400">
            <Spinner />
          </div>
        ) : gamesData?.length === 0 ? (
          <p className="text-white text-center text-xl">No Games Posted</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gamesData?.map((game) => (
              <CardDemo
                key={game.name}
                name={game.name}
                developer={game.developer}
                voteCount={Number(game.voteCount)}
                funding={Number(game.funding / BigInt(10 ** 18))}
                imageURI={game.imageURI}
                genre={game.genre}
              />
            ))}
          </div>
        )}
      </div>
    </FuturisticBackground>
  );
}
