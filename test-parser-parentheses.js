// Quick test for parentheses and "twice" support
const { parseTextInstruction } = require('./src/utils/textParser.ts');

const colorPalette = [
  { id: 'MC', hex: '#000000', name: 'Main Color' },
  { id: 'CC1', hex: '#FF0000', name: 'Contrast Color 1' },
];

const testCases = [
  { input: '(k2, p2) x5', description: 'Parentheses with x5' },
  { input: '(k2, p2) twice', description: 'Parentheses with twice' },
  { input: '(k2, p2) repeat 3 times', description: 'Parentheses with repeat' },
  { input: '*k2, p2* x5', description: 'Asterisk with x5 (original)' },
  { input: '*k2, p2* twice', description: 'Asterisk with twice' },
  { input: 'k2, (p2, k2tog) twice, p1', description: 'Mixed with parentheses' },
  { input: 'c4f twice', description: 'Single stitch with twice' },
  { input: 'k2 x3', description: 'Single stitch with x3' },
  { input: 'K2, C4F twice, P6, C4B', description: 'Complex pattern with single stitch repeats' },
  { input: 'K2, C4F twice, P6, C4B, (P4, C4B) twice, P6, K2, C4F twice', description: 'Full complex pattern (your example)' },
];

console.log('Testing parentheses and "twice" support:\n');

testCases.forEach(({ input, description }) => {
  console.log(`Test: ${description}`);
  console.log(`Input: "${input}"`);

  const result = parseTextInstruction(input, 'comma', colorPalette);

  if (result.success) {
    console.log(`✓ Success! ${result.totalStitchCount} stitches`);
    console.log(`  Stitches: ${result.stitches.map(s => s.type).join(', ')}`);
  } else {
    console.log(`✗ Failed`);
    console.log(`  Errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  console.log('');
});
