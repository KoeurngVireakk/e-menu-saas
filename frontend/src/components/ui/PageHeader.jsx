import AppPageHeader from "../../design-system/components/AppPageHeader";

export default function PageHeader({ actions, ...props }) {
  return <div className="mb-6"><AppPageHeader {...props} secondaryActions={actions} /></div>;
}
