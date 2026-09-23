import { MenuDrawer } from 'glowdex';

// Fixed right-hand drawer + backdrop: a transformed frame becomes its
// containing block so the open drawer renders inside the card.
const frame = {
  position: 'relative' as const,
  height: 720,
  transform: 'translateZ(0)',
  overflow: 'hidden' as const,
};

export const About = () => (
  <div style={frame}>
    <MenuDrawer isOpen activeItem="about" onClose={() => {}} />
  </div>
);

export const Methods = () => (
  <div style={frame}>
    <MenuDrawer isOpen activeItem="methods" onClose={() => {}} />
  </div>
);
