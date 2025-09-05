import { Outlet } from "react-router";
export default function NavBar() {
  return (
    <>
      <div className="bg-blue-500 h-2.5"></div>
      <Outlet />
    </>
  );
}
