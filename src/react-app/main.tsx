import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import Register from "./Register.tsx";
import Login from "./Login.tsx";
import { AuthContext } from "./AuthContext";
import { authClient } from "../lib/auth-client.ts";
import NavBar from "./NavBar.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);

function Main() {
  const session = authClient.useSession();
  return (
    <AuthContext value={session}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NavBar />}>
            <Route index element={<App />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext>
  );
}
