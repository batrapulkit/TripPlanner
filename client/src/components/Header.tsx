import { Link } from "wouter";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="text-xl font-bold text-primary">TravelAI</a>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/">
                    <span className="cursor-pointer px-4 py-2">Home</span>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about">
                    <span className="cursor-pointer px-4 py-2">About</span>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/explore">
                    <span className="cursor-pointer px-4 py-2">Explore</span>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Plan</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuList className="grid w-52 gap-1 p-3 bg-white rounded-lg shadow-xl">
                      <NavigationMenuItem>
                        <Link href="/flights">
                          <NavigationMenuLink className="block px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                            ✈️ Flights
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/hotels">
                          <NavigationMenuLink className="block px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                            🏨 Hotels
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/events">
                          <NavigationMenuLink className="block px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                            🎉 Events
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/ar-vr">
                          <NavigationMenuLink className="block px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                            🕶️ AR/VR
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/pricing">
                    <span className="cursor-pointer px-4 py-2">Pricing</span>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/feed">
                    <span className="cursor-pointer px-4 py-2">Feed</span>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Sign Up & Sign In Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/signup">
              <Button variant="default">Sign Up</Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
