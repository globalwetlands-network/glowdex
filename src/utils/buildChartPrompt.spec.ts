import { describe, it, expect } from 'vitest';
import { buildChartPrompt } from './buildChartPrompt';

describe('buildChartPrompt', () => {
  it('should generate a distribution prompt with the indicator label', () => {
    const prompt = buildChartPrompt('Mangrove Fish Density', 'distribution');
    expect(prompt).toBe('What does the violin plot show about mangrove fish density in this location?');
  });

  it('should generate an unusual prompt with the indicator label', () => {
    const prompt = buildChartPrompt('Above Ground Biomass', 'unusual');
    expect(prompt).toBe('How unusual is the above ground biomass value compared to the typology distribution?');
  });

  it('should generate a drivers prompt with the indicator label', () => {
    const prompt = buildChartPrompt('Canopy Height', 'drivers');
    expect(prompt).toBe('What ecological factors might explain why this location has a high canopy height value?');
  });
});
