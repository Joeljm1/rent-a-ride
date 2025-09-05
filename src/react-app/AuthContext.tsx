import { createContext } from "react";
import { authClient } from "../lib/auth-client";

type SessionType = ReturnType<typeof authClient.useSession>;
export const AuthContext = createContext<SessionType | null>(null);
