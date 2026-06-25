import { describe, it, expect } from 'vitest';
import { classifyQuestion } from './useAIAnalytics';

describe('classifyQuestion', () => {
  describe('typologies', () => {
    it('resolves "what does my cluster mean?" to typologies', () => {
      expect(classifyQuestion('What does my cluster mean?')).toBe('typologies');
    });

    it('resolves "what cluster is this cell in?" to typologies', () => {
      expect(classifyQuestion('What cluster is this cell in?')).toBe(
        'typologies',
      );
    });

    it('resolves "which cluster does this site belong to?" to typologies', () => {
      expect(classifyQuestion('Which cluster does this site belong to?')).toBe(
        'typologies',
      );
    });

    it('resolves bare "cluster" to typologies', () => {
      expect(classifyQuestion('Can you explain this cluster?')).toBe(
        'typologies',
      );
    });

    it('resolves typology descriptions to typologies', () => {
      expect(classifyQuestion('What typology is this site?')).toBe(
        'typologies',
      );
    });

    it('resolves typology comparisons to typologies', () => {
      expect(classifyQuestion('How does my typology compare to others?')).toBe(
        'typologies',
      );
    });

    it('resolves cluster assignment questions to typologies', () => {
      expect(
        classifyQuestion('What is the cluster assignment for this cell?'),
      ).toBe('typologies');
    });
  });

  describe('methodology', () => {
    it('resolves "k-medoid clustering algorithm" to methodology, not typologies', () => {
      expect(
        classifyQuestion('How does the k-medoid clustering algorithm work?'),
      ).toBe('methodology');
    });

    it('resolves "how does clustering work?" to methodology', () => {
      expect(classifyQuestion('How does clustering work?')).toBe('methodology');
    });

    it('resolves LVM questions to methodology', () => {
      expect(classifyQuestion('How does the LVM work?')).toBe('methodology');
    });

    it('resolves Bayesian questions to methodology', () => {
      expect(classifyQuestion('What is the Bayesian approach used here?')).toBe(
        'methodology',
      );
    });

    it('resolves residuals questions to methodology', () => {
      expect(classifyQuestion('What do the residuals represent?')).toBe(
        'methodology',
      );
    });
  });

  describe('indicators', () => {
    it('resolves fish density questions to indicators', () => {
      expect(classifyQuestion('What is the fish density value here?')).toBe(
        'indicators',
      );
    });

    it('resolves AGB questions to indicators', () => {
      expect(classifyQuestion('What does AGB mean?')).toBe('indicators');
    });

    it('resolves SOC questions to indicators', () => {
      expect(classifyQuestion('How is SOC calculated?')).toBe('indicators');
    });

    it('resolves species threat score questions to indicators', () => {
      expect(
        classifyQuestion('What is the species threat score for this site?'),
      ).toBe('indicators');
    });

    it('resolves fragment rate questions to indicators', () => {
      expect(classifyQuestion('What does the fragment rate indicate?')).toBe(
        'indicators',
      );
    });

    it('resolves loss rate questions to indicators', () => {
      expect(classifyQuestion('Why is the loss rate so high?')).toBe(
        'indicators',
      );
    });
  });

  describe('pressures', () => {
    it('resolves pressure questions to pressures', () => {
      expect(classifyQuestion('What pressures affect this site?')).toBe(
        'pressures',
      );
    });

    it('resolves climate questions to pressures', () => {
      expect(
        classifyQuestion('How does climate change impact this area?'),
      ).toBe('pressures');
    });

    it('resolves cumulative impact questions to pressures', () => {
      expect(
        classifyQuestion('What is the cumulative impact score here?'),
      ).toBe('pressures');
    });

    it('resolves land use questions to pressures', () => {
      expect(classifyQuestion('Is there land use pressure nearby?')).toBe(
        'pressures',
      );
    });
  });

  describe('about_app', () => {
    it('resolves MBCAM name questions to about_app', () => {
      expect(classifyQuestion('What is MBCAM?')).toBe('about_app');
    });

    it('resolves "how do I use this tool?" to about_app', () => {
      expect(classifyQuestion('How do I use this tool?')).toBe('about_app');
    });

    it('resolves dashboard questions to about_app', () => {
      expect(classifyQuestion('What does this dashboard show?')).toBe(
        'about_app',
      );
    });

    it('does not resolve "pressure map" to about_app', () => {
      expect(classifyQuestion('What does the pressure map show?')).not.toBe(
        'about_app',
      );
    });
  });

  describe('other', () => {
    it('resolves generic questions to other', () => {
      expect(classifyQuestion('Can you summarize?')).toBe('other');
    });

    it('resolves short affirmations to other', () => {
      expect(classifyQuestion('Tell me more')).toBe('other');
    });

    it('resolves empty string to other', () => {
      expect(classifyQuestion('')).toBe('other');
    });
  });

  describe('case insensitivity', () => {
    it('classifies uppercase input correctly', () => {
      expect(classifyQuestion('WHAT IS THE FISH DENSITY?')).toBe('indicators');
    });

    it('classifies mixed-case input correctly', () => {
      expect(classifyQuestion('What Is My Cluster?')).toBe('typologies');
    });
  });
});
