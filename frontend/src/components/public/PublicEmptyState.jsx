import { ShoppingBag } from "lucide-react";
import { AppEmptyState } from "../../design-system/components";

export default function PublicEmptyState({ title, description, actionLabel, onAction, icon: Icon = ShoppingBag }) {
  return <AppEmptyState icon={Icon} title={title} description={description} actionLabel={actionLabel} onAction={onAction} className="border-dashed" />;
}
