"use client";

import * as React from "react";
import Link from "next/link";
import { Gamepad2, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
const contractAddress = "0x44378e1beefC422568ABa878c74168369e4840C6";

import { useReadContract } from "wagmi";
import abi from "@/app/abi";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

const gameCategories = [
  { title: "Action", href: "/gamezone/Action" },
  { title: "Adventure", href: "/gamezone/Adventure" },
  { title: "RPG", href: "/gamezone/RPG" },
  { title: "Strategy", href: "/gamezone/Strategy" },
  { title: "Sports", href: "/gamezone/Sports" },
  { title: "Puzzle", href: "/gamezone/Puzzle" },
];

export default function Navbar() {
  const { data } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllGames",
  });
  const gamesData = data as Game[] | undefined;

  const [query, setQuery] = React.useState("");
  const [filteredGames, setFilteredGames] = React.useState<Game[]>([]);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (query.trim() !== "" && gamesData) {
      const results = gamesData.filter((game) =>
        game.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGames(results);
      setPopoverOpen(true);
    } else {
      setFilteredGames([]);
      setPopoverOpen(false);
    }
  }, [query, gamesData]);

  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[7vh] items-center">
        <div className="mr-4 hidden md:flex">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2"
            prefetch={false}
          >
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">ChainPlay</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger onClick={() => router.push("/games")}>
                  Games
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {gameCategories.map((category) => (
                      <ListItem
                        key={category.title}
                        title={category.title}
                        href={category.href}
                      />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/grants" legacyBehavior passHref prefetch={false}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Grants
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <Input
                  type="search"
                  placeholder="Search games..."
                  className="h-9 md:w-[300px] lg:w-[300px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </PopoverTrigger>
            {filteredGames.length > 0 && (
              <PopoverContent
                align="start"
                className="w-[300px] bg-zinc-900 border border-gray-700 rounded-lg shadow-lg"
              >
                <ul>
                  {filteredGames.map((game, index) => (
                    <li
                      key={game.gameURI}
                      className="p-2 hover:bg-zinc-700 cursor-pointer text-white"
                      onClick={() => {
                        router.push(`/games/${index + 1}`);
                        setPopoverOpen(false);
                      }}
                    >
                      <span className="font-medium">{game.name}</span>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            )}
          </Popover>

          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          <ConnectButton chainStatus="none" accountStatus="full" />
        </div>
      </div>
    </header>
  );
}

// Additional Components: MobileNav and ListItem

function MobileNav() {
  return (
    <div className="flex flex-col space-y-4">
      <Link href="/" className="flex items-center space-x-2">
        <Gamepad2 className="h-6 w-6 text-primary" />
        <span className="font-bold">ChainPlay</span>
      </Link>
      <nav className="flex flex-col space-y-2">
        <Link
          href="/games"
          className="text-sm font-medium hover:text-primary transition-colors"
          prefetch={false}
        >
          Games
        </Link>
        <Link
          href="/marketplace"
          className="text-sm font-medium hover:text-primary transition-colors"
          prefetch={false}
        >
          Marketplace
        </Link>
        <ConnectButton showBalance={false} accountStatus="avatar" />
      </nav>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
