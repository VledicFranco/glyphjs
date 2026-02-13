import { describe, it, expect } from 'vitest';
import { parseMargin } from '../pdf-options.js';

describe('parseMargin', () => {
  it('returns default 1in on all sides when called with no argument', () => {
    expect(parseMargin()).toEqual({
      top: '1in',
      right: '1in',
      bottom: '1in',
      left: '1in',
    });
  });

  it('applies a single value to all four sides', () => {
    expect(parseMargin('2cm')).toEqual({
      top: '2cm',
      right: '2cm',
      bottom: '2cm',
      left: '2cm',
    });
  });

  it('applies 2 values as vertical and horizontal', () => {
    expect(parseMargin('10px 20px')).toEqual({
      top: '10px',
      right: '20px',
      bottom: '10px',
      left: '20px',
    });
  });

  it('applies 3 values as top, horizontal, bottom', () => {
    expect(parseMargin('1in 2in 3in')).toEqual({
      top: '1in',
      right: '2in',
      bottom: '3in',
      left: '2in',
    });
  });

  it('applies 4 values as top, right, bottom, left', () => {
    expect(parseMargin('1mm 2mm 3mm 4mm')).toEqual({
      top: '1mm',
      right: '2mm',
      bottom: '3mm',
      left: '4mm',
    });
  });

  it('handles various CSS units (px, in, cm, mm)', () => {
    expect(parseMargin('10px')).toEqual({
      top: '10px',
      right: '10px',
      bottom: '10px',
      left: '10px',
    });
    expect(parseMargin('0.5in')).toEqual({
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    });
    expect(parseMargin('2.5cm')).toEqual({
      top: '2.5cm',
      right: '2.5cm',
      bottom: '2.5cm',
      left: '2.5cm',
    });
  });

  it('trims whitespace before parsing', () => {
    expect(parseMargin('  1in  2in  ')).toEqual({
      top: '1in',
      right: '2in',
      bottom: '1in',
      left: '2in',
    });
  });

  it('throws on empty string', () => {
    expect(() => parseMargin('')).toThrow('Margin string must not be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => parseMargin('   ')).toThrow('Margin string must not be empty');
  });

  it('throws when given more than 4 values', () => {
    expect(() => parseMargin('1in 2in 3in 4in 5in')).toThrow(
      'Invalid margin: expected 1–4 values, got 5',
    );
  });
});
