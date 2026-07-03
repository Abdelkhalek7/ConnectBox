"use client";

import { SessionProvider } from "next-auth/react";

import { ReactNode } from "react";
import { Session } from "next-auth";

interface ProviderProps {
  children: ReactNode;
  session?: Session | null;
}

const Provider = ({ children, session }: ProviderProps) => (
  <SessionProvider session={session}>{children}</SessionProvider>
);

export default Provider;
