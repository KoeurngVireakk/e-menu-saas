import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

export async function expectNoCriticalViolations(page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((item) => item.impact === "critical")).toEqual([]);
}
