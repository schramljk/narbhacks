"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "./common/Logo";
import Link from "next/link";
import { useUser } from "@clerk/clerk-react";
import { UserNav } from "./common/UserNav";
import { usePathname } from "next/navigation";
import { Button } from "@/components/common/button";
import { BookOpen, Calendar, Menu, X } from "lucide-react";

type NavigationItem = {
  name: string;
  href: string;
  current: boolean;
};

const navigation: NavigationItem[] = [
  { name: "Features", href: "#Benefits", current: true },
  { name: "Testimonials", href: "#reviews", current: false },
];

export default function Header() {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Logo />
              </div>

              {/* Desktop Navigation - Only for non-logged-in users */}
              {pathname === "/" && !user && (
                <div className="hidden md:flex items-center space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.querySelector(item.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    <Button asChild size="sm" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200">
                      <Link href="/notes" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Daily Journal
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200">
                      <Link href="/habits" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Habit Tracker
                      </Link>
                    </Button>
                    <UserNav
                      image={user?.imageUrl}
                      name={user?.fullName!}
                      email={user?.primaryEmailAddress?.emailAddress!}
                    />
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/notes">
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/notes">
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <DisclosurePanel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              {!user && navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="button"
                  onClick={() => {
                    const element = document.querySelector(item.href);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  {item.name}
                </DisclosureButton>
              ))}
              
              {user ? (
                <div className="pt-4 space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/notes" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Daily Journal
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href="/habits" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Habit Tracker
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="pt-4 space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/notes">
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href="/notes">
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
