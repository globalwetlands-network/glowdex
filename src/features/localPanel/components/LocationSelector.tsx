import type { ReactNode } from 'react';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type { CountryOption } from '../utils/siteAvailability';

export interface LocationOption {
  site: LocalSite;
  hasResults: boolean;
}

interface LocationSelectorProps {
  continents: string[];
  countries: CountryOption[];
  locations: LocationOption[];
  continent: string;
  country: string;
  siteId: string;
  onContinentChange: (continent: string) => void;
  onCountryChange: (country: string) => void;
  onLocationChange: (siteId: string) => void;
}

const DATA_TO_COME = ' · data to come';

const SELECT_CLASS =
  'h-[38px] w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-2.5 text-[13px] font-medium text-gray-900 focus:border-glowdex-green focus:outline-none focus:ring-[3px] focus:ring-glowdex-green/15 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-[#c0c4cc]';

interface FieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

function Field({ id, label, children }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-500"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Continent → Country → Location cascade. Country is disabled until a
 * continent is chosen, Location until a country is. Countries and locations
 * without results are listed but can't be chosen ("data to come"); a
 * location opened from a map pin still shows as selected.
 */
export function LocationSelector({
  continents,
  countries,
  locations,
  continent,
  country,
  siteId,
  onContinentChange,
  onCountryChange,
  onLocationChange,
}: LocationSelectorProps) {
  const countriesInContinent = countries.filter(
    (c) => c.continent === continent,
  );

  return (
    <div className="grid grid-cols-1 gap-2.5 @lg:grid-cols-3">
      <Field id="local-continent" label="Continent">
        <select
          id="local-continent"
          value={continent}
          onChange={(e) => onContinentChange(e.target.value)}
          className={`${SELECT_CLASS} ${continent ? '' : 'text-gray-400'}`}
        >
          <option value="" disabled>
            Select continent
          </option>
          {continents.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field id="local-country" label="Country">
        <select
          id="local-country"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          disabled={!continent}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            Select country
          </option>
          {countriesInContinent.map((c) => (
            <option key={c.country} value={c.country} disabled={!c.hasResults}>
              {c.country}
              {c.hasResults ? '' : DATA_TO_COME}
            </option>
          ))}
        </select>
      </Field>

      <Field id="local-location" label="Location">
        <select
          id="local-location"
          value={siteId}
          onChange={(e) => onLocationChange(e.target.value)}
          disabled={!country}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            Select location
          </option>
          {locations.map(({ site, hasResults }) => (
            <option key={site.id} value={site.id} disabled={!hasResults}>
              {site.name}
              {hasResults ? '' : DATA_TO_COME}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
