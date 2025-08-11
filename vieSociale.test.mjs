import { describe, it, expect } from 'vitest';
import processVieSociale from './vieSociale.js';
import path from 'path';

describe('processVieSociale', () => {
  it('should process the vie sociale file correctly and match the snapshot', () => {
    const filePath = path.join(process.cwd(), 'test', 'Vie sociale.xlsx');
    const result = processVieSociale(filePath);
    expect(result).toMatchSnapshot();
  });
});
