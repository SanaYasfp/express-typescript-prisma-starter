//import jwt from 'jsonwebtoken';


//const token = jwt.sign({ user_id: 34 }, '123456');

//console.log(token);

//const payload = jwt.verify(token, '123456');

//console.log(payload);

function calculGain(term: number, investAmount: number) {
  const minRate = 3.5;
  const maxRate = 6;

  const minTerm = 3;
  const maxTerm = 36;

  const diffRate = maxRate - minRate;
  const diffRatePerMonth = diffRate / (maxTerm - minTerm);
  const incrementalRate = diffRatePerMonth * (term - minTerm);
  const finalRate = minRate + incrementalRate;

  const potentialGain = investAmount * (finalRate / 100);

  return potentialGain;
}

console.log(calculGain(3, 1000));  // Résultat: 30
console.log(calculGain(12, 1000)); // Résultat: 38.18181818181819
console.log(calculGain(5, 1000));  // Résultat: 31.818181818181817
console.log(calculGain(36, 1000)); // Résultat: 60
console.log(calculGain(37, 1000)); // Résultat: 60.90909090909091

