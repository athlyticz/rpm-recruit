import {
  LayoutDashboard,
  User,
  Activity,
  GraduationCap,
  Gauge,
  Target,
  Mail,
  Wallet,
  ListChecks,
  FileText,
  Timer,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Shortened label for the phone tab bar, where space is tight. */
  shortLabel?: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Profile",
    items: [
      { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
      { href: "/profile", label: "Player Info", shortLabel: "Player", icon: User },
      { href: "/athletic", label: "Athletic Profile", shortLabel: "Athletic", icon: Activity },
      { href: "/academics", label: "Academics & NCAA", shortLabel: "Academics", icon: GraduationCap },
      { href: "/scores", label: "Position Scores", shortLabel: "Scores", icon: Gauge },
    ],
  },
  {
    label: "Recruiting",
    items: [
      { href: "/college-match", label: "College Match", shortLabel: "Match", icon: Target },
      { href: "/letter-builder", label: "Letter Builder", shortLabel: "Letters", icon: Mail },
      { href: "/cost-tracker", label: "Cost Tracker", shortLabel: "Costs", icon: Wallet },
      { href: "/checklist", label: "Checklist & Q&A", shortLabel: "Checklist", icon: ListChecks },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/bio-generator", label: "Bio Draft Builder", shortLabel: "Bio", icon: FileText },
      { href: "/pitch-log", label: "Pitching Log", shortLabel: "Pitching", icon: Timer },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

/**
 * The four destinations that earn a permanent slot on the phone tab bar.
 * Everything else lives behind More, which opens the full menu.
 */
export const PRIMARY_TAB_HREFS = ["/dashboard", "/college-match", "/scores", "/checklist"];

export const PRIMARY_TABS: NavItem[] = PRIMARY_TAB_HREFS.map(
  (href) => ALL_NAV_ITEMS.find((item) => item.href === href)!
);

export const SECONDARY_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter(
  (item) => !PRIMARY_TAB_HREFS.includes(item.href)
);
