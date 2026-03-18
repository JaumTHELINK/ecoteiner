import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
