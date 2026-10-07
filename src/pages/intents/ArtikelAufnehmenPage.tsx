/**
 * Artikel aufnehmen — 4-Schritt-Wizard.
 * Steps: 1) Kategorie wählen → 2) Lieferant wählen → 3) Artikeldaten eingeben → 4) Prüfen & speichern.
 * Reads: kategorien, lieferanten. Writes: inventar (via useArtikelAufnehmenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText } from '@/lib/journey';
import { useArtikelAufnehmenFlow } from '@/lib/journey/flows/ArtikelAufnehmen';
import { tx } from '@/i18n';

export default function ArtikelAufnehmenPage() {
  const [step, setStep] = useState(1);
  const flow = useArtikelAufnehmenFlow({
    steps: {
      kategorie: 1, lieferant: 2,
      artikelname: 3, artikelnummer: 3, seriennummer: 3, menge: 3, mindestbestand: 3,
      einheit: 3, standort: 3, zustand: 3, anschaffungspreis: 3,
    },
    items: {
      kategorie: r => ({ id: r.id, title: fieldText(r, 'kategoriename') }),
      lieferant: r => ({ id: r.id, title: fieldText(r, 'firmenname'), subtitle: fieldText(r, 'ort') }),
    },
  });
  const f = flow.forms.inventar;

  return (
    <IntentWizardShell
      title={tx('Artikel aufnehmen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen neuen Artikel mit Kategorie und Lieferant im Inventar erfassen.'),
        needs: [tx('Artikelname und Menge'), tx('Kategorie und Lieferant müssen bereits existieren')],
      }}
    >
      <WizardStep label={tx('Kategorie')} description={tx('Zu welcher Kategorie gehört der Artikel?')}>
        <EntitySelectStep {...flow.picks.kategorie.select} {...flow.pick('kategorie')}
          searchPlaceholder={tx('Kategorie suchen …')} />
      </WizardStep>
      <WizardStep label={tx('Lieferant')} description={tx('Von welchem Lieferanten kommt der Artikel?')}>
        <EntitySelectStep {...flow.picks.lieferant.select} {...flow.pick('lieferant')}
          searchPlaceholder={tx('Firma oder Ort suchen …')} />
      </WizardStep>
      <WizardStep label={tx('Artikeldaten')} description={tx('Name, Bestand und Lagerort des Artikels angeben.')}>
        <div className="space-y-4">
          <Bound form={f} name="artikelname" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Bound form={f} name="artikelnummer" />
            <Bound form={f} name="seriennummer" />
            <Bound form={f} name="menge" />
            <Bound form={f} name="mindestbestand" />
          </div>
          <Bound form={f} name="einheit" />
          <Bound form={f} name="standort" />
          <Bound form={f} name="zustand" />
          <Bound form={f} name="anschaffungspreis" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Der Artikel wird mit dem heutigen Datum als Anschaffungsdatum im Inventar angelegt.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Bestand korrigieren'), href: '#/intents/bestand-korrigieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
