import { MobileTabNavigation } from 'glowdex';

export const Variants = () => (
  <>
    <MobileTabNavigation activeTab={'analysis'} onTabChange={() => null} />
    <MobileTabNavigation activeTab={'biodiversity'} onTabChange={() => null} />
    <MobileTabNavigation activeTab={'map'} onTabChange={() => null} />
    <MobileTabNavigation activeTab={'menu'} onTabChange={() => null} />
  </>
);
