import AppCard from "../components/AppCard";

export default function ChartCard({ title, description, children, action }) {
  return (
    <AppCard title={title} description={description} action={action} bodyClassName="h-72 min-w-0 overflow-hidden p-4 sm:h-80">
      {children}
    </AppCard>
  );
}
