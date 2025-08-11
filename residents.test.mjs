import { describe, it, expect } from 'vitest';
import processResidents from './residents.js';
import path from 'path';

describe('processResidents', () => {
  it('should process the residents file correctly and match the snapshot', () => {
    const filePath = path.join(process.cwd(), 'test', 'Residents.xlsx');
    const result = processResidents(filePath);
    expect(result).toMatchSnapshot();
  });
});
