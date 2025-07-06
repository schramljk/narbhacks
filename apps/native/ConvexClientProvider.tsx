"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";

console.log("[DEBUG] ConvexClientProvider loading...");
console.log("[DEBUG] EXPO_PUBLIC_CONVEX_URL:", process.env.EXPO_PUBLIC_CONVEX_URL);
console.log("[DEBUG] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
console.log("[DEBUG] Creating ConvexReactClient with URL:", convexUrl);

if (!convexUrl || convexUrl.includes('clerk')) {
  console.error("[ERROR] Invalid Convex URL detected! URL contains 'clerk' domain:", convexUrl);
  console.error("[ERROR] Please update EXPO_PUBLIC_CONVEX_URL in .env.local to use your Convex deployment URL");
}

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({ children }) {
  useEffect(() => {
    console.log("[DEBUG] ConvexClientProvider mounted");
    console.log("[DEBUG] Current Convex URL:", convexUrl);
    console.log("[DEBUG] WebSocket will connect to:", convexUrl?.replace('https://', 'wss://'));
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      onError={(error) => {
        console.error("[DEBUG] ClerkProvider error:", error);
      }}
    >
      <ConvexProviderWithClerk 
        client={convex} 
        useAuth={useAuth}
        onError={(error) => {
          console.error("[DEBUG] ConvexProvider error:", error);
          console.error("[DEBUG] Error stack:", error?.stack);
        }}
      >
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
