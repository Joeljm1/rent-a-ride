import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  // BrowserRouter,
  // Route,
  // Routes,
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import "./index.css";
import App from "./App.tsx";
import Register from "./Register.tsx";
import Login from "./Login.tsx";
import FileUploader from "./pages/fileUploaderPage.tsx";
import { AuthContext } from "./AuthContext";
import { authClient } from "../lib/auth-client.ts";
import NavBar from "./components/NavBar.tsx";
import { JSX } from "react/jsx-runtime";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "upload",
        element: <FileUploader />,
      },
    ],
  },
]);

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

// function Main() {
//   const session = authClient.useSession();
//   return (
//     <AuthContext value={session}>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<NavBar />}>
//             <Route index element={<App />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/login" element={<Login />} />
//           </Route>
//         </Routes>
//       </BrowserRouter>
//     </AuthContext>
//   );
// }
