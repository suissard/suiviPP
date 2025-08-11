import { describe, it, expect } from 'vitest';
import processProjets from './projets.js';
import path from 'path';

describe('processProjets', () => {
  it('should process the projets file correctly and match the snapshot', () => {
    const filePath = path.join(process.cwd(), 'test', 'Projets.xlsx');
    const result = processProjets(filePath);
    expect(result).toMatchSnapshot();
  });
});
