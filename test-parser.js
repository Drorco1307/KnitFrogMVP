// Quick parser test
import { parseTextInstruction } from './src/utils/textParser.ts';
import { DEFAULT_COLORS } from './src/utils/stitchData.ts';

const testCases = [
  'k2, p2, k2tog, yo, k10',
  'k2',
  'p2',
  '*k2, p2* repeat 5 times',
];

console.log('Testing parser...\n');

for (const test of testCases) {
  console.log(`Input: "${test}"`);
  try {
    const result = parseTextInstruction(test, 'comma', DEFAULT_COLORS);
    console.log('Success:', result.success);
    console.log('Stitches:', result.stitches.length);
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
    console.log('---\n');
  } catch (error) {
    console.error('ERROR:', error.message);
    console.log('---\n');
  }
}
