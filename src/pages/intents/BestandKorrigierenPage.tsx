/**
 * Bestand korrigieren — 4-Schritt-Wizard.
 * Steps: 1) Artikel wählen → 2) Neue Menge eingeben → 3) Standort und Zustand prüfen → 4) Speichern.
 * Reads: inventar. Writes: inventar (aktualisiert Menge, Standort, Zustand).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldNumber, fieldLookup } from '@/lib/journey';
import { useBestandKorrigierenFlow } from '@/lib/journey/flows/BestandKorrigieren';
import { tx } from '@/i18n';

export default function BestandKorrigierenPage() {
  const [step, setStep] = useState(1);
  const flow = useBestandKorrigierenFlow({
    steps: { inventar: 1, menge: 2, standort: 3, zustand: 3 },
    items: {
      inventar: r => {
        const menge = fieldNumber(r, 'menge');
        const nummer = fieldText(r, 'artikelnummer');
        const standort = fieldText(r, 'standort');
        return {
          id: r.id,
          title: fieldText(r, 'artikelname'),
          subtitle: [nummer, standort].filter(Boolean).join(' · '),
          status: fieldLookup(r, 'zustand') ?? undefined,
          stats: [
            { label: tx('Menge'), value: menge ?? '—' },
            { label: tx('Mindestbestand'), value: fieldNumber(r, 'mindestbestand') ?? '—' },
          ],
        };
      },
    },
  });

  const form = flow.forms.inventar;
  const target = flow.targets.inventar.record;
  const mindest = target ? fieldNumber(target, 'mindestbestand') : null;
  const mengeRaw = form.get('menge');
  const menge = mengeRaw === '' || mengeRaw == null ? null : Number(mengeRaw);
  const unterMindest = mindest != null && menge != null && !Number.isNaN(menge) && menge < mindest;

  return (
    <IntentWizardShell
      title={tx('Bestand korrigieren')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Menge, Standort oder Zustand eines Artikels nach Entnahme, Lieferung oder Inventur anpassen.'),
        needs: [tx('Name oder Nummer des Artikels'), tx('Die gezählte Menge')],
      }}
    >
      <WizardStep label={tx('Artikel wählen')} description={tx('Suche den Artikel, dessen Bestand sich geändert hat.')}>
        <EntitySelectStep
          {...flow.picks.inventar.select}
          {...flow.pick('inventar')}
          searchPlaceholder={tx('Artikelname, Nummer oder Standort …')}
        />
      </WizardStep>

      <WizardStep label={tx('Neue Menge')} heading={tx('Neue Menge eingeben')} description={tx('Wie viel ist jetzt wirklich da?')} needs={['inventar']}>
        <div className="space-y-4">
          {target && (
            <p className="text-sm text-muted-foreground">
              {tx`${fieldText(target, 'artikelname')}: bisher ${fieldNumber(target, 'menge') ?? '—'}, Mindestbestand ${mindest ?? '—'}`}
            </p>
          )}
          <Bound form={form} name="menge" />
          {unterMindest && (
            <p className="text-xs text-destructive">
              {tx`Achtung: Die Menge liegt unter dem Mindestbestand von ${mindest ?? 0}.`}
            </p>
          )}
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Standort und Zustand')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Standort und Zustand')} description={tx('Stimmen Standort und Zustand noch?')} needs={['inventar']}>
        <div className="space-y-4">
          <Bound form={form} name="standort" />
          <Bound form={form} name="zustand" />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Speichern')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Speichern')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Der Artikel wird mit den neuen Werten im Inventar aktualisiert.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          facts={[
            { label: tx('Menge'), value: String(menge ?? '—') },
            { label: tx('Mindestbestand'), value: String(mindest ?? '—') },
          ]}
          next={[
            { label: tx('Weiteren Bestand korrigieren'), onClick: () => { flow.reset(); setStep(1); } },
            { label: tx('Artikel aufnehmen'), href: '#/intents/artikel-aufnehmen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
