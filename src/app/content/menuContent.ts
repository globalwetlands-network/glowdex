export const PARTNERS = [
  { name: 'Griffith University', region: 'Australia' },
  { name: 'University of Tasmania', region: 'Australia' },
  { name: 'University of the Western Cape', region: 'South Africa' },
  { name: 'Nelson Mandela University', region: 'South Africa' },
  { name: 'Universidad de Costa Rica', region: 'Costa Rica' },
  { name: 'University of Aveiro', region: 'Portugal' },
  {
    name: 'Indian Institute of Science Education and Research',
    region: 'India',
  },
  { name: 'Katala Foundation', region: 'Philippines' },
  { name: 'World Academy of Sustainable Development', region: 'International' },
  { name: 'Universidade Eduardo Mondlane', region: 'Mozambique' },
  {
    name: 'Western Indian Ocean Mangrove Network',
    region: 'Indian Ocean Region',
  },
  { name: 'Bôndy International', region: 'International' },
  { name: 'University of Warwick', region: 'United Kingdom' },
  { name: 'Universidade do Estado do Rio de Janeiro', region: 'Brazil' },
  { name: 'Universitas Gadjah Mada', region: 'Indonesia' },
  { name: 'WWF', region: 'International' },
  { name: 'University of Southern Denmark', region: 'Denmark' },
  { name: 'National Environment Management Council', region: 'Tanzania' },
] as const;

export const REFERENCES = [
  {
    id: 1,
    citation: 'Sievers et al. (in review). Ecological Indicators.',
    url: null,
  },
  {
    id: 2,
    citation: 'Bunting et al. (2018). Remote Sensing, 10(10), 1669.',
    url: 'https://www.mdpi.com/2072-4292/10/10/1669',
  },
  {
    id: 3,
    citation:
      'Hamilton & Casey (2016). Global Ecology and Biogeography, 25(5), 545–558.',
    url: 'https://onlinelibrary.wiley.com/doi/full/10.1111/geb.12449',
  },
  {
    id: 4,
    citation: 'Hamilton (2015). Harvard Dataverse.',
    url: 'https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/HKGBGS',
  },
  {
    id: 5,
    citation: 'Simard et al. (2019). Nature Geoscience, 12, 40–45.',
    url: 'https://www.nature.com/articles/s41561-018-0279-1',
  },
  {
    id: 6,
    citation:
      'Sanderman et al. (2018). Environmental Research Letters, 13(5), 055002.',
    url: 'https://iopscience.iop.org/article/10.1088/1748-9326/aabe1c/meta',
  },
  {
    id: 7,
    citation: 'Sanderman (2017). Harvard Dataverse.',
    url: 'https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/OCYUIT',
  },
  {
    id: 8,
    citation: 'Thomas et al. (2017). PLOS ONE, 12(6), e0179302.',
    url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0179302',
  },
  {
    id: 9,
    citation: 'UNEP-WCMC & Short (2021). Global distribution of seagrasses.',
    url: 'https://data.unep-wcmc.org/datasets/7',
  },
  {
    id: 10,
    citation: 'Dunic et al. (2021). Global Change Biology, 27(16), 3841–3856.',
    url: 'https://onlinelibrary.wiley.com/doi/full/10.1111/gcb.15684',
  },
  {
    id: 11,
    citation:
      'Waycott et al. (2009). Proceedings of the National Academy of Sciences, 106(30), 12377–12381.',
    url: 'https://www.pnas.org/content/106/30/12377.short',
  },
  {
    id: 12,
    citation: 'McOwen et al. (2017). Journal of Biogeography.',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5515097/',
  },
  {
    id: 13,
    citation: 'IUCN Red List of Threatened Species. Version 2020-04.',
    url: 'https://www.iucnredlist.org/',
  },
  {
    id: 14,
    citation: 'Halpern et al. (2019). Scientific Reports, 9, 11609.',
    url: 'https://www.nature.com/articles/s41598-019-47201-9',
  },
  {
    id: 15,
    citation: 'Frazier. KNB Data Repository.',
    url: 'https://knb.ecoinformatics.org/view/doi:10.5063/F12B8WBS',
  },
  {
    id: 16,
    citation:
      'Hersbach et al. (2019). ERA5 Monthly Averaged Data. Copernicus Climate Data Store.',
    url: 'https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-era5-single-levels-monthly-means',
  },
  {
    id: 17,
    citation: 'Huang et al. (2017). Journal of Climate, 30(20).',
    url: 'https://journals.ametsoc.org/view/journals/clim/30/20/jcli-d-16-0836.1.xml',
  },
  {
    id: 18,
    citation: 'Huang et al. (2018). Journal of Climate, 32(9).',
    url: 'https://journals.ametsoc.org/view/journals/clim/32/9/jcli-d-18-0368.1.xml',
  },
  {
    id: 19,
    citation: 'US Geological Survey (2019). Global Ecosystems.',
    url: 'https://rmgsc.cr.usgs.gov/ecosystems/datadownload.shtml',
  },
  {
    id: 20,
    citation: 'OceanColour. NASA Ocean Biology Processing Group.',
    url: 'https://oceancolor.gsfc.nasa.gov/products/',
  },
  {
    id: 21,
    citation: 'Vestbo et al. (2018). Frontiers in Marine Science, 5, 164.',
    url: 'https://www.frontiersin.org/articles/10.3389/fmars.2018.00164/full',
  },
  {
    id: 22,
    citation: 'Obst (2017). Swedish National Data Service.',
    url: 'https://snd.gu.se/en/catalogue/study/ecds0243',
  },
] as const;

