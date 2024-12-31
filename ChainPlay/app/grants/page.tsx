"use client";

import React, { useState, useEffect } from "react";
import GrantsBackground from "@/components/ui/GrantsBackground";
import CardDemo from "@/components/blocks/cards-demo-2";
import abi from "@/app/abi";
import { ToastAction } from "@/components/ui/toast";
import {
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { Loader2, CalendarIcon } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const contractAddress = "0xFfa47E4562D7cc6cDB95a7366E04b644e9DEF000";

// Form schema
const FormSchema = z.object({
  name: z.string().nonempty("Grant name is required."),
  amount: z.string().nonempty("Amount is required."),
  lastDate: z
    .date()
    .refine((date) => date > new Date(), {
      message: "Please select a future date.",
    })
    .nullable(),
  image: z.any(),
});

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

export default function Component() {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { handleSubmit, control } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", amount: "", lastDate: null, image: null },
  });

  const { data, refetch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllGrants",
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: "GrantCreated",
    onLogs(data) {
      console.log("Grant created:", data);
      refetch();
    },
  });

  const grantsData = data as Grant[];
  const { writeContractAsync } = useWriteContract();

  async function submitGrant(
    name: string,
    amount: string,
    lastDate: Date,
    image: string
  ) {
    try {
      const amountInWei = BigInt(parseFloat(amount) * 1e18);

      await writeContractAsync(
        {
          address: contractAddress,
          abi: abi,
          functionName: "createGrant",
          args: [
            name,
            amountInWei,
            BigInt(Math.floor((lastDate.getTime() - Date.now()) / 1000)),
            image,
          ],
          value: amountInWei,
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
                description: "Grant created successfully!",
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
        description: "An unknown error occurred",
        variant: "destructive",
      });
      console.error("An unknown error occurred", error);
    }
  }

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

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setSubmitLoading(true);
    if (data.image && data.lastDate) {
      const imgData = new FormData();
      imgData.set("file", data.image);
      const uploadRequest = await fetch("/api/files", {
        method: "POST",
        body: imgData,
      });
      const ipfs = await uploadRequest.json();
      console.log("IPFS:", ipfs);
      await submitGrant(data.name, data.amount, data.lastDate, ipfs);
    } else {
      Error("Please upload an image");
    }

    setSubmitLoading(false);
    setIsModalOpen(false);
  };

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
              <h1 className="text-5xl font-bold text-white">Listed Grants</h1>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <HoverBorderGradient>Create Grant</HoverBorderGradient>
                </DialogTrigger>
                <DialogContent>
                  <h2 className="text-2xl font-bold mb-4">
                    Create a New Grant
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="Name of the Grant" {...field} />
                      )}
                    />
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="Grant Amount"
                          type="number"
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="lastDate"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full text-left"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a Date</span>
                              )}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <Controller
                      name="image"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              field.onChange(e.target.files[0]);
                            }
                          }}
                        />
                      )}
                    />
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
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4">
              {grantsData?.map((grant: Grant, index: number) => (
                <Link href={`/grants/${index}`} key={index}>
                  <CardDemo
                    blockieAddress={grant.creator}
                    grantCreator={grant.creator}
                    grantDuration={timeLeft(grant.duration, grant.startTime)}
                    backgroundImage={grant.grantURI}
                    grantName={grant.name}
                    numberOfGames={grant.games.length}
                    grantStatus={grant.finalized ? "Finalized" : "Active"}
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
