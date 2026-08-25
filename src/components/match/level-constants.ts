import type { Database } from "@/types/database";

export type Division = Database["public"]["Enums"]["college_division"];

export interface LevelMeta {
  key: Division;
  label: string;
  full: string;
  emptyHeadline: string;
  emptyBody: string;
}

/**
 * All five levels are first-class, per CLAUDE.md principle 2. The empty copy is
 * the thin-coverage treatment from the Match Engine Direction: say plainly what
 * the data shows, never pad the list and never hide the level.
 */
export const LEVELS: LevelMeta[] = [
  {
    key: "d1",
    label: "D1",
    full: "NCAA Division I",
    emptyHeadline: "No Division I programs loaded",
    emptyBody: "Programs at this level are still being added to the database.",
  },
  {
    key: "d2",
    label: "D2",
    full: "NCAA Division II",
    emptyHeadline: "No Division II programs loaded",
    emptyBody: "Programs at this level are still being added to the database.",
  },
  {
    key: "d3",
    label: "D3",
    full: "NCAA Division III",
    emptyHeadline: "No Division III programs loaded",
    emptyBody: "Programs at this level are still being added to the database.",
  },
  {
    key: "naia",
    label: "NAIA",
    full: "NAIA",
    emptyHeadline: "No NAIA programs in range yet",
    emptyBody:
      "Most NAIA baseball is played in the Midwest and South. Pennsylvania has two NAIA programs and neither New Jersey nor Delaware has any, so this level is thin for players in this region. National coverage arrives with the full program dataset.",
  },
  {
    key: "njcaa",
    label: "JUCO",
    full: "NJCAA (Junior College)",
    emptyHeadline: "JUCO programs are being verified",
    emptyBody:
      "NJCAA Region 19 covers New Jersey, Delaware and eastern Pennsylvania and is a core pathway, not a fallback. The regional membership list is under review with Coach Scanzano before it goes into the database, so these programs are not scored yet.",
  },
];
