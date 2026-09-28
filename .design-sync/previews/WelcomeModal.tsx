import { WelcomeModal } from 'glowdex';

// Fixed full-screen dialog: a transformed frame becomes its containing block,
// so the backdrop + dialog render inside the card instead of the viewport.
// It is hidden once dismissed (localStorage 'glowdex_welcome_dismissed').
export const Default = () => {
  try {
    localStorage.removeItem('glowdex_welcome_dismissed');
  } catch {
    /* storage unavailable */
  }
  return (
    <div
      style={{
        position: 'relative',
        height: 640,
        transform: 'translateZ(0)',
        overflow: 'hidden',
      }}
    >
      <WelcomeModal />
    </div>
  );
};
