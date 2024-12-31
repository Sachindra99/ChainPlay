import React, { useState } from "react";
import abi from "@/app/abi";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/hooks/use-toast";
import { useWriteContract } from "wagmi";
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
import { Label } from "./ui/label";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { PlusCircle } from "lucide-react";
import { ToastAction } from "./ui/toast";

const gameSchema = z.object({
  grantId: z.string().min(1, "Grant ID is required"),
  gameName: z.string().min(1, "Game Name is required"),
  gameDetails: z.string().min(1, "Please enter a valid Description"),
  genre: z.enum(["0", "1", "2", "3", "4", "5"]),
  gameURI: z.string(),
  imageURI: z.string(),
  videoURI: z.string(),
});

type GameFormInputs = z.infer<typeof gameSchema>;

const contractAddress = "0xFfa47E4562D7cc6cDB95a7366E04b644e9DEF000";

const AddGame = () => {
  const { control, handleSubmit } = useForm<GameFormInputs>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      grantId: "",
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
  const { writeContractAsync } = useWriteContract();

  function handleDialogOpen() {
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
  }

  async function submitGame(
    grantId: string,
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
          args: [grantId, name, details, game, image, video, genre],
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
                        `https://evm-testnet.flowscan.io/tx/${data}`,
                        "_blank"
                      );
                    }}
                    altText="Click Here"
                  >
                    FlowScan
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
        description: (error as Error).message,
        variant: "destructive",
      });
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
        data.grantId,
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
        description: (error as Error).message,
        variant: "destructive",
      });
      setSubmitLoading(false);
    }
  };
  return (
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Label htmlFor="grantid">Grant ID</Label>
            <Input
              {...control.register("grantId")}
              id="grantid"
              placeholder="Enter Grant ID"
            />
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
                <Select onValueChange={field.onChange} value={field.value}>
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
            <Label htmlFor="video">Upload Video (less than 25MB)</Label>
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
            <Label htmlFor="game">Upload Game (.zip less than 25MB)</Label>
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
            <button type="submit" disabled={submitLoading} className="w-full">
              {submitLoading ? (
                <HoverBorderGradient>
                  <Loader2 className="animate-spin text-white" size={20} />
                </HoverBorderGradient>
              ) : (
                <HoverBorderGradient>Submit</HoverBorderGradient>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGame;
