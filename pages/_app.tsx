import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CLIENT_ID } from "@/constants/googleAuth";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity },
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <div className="px-36">
            <Header />
            <Component {...pageProps} />
          </div>
        </QueryClientProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  );
}
