"use client";
import { createAuthClient } from "better-auth/react";

/**
 * Browser auth client. baseURL defaults to the current origin, so no env is
 * required. Use signUp / signIn / signOut / useSession from here.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
