import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import ProtectedRoute from "./ProtectedRoute";

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="ml-60 min-h-screen p-8">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
