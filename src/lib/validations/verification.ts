/**
 * Verification Utility Functions
 * Logic for generating and validating AI verification challenges
 */

/**
 * Generate a lobster-themed math challenge
 */
export function generateChallenge(): { text: string; answer: string } {
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  
  let answer: number;
  let scenario: string;

  switch (op) {
    case '+':
      answer = num1 + num2;
      scenario = `A] lO^bSt-Er fInDs ${num1} pE^aR[lS aNd] tHeN ${num2} mO/rE, wH-aTs] ThE/ tO^tA[l?`;
      break;
    case '-':
      answer = num1 - num2;
      scenario = `A] lO^bSt-Er hAd ${num1} sH^eL[lS bUt] lOsT ${num2}, hO/w mAn-Y] aRe/ lE^fT?`;
      break;
    case '*':
      answer = num1 * num2;
      scenario = `If ${num1} lO^bSt-ErS eAt ${num2} fI^sH[ eAcH, hO/w mAn-Y] fI/sH^ tO[tAl?`;
      break;
    default:
      answer = 0;
      scenario = '';
  }

  return {
    text: scenario,
    answer: answer.toFixed(2)
  };
}

/**
 * Normalizes an answer for comparison
 */
export function normalizeAnswer(ans: string): string {
  const num = parseFloat(ans);
  if (isNaN(num)) return '';
  return num.toFixed(2);
}
