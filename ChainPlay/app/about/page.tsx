"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
export default function AboutPage() {
  const router = useRouter();
  return (
    <div className="relative min-h-[92vh] overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 max-h-[92vh] w-[120%] object-cover"
      >
        <source src="/AboutBackground.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-[92vh]">
        {/* Main Content */}
        <main className="container mx-auto px-4 text-center text-white">
          <Highlight className="text-5xl">About ChainPlay</Highlight>

          <p className="text-xl md:text-2xl mb-8 mt-8 max-w-2xl mx-auto">
            ChainPlay is a revolutionary platform designed to support niche game
            developers by providing them with the necessary funding to bring
            their games to life. The platform uses Quadratic Funding to ensure
            that the most deserving projects receive the most support.
          </p>
          <Button
            onClick={() => router.push("/grants")}
            size="lg"
            className="bg-white text-black hover:bg-green-500 hover:text-white transition-all"
          >
            Get Started
          </Button>
        </main>
      </div>
    </div>
  );
}
