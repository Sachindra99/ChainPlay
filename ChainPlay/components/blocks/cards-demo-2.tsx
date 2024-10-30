"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CardDemoProps {
  blockieAddress: string;
  grantStatus: string;
  grantCreator: string;
  grantDuration: string;
  backgroundImage: string;
  grantName: string;
  numberOfGames: number;
}

function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

export default function CardDemo({
  grantStatus,
  grantCreator,
  grantDuration,
  backgroundImage,
  grantName,
  numberOfGames,
}: CardDemoProps) {
  const blockieImages = [
    "https://i.imghippo.com/files/cOlw9523BO.png",

    "https://i.imghippo.com/files/QeU4520ND.png",

    "https://i.imghippo.com/files/BuQ4566Pa.png",

    "https://i.imghippo.com/files/WlL8384DIc.png",

    "https://i.imghippo.com/files/uYrO6183aLc.png",
  ];

  // Pick a random URL from the blockieImages array
  const randomBlockieImage =
    blockieImages[Math.floor(Math.random() * blockieImages.length)];

  return (
    <div className="max-w-xs w-full group/card hover:scale-105 transition-all">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm mx-auto flex flex-col justify-between p-4"
        )}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0),rgba(0,0,0,0) 70%, rgba(0, 0, 0, 0.8) 100%), url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
        <div className="flex flex-row items-center space-x-2 z-10 p-2 rounded-xl backdrop-blur-md">
          <Image
            src={randomBlockieImage}
            width={40}
            height={40}
            className="rounded-full"
            alt="blockie"
          />
          <div className="flex flex-col">
            <p className="font-normal text-base text-gray-200 relative z-10">
              {formatAddress(grantCreator)}
            </p>
            <p
              className={`text-sm ${
                grantStatus === "Finalized" ? "text-red-500" : "text-green-500"
              }`}
            >
              {grantStatus}
            </p>
          </div>
        </div>
        <div className="text flex flex-col">
          <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10 text-">
            {grantName}
          </h1>
          <p className="font-normal text-sm text-gray-50 relative z-10 mb-2">
            Participants : {numberOfGames}
          </p>
          <p className="font-normal text-sm text-gray-300 relative z-10">
            Time Left : {grantDuration}
          </p>
        </div>
      </div>
    </div>
  );
}