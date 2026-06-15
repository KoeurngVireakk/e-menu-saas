import AppCard from "../components/AppCard";

export default function ChartCard({ title, description, children, action }) {
  return (
    <AppCard title={title} description={description} action={action} bodyClassName="h-72 p-4">
      {children}
    </AppCard>
  );
}
