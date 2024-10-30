"use client";
import abi from "@/app/abi";
import { useReadContract, useWriteContract } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import FuturisticBackground from "@/components/ui/GrantsBackground";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useWatchContractEvent } from "wagmi";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/hooks/use-toast";
import Error from "next/error";

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
  grantId: bigint;
}

const contractAddress = "0x44378e1beefC422568ABa878c74168369e4840C6";

export default function Page({ params }: { params: { id: string } }) {
  const [voteLoading, setVoteLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const popoverRef = useRef<HTMLButtonElement | null>(null);

  const { data, refetch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getGame",
    args: [params.id],
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: "Voted",
    onLogs(data) {
      console.log("Voted", data);
      refetch();
    },
  });

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  const gameData = data as Game;

  const genres = ["Action", "Adventure", "RPG", "Strategy", "Sports", "Puzzle"];
  const genreName = gameData ? genres[Number(gameData.genre)] : "";

  async function vote(voteAmount: string) {
    setVoteLoading(true);
    try {
      await writeContractAsync(
        {
          address: contractAddress,
          abi: abi,
          functionName: "vote",
          args: [params.id, gameData.grantId],
          value: BigInt(Number(voteAmount) * 10 ** 18),
        },
        {
          onSuccess(data) {
            console.log("Transaction successful!", data);
          },
          onSettled(data, error) {
            if (error) {
              console.error("Error on settlement:", error);
            } else {
              toast({
                title: "Success",
                description: "Voted successfully!",
                action: (
                  <ToastAction
                    onClick={() => {
                      window.open(
                        `https://testnet.aiascan.com/tx/${data}`,
                        "_blank"
                      );
                    }}
                    altText="Click Here"
                  >
                    AIAScan
                  </ToastAction>
                ),
              });
              popoverRef.current?.click(); // Close the popover after the transaction
            }
          },
          onError(error) {
            console.error("Transaction error:", error);
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error : "An unknown error occurred";

      toast({
        title: "Error",
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : errorMessage.toString(),
        variant: "destructive",
      });
    }
    setVoteLoading(false);
  }

  return (
    <FuturisticBackground>
      <div className="container mx-auto px-4 py-8 z-50 flex-col flex">
        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <Loader2 className="animate-spin text-lime-400" size={72} />
          </div>
        ) : gameData ? (
          <>
            <div className="flex justify-between">
              <div className="hover:bg-slate-500/60 rounded-full w-12 h-12 flex justify-center items-center">
                <ArrowLeft
                  className="cursor-pointer "
                  onClick={() => router.push("/games")}
                />
              </div>
              <HoverBorderGradient onClick={() => setShowVideo(!showVideo)}>
                {showVideo ? "Show Image" : "Show Video"}
              </HoverBorderGradient>
            </div>

            <div className="flex mb-8 gap-6">
              <div className="flex flex-col items-center gap-4">
                {showVideo ? (
                  <video
                    src={gameData.videoURI}
                    controls
                    className="rounded-xl max-w-3xl"
                  />
                ) : (
                  <Image
                    alt="Grant Image"
                    className="rounded-xl max-w-3xl"
                    src={gameData.imageURI}
                    width={800}
                    height={800}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2 flex-grow">
                <div className="flex flex-col bg-black/40 rounded-xl flex-grow p-4 gap-6 place-content-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white px-2">
                      {gameData.name}
                    </h1>
                    <p className="text-gray-400 px-2 text-sm">
                      Made by : {gameData.developer}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-300 px-2">
                      Funding Received :
                    </h2>
                    <h1 className="text-5xl font-bold text-white px-2">
                      {Number(gameData.funding) / 10 ** 18} AIA
                    </h1>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-300 px-2">
                      Total Votes :
                    </h2>
                    <h1 className="text-xl font-bold text-green-100 px-2">
                      {gameData.voteCount.toLocaleString()}
                    </h1>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-300 px-2">
                      Genre :
                    </h2>
                    <h1 className="text-xl font-bold text-green-100 px-2">
                      {genreName}
                    </h1>
                  </div>
                  <HoverBorderGradient
                    onClick={() => window.open(gameData.gameURI, "_blank")}
                  >
                    Download Game
                  </HoverBorderGradient>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button ref={popoverRef}>Vote Now</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <VoteInput onVote={vote} voteLoading={voteLoading} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex flex-col mb-8 rounded-xl bg-black/40 p-4">
              <h1 className="text-5xl font-bold text-white mb-6">
                Description
              </h1>
              <p className="text-white text-lg">{gameData.details}</p>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <h1 className="text-3xl font-bold text-white">Game Not Found</h1>
          </div>
        )}
      </div>
    </FuturisticBackground>
  );
}

function VoteInput({
  onVote,
  voteLoading,
}: {
  onVote: (voteAmount: string) => void;
  voteLoading: boolean;
}) {
  const [amount, setAmount] = useState("");

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Vote Amount :</h4>
        <p className="text-sm text-muted-foreground">Enter the Amount in AIA</p>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Input
          id="amount"
          placeholder="Amount"
          className="col-span-2 h-8"
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <Button
          onClick={() => onVote(amount)}
          disabled={!amount || voteLoading}
        >
          {voteLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            "Vote"
          )}
        </Button>
      </div>
    </div>
  );
}