export const TERMINOLOGY = [
  {
    term: 'Indicator',
    definition:
      'A measure or metric based on verifiable data that conveys information about more than itself. 34 indicators are used in this Index.',
  },
  {
    term: 'Habitat',
    definition:
      'The three coastal wetland ecosystem types in this Index: mangroves, saltmarsh, and seagrass.',
  },
  {
    term: 'Typology',
    definition:
      'A group of coastal wetland sites that share similar indicator values across habitat extent change, ecological structure and function, and cumulative impacts.',
  },
  {
    term: 'Violin plot',
    definition:
      'Shows the distribution of indicator values across all grid cells within the selected typology. Thicker sections indicate more grid cells with that value.',
  },
  {
    term: 'ID',
    definition:
      'The unique grid cell ID number. Each of the 2,845 grid cells has a unique identifier.',
  },
] as const;

export const MENU_CONTENT = {
  about: {
    title: 'About GLOWdex',
    lead: 'Global status of coastal wetlands to inform conservation and management.',
    body: `Researchers from around the world have been recording data on the world's coastal wetlands for decades. For the first time, these global datasets have been brought together into a single platform.\n\nThe Global Coastal Wetlands Index uses 34 indicators to provide a full picture of the health of coastal wetlands worldwide. It quantifies relationships among these indicators to better understand ecosystem health and identify areas that may be under threat.\n\nWhen looking across the globe, similarities emerge between coastal wetlands in different regions. Sites sharing similar characteristics are grouped into a typology. This app lets you explore outputs at two scales — using either 5 or 18 typologies — to characterise the world's coastal wetlands.\n\nSites within the same typology facing similar pressures could benefit from knowledge exchange. This Index can inform globally and regionally coordinated conservation and management.`,
  },
  help: {
    title: 'How to Use GLOWdex',
    sections: [
      {
        heading: null,
        body: 'GLOWdex maps the ecological health of mangrove ecosystems across thousands of 100 × 100 km grid cells worldwide. Click any cell on the map to explore its data.',
      },
      {
        heading: 'Search',
        body: 'Use the search box in the top-left of the map to find a specific location by name, country, or region. The map will pan and zoom to your search result automatically.',
      },
      {
        heading: 'Biodiversity Tab',
        body: 'Your starting point. Highlights threatened species with known associations to mangrove ecosystems near your selected region, drawing on observation data from the Global Biodiversity Information Facility (GBIF). Each species card shows recent observation counts, last recorded sighting, and primary range. Toggle species observation points directly onto the map to see where sightings have been recorded. A Hub Partner widget shows the nearest research or conservation partner organisation to your selected cell, with a direct link to contact them.',
      },
      {
        heading: 'Analysis Tab',
        body: 'Gives you a statistical picture of the selected cell. Each indicator is explained in plain language so you can understand what is being measured and what the value means ecologically. Indicators are shown in context — compared against other mangrove cells in the same typology globally — so you can see whether a value is typical, unusually high, or unusually low for that type of ecosystem.',
      },
      {
        heading: 'Analysis Assistant',
        body: 'Answers questions about the selected cell in depth. It draws on the ecological data for that location and can explain indicator values, describe environmental pressures, and help you interpret what the data means for conservation. You can ask it questions in any language supported by the Gemini SDK. To get started, select a cell and try asking: "What are the main pressures on this mangrove?" or "How does the biodiversity here compare to similar ecosystems?"',
      },
      {
        heading: 'Global Filters',
        body: "Adjust the typology scale between 5 and 18 groupings, giving you either a broad or more granular classification of the world's mangrove ecosystems.",
      },
    ],
  },
  methods: {
    title: 'Methods & Data Sources',
  },
  contact: {
    title: 'Contact',
    body: 'For enquiries about GLOWdex or the Global Wetlands project, please contact the team at Griffith University.',
    placeholder: true,
  },
} as const;

export type MenuItemKey = keyof typeof MENU_CONTENT;
