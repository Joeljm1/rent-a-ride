import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider} from "react-router";
import { AuthContext } from "./AuthContext";
import { authClient } from "../lib/auth-client.ts";
import { JSX } from "react/jsx-runtime";
import {router} from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Main>
      <RouterProvider router={router} />
    </Main>
  </StrictMode>,
);

function Main({ children }: { children: JSX.Element }) {
  const session = authClient.useSession();
  return <AuthContext value={session}>{children}</AuthContext>;
}

