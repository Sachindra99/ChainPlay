"use client";
import React, { useState, useEffect } from "react";
import GrantsBackground from "@/components/ui/GrantsBackground";
import abi from "@/app/abi";
import CardDemo from "@/components/blocks/cards-demo-2";
import { getConfig } from "@/app/config";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

const contractAddress = "0xb8c26348fD46D55004207412bCC8D61BdF380F74";

export default function GrantsPage() {
  const config = getConfig();
  const account = useAccount();
  const { data } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllGrants",
  });
  console.log("Data :",data);

  return (
    <GrantsBackground>
      <CardDemo />
    </GrantsBackground>
  );
}
