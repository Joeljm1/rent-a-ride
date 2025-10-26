import { createBrowserRouter } from "react-router";
import client from "./lib/client.ts";
import "/index.css";
import Home from "./pages/Home.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import FileUploader from "./pages/fileUploaderPage.tsx";
import Layout from "./components/Layout.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import VehiclesPage from "./pages/Vehicle/VehiclesPage.tsx";
import VehicleDetailsPage from "./pages/Vehicle/VehicleDetailsPage.tsx";
import HostLayout from "./pages/Host/HostLayout.tsx";
import Dashboard from "./pages/Host/Dashboard.tsx";
import ManageVehicles from "./pages/Host/ManageVehicles.tsx";
import HostBookings from "./pages/Host/HostBookings.tsx";
import HostEarnings from "./pages/Host/HostEarnings.tsx";
import HostProfile from "./pages/Host/HostProfile.tsx";
import HostPendingRequests from "./pages/Host/HostPendingRequests.tsx";
import AIChat from "./pages/AIChat.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "upload",
        element: <FileUploader />,
      },
      {
        path: "ai-chat",
        element: <AIChat />,
      },
      {
        path: "/vehicles",
        element: <VehiclesPage />,
        loader: async ({ request }) => {
          const url = new URL(request.url);

          type qp = Parameters<
            Awaited<typeof client.api.cars.vehicleList.$get>
          >[0];

          const queryParams: qp = {
            query: {},
          };

          const page = url.searchParams.get("page");
          const pageSize = url.searchParams.get("pageSize");
          const brand = url.searchParams.get("brand");
          const fuelType = url.searchParams.get("fuelType");
          const transmission = url.searchParams.get("transmission");
          const minSeats = url.searchParams.get("minSeats");
          const sortBy = url.searchParams.get("sortBy");
          const search = url.searchParams.get("search");

          if (page) queryParams["query"]["page"] = page;
          if (pageSize) queryParams["query"]["pageSize"] = pageSize;
          if (brand) queryParams["query"]["brand"] = brand;
          if (fuelType) queryParams["query"]["fuelType"] = fuelType;
          if (transmission) queryParams["query"]["transmission"] = transmission;
          if (minSeats) queryParams["query"]["minSeats"] = minSeats;
          if (sortBy) queryParams["query"]["sortBy"] = sortBy;
          if (search) queryParams["query"]["search"] = search;

          const re = await client.api.cars.vehicleList.$get({
            query: { ...queryParams["query"] },
          });
          if (!re.ok) {
            //TODO: handle thrown error
            console.log("error");
            throw new Response("Failed to fetch vehicle list", {
              status: re.status,
            });
          }
          return re.json();
        },
      },
      {
        path: "/vehicles/:id",
        element: <VehicleDetailsPage />,
      },
      {
        path: "host",
        element: <HostLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "vehicles",
            element: <ManageVehicles />,
          },
          {
            path: "upload",
            element: <FileUploader />,
          },
          {
            path: "bookings",
            element: <HostBookings />,
          },
          {
            path: "earnings",
            element: <HostEarnings />,
          },
          {
            path: "profile",
            element: <HostProfile />,
          },
          {
            path: "pending-requests",
            element: <HostPendingRequests />, 
          }
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

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
