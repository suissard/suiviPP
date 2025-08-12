import { describe, it, expect } from 'vitest';

// The function under test, copied from residents.js
function extractName(fullName) {
  if (!fullName) {
    return '';
  }

  let processedName = String(fullName);

  // Remove titles like "Mme.", "M.", "MR"
  processedName = processedName.replace(/^(Mme|M|MR)\.?\s+/, '');

  // Stop at "Née"
  const neeIndex = processedName.indexOf('Née');
  if (neeIndex > -1) {
    processedName = processedName.substring(0, neeIndex);
  }

  // Stop at a comma, which often separates other names
  const commaIndex = processedName.indexOf(',');
  if (commaIndex > -1) {
    processedName = processedName.substring(0, commaIndex);
  }

  // Stop at parenthesis
  const parenthesisIndex = processedName.indexOf('(');
  if (parenthesisIndex > -1) {
    processedName = processedName.substring(0, parenthesisIndex);
  }

  // Trim any remaining whitespace
  return processedName.trim();
}


describe('extractName', () => {
  it('should extract the name correctly from a complex string', () => {
    const fullName = "Mme. ASSELIN Monique Née MABON Monique, Marcelle, Valentine, Marie (-)";
    expect(extractName(fullName)).toBe('ASSELIN Monique');
  });

  it('should handle names without titles', () => {
    const fullName = "DUPONT Jean";
    expect(extractName(fullName)).toBe('DUPONT Jean');
  });

  it('should handle names with "M." title', () => {
    const fullName = "M. DUPONT Jean";
    expect(extractName(fullName)).toBe('DUPONT Jean');
  });

  it('should handle names with maiden name but no extra names', () => {
    const fullName = "Mme. ASSELIN Monique Née MABON";
    expect(extractName(fullName)).toBe('ASSELIN Monique');
  });

  it('should handle names with extra info in parenthesis', () => {
    const fullName = "MARTIN Luc (Père)";
    expect(extractName(fullName)).toBe('MARTIN Luc');
  });

  it('should handle names with just a comma', () => {
    const fullName = "BERNARD Luc,";
    expect(extractName(fullName)).toBe('BERNARD Luc');
  });

  it('should return an empty string if input is null or undefined', () => {
    expect(extractName(null)).toBe('');
    expect(extractName(undefined)).toBe('');
  });

  it('should handle names with multiple spaces between names', () => {
    const fullName = "LEFEBVRE   Paul";
    expect(extractName(fullName)).toBe('LEFEBVRE   Paul');
  });

  it('should handle names with leading/trailing spaces', () => {
    const fullName = "  LEFEBVRE Paul  ";
    expect(extractName(fullName)).toBe('LEFEBVRE Paul');
  });
});
