"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import * as React from "react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { silkScreen } from "../layout"

export function SiteNavbar() {
  return (
<header className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border/30">      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className={`${silkScreen.className} text-4xl font-bold text-slate-500`}>
          MountIng
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
          <NavigationMenuItem>
                <NavigationMenuLink
                        href="/maps"
                    className={cn(
                        "rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
                    )}
                    >
                  Maps
                </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Components mega menu */}
            <NavigationMenuItem>
                <NavigationMenuLink
                        href="/breathing"
                    className={cn(
                        "rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
                    )}
                    >
                  Altitude
                </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Docs menu */}
            <NavigationMenuItem>
                <NavigationMenuLink
                        href="/docs"
                    className={cn(
                        "rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
                    )}
                    >
                  Docs
                </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Simple list */}
            <NavigationMenuItem>
                <NavigationMenuLink
                        href="/list"
                    className={cn(
                        "rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
                    )}
                    >
                  List
                </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Example with icons in label */}
            <NavigationMenuItem>
                <SignedOut>
                    <div className="flex gap-4">
                        <SignInButton mode="modal">
                        <button className="px-4 py-2 text-sm font-normal text-foreground hover:text-accent-foreground transition-colors">
                            Sign in
                        </button>
                        </SignInButton>
                    </div>
                </SignedOut>

                <SignedIn>
                <div className="flex items-center gap-4">
                    <UserButton />
                </div>
                </SignedIn>

              <NavigationMenuContent>

              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuIndicator />
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}

// type ListItemProps = {
//   title?: React.ReactNode
//   children?: React.ReactNode
//   href: string
// }

// const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps & React.ComponentPropsWithoutRef<"a">>(
//   ({ className, title, children, href, ...props }, ref) => {
//     return (
//       <li>
//         {/* <Link href={href} legacyBehavior passHref>
//           <NavigationMenuLink
//             ref={ref}
//             className={cn(
//               "rounded-md p-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
//               className,
//             )}
//             {...props}
//           >
//             <div className="text-sm font-medium leading-none">{title}</div>
//             {children ? (
//               <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">{children}</p>
//             ) : null}
//           </NavigationMenuLink>
//         </Link> */}
//       </li>
//     )
//   },
// )
// ListItem.displayName = "ListItem"

// function DocItem({
//   icon,
//   title,
//   desc,
//   href,
// }: {
//   icon: React.ReactNode
//   title: string
//   desc: string
//   href: string
// }) {
//   return (
//     <Link href={href} className="rounded-md border p-3 hover:bg-accent/30">
//       <div className="flex items-start gap-3">
//         <div className="rounded-md border p-2">{icon}</div>
//         <div>
//           <p className="text-sm font-medium">{title}</p>
//           <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{desc}</p>
//         </div>
//       </div>
//     </Link>
//   )
// }
