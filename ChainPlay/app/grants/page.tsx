"use client";
import React, { useState, useEffect } from "react";
import GrantsBackground from "@/components/ui/GrantsBackground";
import abi from "@/app/abi";
import CardDemo from "@/components/blocks/cards-demo-2";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

const contractAddress = "0xb8c26348fD46D55004207412bCC8D61BdF380F74";

export default function GrantsPage() {
  const account = useAccount();
  const result = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllGrants",
  });

  return (
    <GrantsBackground>
      {result.data?.map((grant, index)  => (
        <CardDemo
          key={index}
          blockieAddress={grant.creator}
          grantCreator={grant.creator}
          grantDuration={`${(grant.duration / 3600n).toString()} hours`}
          backgroundImage={grant.grantURI}
          grantName={grant.name}
          numberOfGames={grant.games.length}
        />
      ))}
    </GrantsBackground>
  );
}
