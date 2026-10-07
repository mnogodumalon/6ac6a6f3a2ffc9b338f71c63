// Auto-generated. Per-entity form-enhancements config for "Inventar".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["artikelname", {"row": ["menge", "einheit"], "cols": "1fr 1fr"}, {"row": ["artikelnummer", "seriennummer"], "cols": "1fr 1fr"}, "kategorie", "mindestbestand", "standort", "zustand", {"row": ["anschaffungsdatum", "anschaffungspreis"], "cols": "1fr 1fr"}, "lieferant", "notizen"],
  defaults: {
    'menge': { kind: 'literal', value: 1 },
    'einheit': { kind: 'lookup', key: 'stueck', label: 'Stück' },
    'zustand': { kind: 'lookup', key: 'neu', label: 'Neu' },
    'anschaffungsdatum': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
