import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Kategorien {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    kategoriename?: string;
    beschreibung?: string;
  };
}

export interface Lieferanten {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    firmenname?: string;
    ansprechpartner_vorname?: string;
    ansprechpartner_nachname?: string;
    telefon?: string;
    email?: string;
    webseite?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
  };
}

export interface Inventar {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    artikelname?: string;
    artikelnummer?: string;
    seriennummer?: string;
    kategorie?: RecordUrl; // applookup -> URL zu 'Kategorien' Record
    menge?: number;
    mindestbestand?: number;
    einheit?: LookupValue;
    standort?: string;
    zustand?: LookupValue;
    anschaffungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    anschaffungspreis?: number;
    lieferant?: RecordUrl; // applookup -> URL zu 'Lieferanten' Record
    bild?: string;
    notizen?: string;
  };
}

export const APP_IDS = {
  KATEGORIEN: '6ac6a5c3edd40e745a45d5d1',
  LIEFERANTEN: '6ac6a5c64bc4540336308004',
  INVENTAR: '6ac6a5c79a00da6d50618f93',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'inventar': {
    einheit: [{ key: "stueck", get label() { return lookupLabel('inventar', 'einheit', "stueck") ?? "Stück"; } }, { key: "liter", get label() { return lookupLabel('inventar', 'einheit', "liter") ?? "Liter"; } }, { key: "kilogramm", get label() { return lookupLabel('inventar', 'einheit', "kilogramm") ?? "Kilogramm"; } }, { key: "meter", get label() { return lookupLabel('inventar', 'einheit', "meter") ?? "Meter"; } }, { key: "paar", get label() { return lookupLabel('inventar', 'einheit', "paar") ?? "Paar"; } }, { key: "packung", get label() { return lookupLabel('inventar', 'einheit', "packung") ?? "Packung"; } }, { key: "rolle", get label() { return lookupLabel('inventar', 'einheit', "rolle") ?? "Rolle"; } }, { key: "satz", get label() { return lookupLabel('inventar', 'einheit', "satz") ?? "Satz"; } }],
    zustand: [{ key: "neu", get label() { return lookupLabel('inventar', 'zustand', "neu") ?? "Neu"; } }, { key: "gut", get label() { return lookupLabel('inventar', 'zustand', "gut") ?? "Gut"; } }, { key: "gebraucht", get label() { return lookupLabel('inventar', 'zustand', "gebraucht") ?? "Gebraucht"; } }, { key: "defekt", get label() { return lookupLabel('inventar', 'zustand', "defekt") ?? "Defekt"; } }, { key: "in_reparatur", get label() { return lookupLabel('inventar', 'zustand', "in_reparatur") ?? "In Reparatur"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'kategorien': {
    'kategoriename': 'string/text',
    'beschreibung': 'string/textarea',
  },
  'lieferanten': {
    'firmenname': 'string/text',
    'ansprechpartner_vorname': 'string/text',
    'ansprechpartner_nachname': 'string/text',
    'telefon': 'string/tel',
    'email': 'string/email',
    'webseite': 'string/url',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
  },
  'inventar': {
    'artikelname': 'string/text',
    'artikelnummer': 'string/text',
    'seriennummer': 'string/text',
    'kategorie': 'applookup/select',
    'menge': 'number',
    'mindestbestand': 'number',
    'einheit': 'lookup/select',
    'standort': 'string/text',
    'zustand': 'lookup/radio',
    'anschaffungsdatum': 'date/date',
    'anschaffungspreis': 'number',
    'lieferant': 'applookup/select',
    'bild': 'file',
    'notizen': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateKategorien = StripLookup<Kategorien['fields']>;
export type CreateLieferanten = StripLookup<Lieferanten['fields']>;
export type CreateInventar = StripLookup<Inventar['fields']>;