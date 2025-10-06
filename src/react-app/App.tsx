import { createBrowserRouter } from "react-router";
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
            `/api/cars/vehicleList?${queryParams.toString()}`
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
