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
import VehiclesPage from "./pages/VehiclesPage.tsx";
import VehicleDetailsPage from "./pages/VehicleDetailsPage.tsx";

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
      {
        path: "/vehicles",
        element: <VehiclesPage />,
        loader: async ({ request }) => {
          const url = new URL(request.url);
          let page = parseInt(url.searchParams.get("page") || "1");
          let pageSize = parseInt(url.searchParams.get("pageSize") || "2");

          if (isNaN(page)) {
            page = 1;
          }
          if (isNaN(pageSize)) {
            pageSize = 10;
          }

          const queryParams = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
          });

          const brand = url.searchParams.get("brand");
          const fuelType = url.searchParams.get("fuelType");
          const transmission = url.searchParams.get("transmission");
          const minSeats = url.searchParams.get("minSeats");
          const sortBy = url.searchParams.get("sortBy");
          const search = url.searchParams.get("search");

          if (brand) queryParams.set("brand", brand);
          if (fuelType) queryParams.set("fuelType", fuelType);
          if (transmission) queryParams.set("transmission", transmission);
          if (minSeats) queryParams.set("minSeats", minSeats);
          if (sortBy) queryParams.set("sortBy", sortBy);
          if (search) queryParams.set("search", search);

          const resp = await fetch(
            `/api/cars/vehicleList?${queryParams.toString()}`,
          );
          if (!resp.ok) {
            //TODO: handle thrown error
            console.log("error");
            throw new Response("Failed to fetch vehicle list", {
              status: resp.status,
            });
          }
          return resp.json();
        },
      },
      {
        path: "/vehicles/:id",
        element: <VehicleDetailsPage />,
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
