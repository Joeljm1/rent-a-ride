import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-1 flex w-full shadow-md dark:shadow-lg transition-colors ">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
