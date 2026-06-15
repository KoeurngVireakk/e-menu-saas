import { confirmAction } from "./alerts";

export async function confirmDanger(title = "Are you sure?", text = "This action cannot be undone.") {
  return confirmAction(title, text);
}
