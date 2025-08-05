
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricsGrid from "@/components/MetricsGrid";
import DashboardTabs from "@/components/DashboardTabs";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MetricsGrid />
        <DashboardTabs />
      </div>
    </DashboardLayout>
  );
};

export default Index;
