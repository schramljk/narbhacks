"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";

console.log("[DEBUG] ConvexClientProvider loading...");
console.log("[DEBUG] EXPO_PUBLIC_CONVEX_URL:", process.env.EXPO_PUBLIC_CONVEX_URL);
console.log("[DEBUG] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({ children }) {
  useEffect(() => {
    console.log("[DEBUG] ConvexClientProvider mounted");
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      onError={(error) => {
        console.error("[DEBUG] ClerkProvider error:", error);
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
