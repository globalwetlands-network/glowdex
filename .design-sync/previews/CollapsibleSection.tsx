import { CollapsibleSection, CrabIcon } from 'glowdex';

// CrabIcon is one of the DS's own icons; CollapsibleSection accepts any
// ComponentType<{ className?: string }> as its `icon`.
export const Open = () => (
  <div style={{ maxWidth: 320 }}>
    <CollapsibleSection title="Biodiversity" icon={CrabIcon} defaultOpen>
      <p className="text-sm text-gray-600">
        Section body content goes here — charts, legends, or any nodes.
      </p>
    </CollapsibleSection>
  </div>
);

export const Collapsed = () => (
  <div style={{ maxWidth: 320 }}>
    <CollapsibleSection title="Habitat detail" icon={CrabIcon}>
      <p className="text-sm text-gray-600">Hidden until expanded.</p>
    </CollapsibleSection>
  </div>
);
