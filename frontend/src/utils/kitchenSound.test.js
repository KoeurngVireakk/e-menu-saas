import { beforeEach, describe, expect, it } from "vitest";
import { getKitchenSoundMuted, setKitchenSoundMuted } from "./kitchenSound";

describe("kitchenSound", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores mute preference in localStorage", () => {
    expect(getKitchenSoundMuted()).toBe(false);
    setKitchenSoundMuted(true);
    expect(getKitchenSoundMuted()).toBe(true);
    setKitchenSoundMuted(false);
    expect(getKitchenSoundMuted()).toBe(false);
  });
});
