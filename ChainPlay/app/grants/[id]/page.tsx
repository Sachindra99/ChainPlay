"use client";

import FuturisticBackground from "@/components/ui/GrantsBackground";
import abi from "@/app/abi";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CardDemoGame from "@/components/blocks/cards-games";
import {
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const gameSchema = z.object({
  gameName: z.string().min(1, "Game Name is required"),
  gameDetails: z.string().min(1, "Please enter a valid Description"),
  genre: z.enum(["0", "1", "2", "3", "4", "5"]),
  gameURI: z.string(),
  imageURI: z.string(),
  videoURI: z.string(),
});

type GameFormInputs = z.infer<typeof gameSchema>;

interface Grant {
  creator: string;
  duration: bigint;
  finalized: boolean;
  games: number[];
  grantURI: string;
  name: string;
  startTime: bigint;
  totalAmount: bigint;
  totalVotes: bigint;
}

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

const contractAddress = "0x44378e1beefC422568ABa878c74168369e4840C6";

export default function Page({ params }: { params: { id: number } }) {
  const { control, handleSubmit } = useForm<GameFormInputs>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      gameName: "",
      gameDetails: "",
      genre: undefined,
      gameURI: "",
      imageURI: "",
      videoURI: "",
    },
  });
  const [video, setVideo] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [gameZip, setGameZip] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const grantId = Number(params.id);
  const { data } = useReadContract({
    abi: abi,
    address: contractAddress,
    functionName: "getGrant",
    args: [grantId + 1],
  });
  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  const { data: game, refetch } = useReadContract({
    abi: abi,
    address: contractAddress,
    functionName: "getAllGamesOfGrant",
    args: [grantId + 1],
  });

  function handleDialogOpen() {
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
  }

  useWatchContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: "GameSubmitted",
    onLogs(data) {
      console.log("New game added:", data);
      refetch();
    },
  });

  const games = game as Game[] | undefined;

  const grant = data as Grant | undefined;
  const grantAmountinAia = Number(grant?.totalAmount) / 10 ** 18;

  const { writeContractAsync } = useWriteContract();
  async function submitGame(
    name: string,
    details: string,
    genre: string,
    video: string,
    image: string,
    game: string
  ) {
    try {
      await writeContractAsync(
        {
          address: contractAddress,
          abi: abi,
          functionName: "submitGame",
          args: [grantId + 1, name, details, game, image, video, genre],
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
                description: "Game Added successfully!",
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
      toast({
        title: "Error",
        description: "Error submitting game",
        variant: "destructive",
      });
      console.error("Error submitting game", error);
    }
  }

  const onSubmit = async (data: GameFormInputs) => {
    setSubmitLoading(true);
    if (!video || !image || !gameZip) {
      toast({
        title: "Error",
        description: "Please upload all the required files",
        variant: "destructive",
      });
      setSubmitLoading(false);
      return;
    }
    const imgData = new FormData();
    imgData.set("file", image);
    const videoData = new FormData();
    videoData.set("file", video);
    const gameData = new FormData();
    gameData.set("file", gameZip);
    const uploadRequestVideo = await fetch("/api/files", {
      method: "POST",
      body: videoData,
    });
    const videoURI = await uploadRequestVideo.json();

    const uploadRequestImage = await fetch("/api/files", {
      method: "POST",
      body: imgData,
    });
    const imageURI = await uploadRequestImage.json();

    const uploadRequestGame = await fetch("/api/files", {
      method: "POST",
      body: gameData,
    });
    const gameURI = await uploadRequestGame.json();

    if (videoURI.error || imageURI.error || gameURI.error) {
      toast({
        title: "Error",
        description: "Error uploading files",
        variant: "destructive",
      });
      setSubmitLoading(false);
      return;
    }
    try {
      await submitGame(
        data.gameName,
        data.gameDetails,
        data.genre,
        videoURI,
        imageURI,
        gameURI
      );
      setSubmitLoading(false);
      handleDialogClose();
    } catch (error: unknown) {
      toast({
        title: "ErrorInFinalize",
        description: "Error submitting game",
        variant: "destructive",
      });
      console.error("Error submitting game", error);
      setSubmitLoading(false);
    }
  };

  return (
    <FuturisticBackground>
      <div className="container mx-auto px-4 py-8 z-50 flex-col flex">
        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <Loader2 className="animate-spin text-lime-400" size={72} />
          </div>
        ) : grant ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="hover:bg-slate-500/60 rounded-full w-12 h-12 flex justify-center items-center">
                <ArrowLeft
                  className="cursor-pointer "
                  onClick={() => router.push("/grants")}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <HoverBorderGradient onClick={handleDialogOpen}>
                    <div className="flex items-center">
                      <PlusCircle className="mr-2" />
                      Add Game
                    </div>
                  </HoverBorderGradient>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Game</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={async () => {
                      handleSubmit(onSubmit);
                    }}
                  >
                    <div className="space-y-4">
                      <Label htmlFor="gamename">Game Name</Label>
                      <Input
                        {...control.register("gameName")}
                        id="gamename"
                        placeholder="Game Name"
                      />
                      <Label htmlFor="gamedesc">Description</Label>
                      <Input
                        {...control.register("gameDetails")}
                        id="gamedesc"
                        placeholder="Description"
                      />
                      <Controller
                        control={control}
                        name="genre"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Action</SelectItem>
                              <SelectItem value="1">Adventure</SelectItem>
                              <SelectItem value="2">RPG</SelectItem>
                              <SelectItem value="3">Strategy</SelectItem>
                              <SelectItem value="4">Sports</SelectItem>
                              <SelectItem value="5">Puzzle</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Label htmlFor="video">
                        Upload Video (less than 25MB)
                      </Label>
                      <Input
                        id="video"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setVideo(file);
                        }}
                      />
                      <Label htmlFor="image">Upload Image</Label>
                      <Input
                        id="image"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImage(file);
                        }}
                      />
                      <Label htmlFor="game">
                        Upload Game (.zip less than 25MB)
                      </Label>
                      <Input
                        id="game"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setGameZip(file);
                        }}
                      />
                    </div>
                    <DialogFooter>
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full"
                      >
                        {submitLoading ? (
                          <HoverBorderGradient>
                            <Loader2
                              className="animate-spin text-white"
                              size={20}
                            />
                          </HoverBorderGradient>
                        ) : (
                          <HoverBorderGradient>Submit</HoverBorderGradient>
                        )}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex mb-8 gap-6">
              <Image
                alt="Grant Image"
                className="rounded-xl"
                src={grant.grantURI}
                width={800}
                height={800}
              />
              <div className="flex flex-col bg-black/40 rounded-xl flex-grow p-4 gap-6 place-content-between">
                <div>
                  <h1 className="text-3xl font-bold text-white px-2">
                    {grant.name}
                  </h1>
                  <p className="text-gray-400 px-2 text-sm">
                    Made by : {grant.creator}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-300 px-2">
                    Grant Pool :
                  </h2>
                  <h1 className="text-5xl font-bold text-white px-2">
                    {grantAmountinAia} AIA
                  </h1>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-300 px-2">
                    Total Votes :
                  </h2>
                  <h1 className="text-xl font-bold text-green-100 px-2">
                    {grant.totalVotes.toLocaleString()}
                  </h1>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-300 px-2">
                    Games Submitted :
                  </h2>
                  <h1 className="text-xl font-bold text-green-100 px-2">
                    {grant.games.length}
                  </h1>
                </div>
                <Countdown
                  startTime={grant.startTime}
                  duration={grant.duration}
                />
              </div>
            </div>

            {games && games.length > 0 ? (
              <div className="flex flex-col mb-8 rounded-xl bg-black/40 p-4">
                <h1 className="text-5xl font-bold text-white mb-6">
                  Submissions
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4">
                  {games.map((game, index) => (
                    <CardDemoGame
                      key={index}
                      name={game.name}
                      developer={game.developer}
                      voteCount={Number(game.voteCount)}
                      funding={Number(game.funding) / 10 ** 18}
                      imageURI={game.imageURI}
                      genre={game.genre}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-black/50 rounded-xl">
                <h1 className="text-3xl font-bold text-white">
                  No submissions
                </h1>
              </div>
            )}
          </>
        ) : (
          <p className="text-white text-center">Grant not found.</p>
        )}
      </div>
    </FuturisticBackground>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { intervalToDuration, isAfter } from "date-fns";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface CountdownProps {
  startTime: bigint;
  duration: bigint;
}

function Countdown({ startTime, duration }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(
    intervalToDuration({ start: 0, end: 0 })
  );

  const endDate = new Date(Number(startTime + duration) * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (isAfter(now, endDate)) {
        clearInterval(interval);
      } else {
        setTimeLeft(intervalToDuration({ start: now, end: endDate }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <Card className="flex justify-around text-center p-4 bg-black/40 backdrop-blur-lg text-white rounded-lg">
      <CardContent>
        <h2 className="text-lg font-semibold">Days</h2>
        <p className="text-3xl font-bold">{timeLeft.days ?? 0}</p>
      </CardContent>
      <CardContent>
        <h2 className="text-lg font-semibold">Hours</h2>
        <p className="text-3xl font-bold">{timeLeft.hours ?? 0}</p>
      </CardContent>
      <CardContent>
        <h2 className="text-lg font-semibold">Minutes</h2>
        <p className="text-3xl font-bold">{timeLeft.minutes ?? 0}</p>
      </CardContent>
      <CardContent>
        <h2 className="text-lg font-semibold">Seconds</h2>
        <p className="text-3xl font-bold">{timeLeft.seconds ?? 0}</p>
      </CardContent>
    </Card>
  );
}
