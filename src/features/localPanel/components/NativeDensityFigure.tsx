import type { LocalSite } from '@/data/types/local-wetlands.types';
import { SiteConditionChart } from '@/components/widgets/LocalData';
import { usePartners } from '@/api/hooks/usePartners';
import { SITE_TYPE_COLORS } from '../config/panelConfig';
import { comparesSiteTypes, latestYear } from '../utils/siteAvailability';

interface NativeDensityFigureProps {
  site: LocalSite;
}

/** Crab density by site, drawn from local-observations.csv. */
export function NativeDensityFigure({ site }: NativeDensityFigureProps) {
  const { data: partnersData } = usePartners();
  const year = latestYear(site);
  if (year === null) return null;

  const siteTypes = comparesSiteTypes(site);
  const partner = site.partnerId
    ? partnersData?.partners.find((p) => p.id === site.partnerId)
    : undefined;

  return (
    <figure
      className="flex flex-col gap-2.5 rounded-xl border border-gray-200 bg-white p-4"
      data-testid="native-density-chart"
    >
      <div>
        <h3 className="text-[14px] font-bold leading-[1.3] text-gray-900">
          {siteTypes ? 'Crab density by site type' : 'Crab density by site'}
        </h3>
        <p className="mt-1 text-[12.5px] leading-[1.45] text-gray-600">
          Density of mangrove crabs, all species combined, at each{' '}
          {siteTypes ? 'site type' : 'site'} in {year} (crabs per m²). Error
          bars show ±SE; n is the number of samples.
        </p>
      </div>
      <SiteConditionChart
        observations={site.observations}
        year={year}
        colors={SITE_TYPE_COLORS}
      />
      <figcaption className="border-t border-gray-100 pt-2 text-[11.5px] text-gray-500">
        {partner ? `Data: ${partner.institution} · ` : ''}
        {site.name}, {site.country}
      </figcaption>
    </figure>
  );
}
