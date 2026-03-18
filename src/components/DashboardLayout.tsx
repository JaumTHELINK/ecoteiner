import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import ProtectedRoute from "./ProtectedRoute";

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="min-h-screen p-4 pt-16 lg:ml-60 lg:p-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
