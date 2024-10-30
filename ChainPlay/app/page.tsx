"use client";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Anchor, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <div>
      <BackgroundBeamsWithCollision className="flex flex-col">
        <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
          Welcome to{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-emerald-500 via-green-500 to-cyan-400 [text-shadow:0_0_rgba(0,0,0,0.1)]">
              <span className="">ChainPlay</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-emerald-500 via-green-500 to-cyan-400 py-4">
              <span className="">ChainPlay</span>
            </div>
          </div>
        </h2>
        <h3 className="text-lg relative z-20 md:text-2xl lg:text-4xl font-bold text-center text-black dark:text-white font-sans tracking-tight my-2">
          Supporting your favorite games using{" "}
          <Highlight className="text-black dark:text-gray-200">
            Quadratic Funding
          </Highlight>
        </h3>
        <div className="flex flex-row space-x-4 my-6">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            onClick={() => router.push("/about")}
          >
            <Bookmark size={24} />
            <span>About Us</span>
          </HoverBorderGradient>
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            onClick={() => router.push("/grants")}
          >
            <Anchor size={24} />
            <span>Grants</span>
          </HoverBorderGradient>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
};

const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.span
      initial={{
        backgroundSize: "0% 100%",
      }}
      animate={{
        backgroundSize: "100% 100%",
      }}
      transition={{
        duration: 1,
        ease: "easeOut",
        delay: 0.25,
      }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        `relative inline-block pb-1   px-1 rounded-lg bg-gradient-to-r from-emerald-300 to-cyan-300 dark:from-emerald-500 dark:to-cyan-500`,
        className
      )}
    >
      {children}
    </motion.span>
  );
};
export default Home;
