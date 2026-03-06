import type { SlotPlugin, SlotPanelPosition } from "../types";
import { getSettings } from "../plugin-settings";
import { debug } from "../logger";

let slotPlugins: SlotPlugin[] = [];

function isSlotPlugin(val: unknown): val is SlotPlugin {
  return (
    typeof val === "object" &&
    val !== null &&
    "id" in val &&
    typeof (val as SlotPlugin).id === "string" &&
    "name" in val &&
    typeof (val as SlotPlugin).name === "string" &&
    "position" in val &&
    ["above-results", "below-results", "sidebar"].includes(
      (val as SlotPlugin).position as SlotPanelPosition,
    ) &&
    "trigger" in val &&
    typeof (val as SlotPlugin).trigger === "function" &&
    "execute" in val &&
    typeof (val as SlotPlugin).execute === "function"
  );
}

export async function initSlotPlugins(): Promise<void> {
  const { readdir } = await import("fs/promises");
  const { join } = await import("path");
  const { pathToFileURL } = await import("url");
  const pluginDir =
    process.env.DEGOOG_PLUGINS_DIR ?? join(process.cwd(), "data", "plugins");
  slotPlugins = [];

  try {
    const files = await readdir(pluginDir);
    for (const file of files) {
      if (!/\.(js|ts|mjs|cjs)$/.test(file)) continue;
      try {
        const fullPath = join(pluginDir, file);
        const url = pathToFileURL(fullPath).href;
        const mod = await import(url);
        const slot = mod.slot ?? mod.slotPlugin ?? mod.default?.slot;
        if (!slot || !isSlotPlugin(slot)) continue;
        if (slot.settingsSchema?.length && slot.configure) {
          try {
            const stored = await getSettings(`slot-${slot.id}`);
            if (Object.keys(stored).length > 0) slot.configure(stored);
          } catch (err) {
            debug("slots", `Failed to configure slot plugin: ${slot.id}`, err);
          }
        }
        slotPlugins.push(slot);
      } catch (err) {
        debug("slots", `Failed to load slot plugin: ${file}`, err);
      }
    }
  } catch (err) {
    debug("slots", `Failed to read slot plugin directory`, err);
  }
}

export function getSlotPlugins(): SlotPlugin[] {
  return [...slotPlugins];
}

export function getSlotPluginById(slotId: string): SlotPlugin | null {
  return slotPlugins.find((p) => p.id === slotId) ?? null;
}
