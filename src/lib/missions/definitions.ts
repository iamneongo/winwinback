import { DEFAULT_MISSIONS, type Mission } from "./catalog";

/** The mission catalog is fixed in code; admin can review claims, not edit rules. */
export async function listMissions(): Promise<Mission[]> {
  return DEFAULT_MISSIONS.filter((mission) => mission.active);
}

export async function getMission(key: string): Promise<Mission | null> {
  return DEFAULT_MISSIONS.find((mission) => mission.key === key && mission.active) ?? null;
}
