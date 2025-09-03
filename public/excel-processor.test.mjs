import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
const { extractName, processResidentsFile, processProjetsFile, processVieSocialeFile } = require('./excel-processor.js');

// Mocking browser environment
const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.FileReader = dom.window.FileReader;
global.Blob = dom.window.Blob;
global.File = dom.window.File;
global.XLSX = require('xlsx');


describe('extractName', () => {
  it('should return an empty string if full name is not provided', () => {
    expect(extractName(null)).toBe('');
    expect(extractName(undefined)).toBe('');
    expect(extractName('')).toBe('');
  });

  it('should remove titles like "Mme.", "M.", "MR"', () => {
    expect(extractName('Mme. Dupont')).toBe('Dupont');
    expect(extractName('M. Martin')).toBe('Martin');
    expect(extractName('MR Durand')).toBe('Durand');
  });

  it('should stop at "Née"', () => {
    expect(extractName('Dupont Née Martin')).toBe('Dupont');
  });

  it('should stop at a comma', () => {
    expect(extractName('Dupont, Jean')).toBe('Dupont');
  });

  it('should stop at a parenthesis', () => {
    expect(extractName('Dupont (Jean)')).toBe('Dupont');
  });

  it('should trim whitespace', () => {
    expect(extractName('  Dupont  ')).toBe('Dupont');
  });

  it('should handle a combination of cases', () => {
    expect(extractName('Mme. Dupont Née Martin, Jean (fils)')).toBe('Dupont');
  });
});

function createFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer]);
    return new File([blob], path.basename(filePath));
}

describe('Excel file processors', () => {
    it('should process the residents file correctly', async () => {
        const filePath = path.join(process.cwd(), 'test', 'Residents.xlsx');
        const file = createFile(filePath);
        const result = await processResidentsFile(file);
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('successCount');
        expect(result).toHaveProperty('errorCount');
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]).toHaveProperty('id');
        expect(result.data[0]).toHaveProperty('entry');
        expect(result.data[0]).toHaveProperty('chNum');
    });

    it('should process the projets file correctly', async () => {
        const filePath = path.join(process.cwd(), 'test', 'Projets.xlsx');
        const file = createFile(filePath);
        const result = await processProjetsFile(file);
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('successCount');
        expect(result).toHaveProperty('errorCount');
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]).toHaveProperty('id');
        expect(result.data[0]).toHaveProperty('type');
        expect(result.data[0]).toHaveProperty('state');
    });

    it('should process the vie sociale file correctly', async () => {
        const filePath = path.join(process.cwd(), 'test', 'Vie sociale.xlsx');
        const file = createFile(filePath);
        const result = await processVieSocialeFile(file);
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('successCount');
        expect(result).toHaveProperty('errorCount');
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]).toHaveProperty('id');
        expect(result.data[0]).toHaveProperty('type');
        expect(result.data[0]).toHaveProperty('date');
    });
});
