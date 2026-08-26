/**
 * The shape of a lead, defined once.
 *
 * The form renders from this, the server action validates against it, and the
 * database constrains the same limits again. Three layers on purpose: the
 * middle one is the only one a visitor sees, and the last one is the only one
 * that actually holds.
 */

export const GRAD_YEARS = [2026, 2027, 2028, 2029, 2030, 2031] as const;

export const POSITIONS = [
  "Pitcher RHP",
  "Pitcher LHP",
  "Catcher",
  "First base",
  "Second base",
  "Third base",
  "Shortstop",
  "Outfield",
  "Two-way",
  "Utility",
] as const;

export const LEVELS = [
  "High school varsity",
  "High school JV",
  "Travel or club only",
  "Post-grad",
  "JUCO",
  "Not playing organised ball yet",
] as const;

export interface LeadValues {
  playerFirstName: string;
  playerLastName: string;
  gradYear: string;
  position: string;
  currentLevel: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  notes: string;
}

export const EMPTY_LEAD: LeadValues = {
  playerFirstName: "",
  playerLastName: "",
  gradYear: "",
  position: "",
  currentLevel: "",
  parentName: "",
  parentEmail: "",
  parentPhone: "",
  notes: "",
};

export type LeadErrors = Partial<Record<keyof LeadValues | "form", string>>;

/**
 * Phone numbers are stored as typed, not normalised into a format the family
 * did not write. A human is going to dial this, and a human reads
 * (609) 555-0134 more reliably than 6095550134. Validation only checks that
 * there are enough digits to be a real number.
 */
function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

export function validateLead(values: LeadValues): LeadErrors {
  const errors: LeadErrors = {};

  if (!values.playerFirstName.trim()) {
    errors.playerFirstName = "Add the player's first name.";
  } else if (values.playerFirstName.trim().length > 80) {
    errors.playerFirstName = "That is longer than we can store.";
  }

  if (!values.playerLastName.trim()) {
    errors.playerLastName = "Add the player's last name.";
  } else if (values.playerLastName.trim().length > 80) {
    errors.playerLastName = "That is longer than we can store.";
  }

  const year = Number(values.gradYear);
  if (!values.gradYear) {
    errors.gradYear = "Pick a graduation year.";
  } else if (!Number.isInteger(year) || year < 2020 || year > 2040) {
    errors.gradYear = "Pick a graduation year from the list.";
  }

  if (!values.position) {
    errors.position = "Pick a position.";
  } else if (!POSITIONS.includes(values.position as (typeof POSITIONS)[number])) {
    errors.position = "Pick a position from the list.";
  }

  if (!values.currentLevel) {
    errors.currentLevel = "Pick where he is playing now.";
  } else if (!LEVELS.includes(values.currentLevel as (typeof LEVELS)[number])) {
    errors.currentLevel = "Pick a level from the list.";
  }

  if (!values.parentName.trim()) {
    errors.parentName = "Add a parent or guardian name.";
  } else if (values.parentName.trim().length > 120) {
    errors.parentName = "That is longer than we can store.";
  }

  const email = values.parentEmail.trim();
  if (!email) {
    errors.parentEmail = "Add an email we can reach you at.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    errors.parentEmail = "That email does not look right. Check it over.";
  }

  const phone = values.parentPhone.trim();
  if (!phone) {
    errors.parentPhone = "Add a phone number. This is a call, not an email.";
  } else if (digitCount(phone) < 10 || phone.length > 40) {
    errors.parentPhone = "Add a full phone number including area code.";
  }

  if (values.notes.trim().length > 1000) {
    errors.notes = "Keep this under 1000 characters.";
  }

  return errors;
}

export function readLead(formData: FormData): LeadValues {
  const get = (name: string) => String(formData.get(name) ?? "");
  return {
    playerFirstName: get("playerFirstName"),
    playerLastName: get("playerLastName"),
    gradYear: get("gradYear"),
    position: get("position"),
    currentLevel: get("currentLevel"),
    parentName: get("parentName"),
    parentEmail: get("parentEmail"),
    parentPhone: get("parentPhone"),
    notes: get("notes"),
  };
}

/**
 * Form state, defined here rather than beside the action.
 *
 * A "use server" module may only export async functions: anything else is
 * stripped, and the constant arrives on the client as undefined. That cost a
 * 500 on the first render of the form, which is the kind of thing a type
 * checker cannot see because the export is real, it just does not survive the
 * boundary.
 */
export interface LeadState {
  status: "idle" | "error" | "sent";
  errors: LeadErrors;
  values: LeadValues;
  /** Echoed back on success so the confirmation can name the player. */
  sent?: { playerName: string; parentName: string };
}

export const INITIAL_LEAD_STATE: LeadState = {
  status: "idle",
  errors: {},
  values: EMPTY_LEAD,
};
