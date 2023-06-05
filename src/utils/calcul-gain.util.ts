import { appConfig } from "../config";

export function calculGain(term: number, investAmount: number) {
  const minRate = appConfig.INVESTMENT.MIN_RATE;
  const maxRate = appConfig.INVESTMENT.MAX_RATE;

  const minTerm = appConfig.INVESTMENT.MIN_TERM;
  const maxTerm = appConfig.INVESTMENT.MAX_TERM;

  const diffRate = maxRate - minRate;
  const diffRatePerMonth = diffRate / (maxTerm - minTerm);
  const incrementalRate = diffRatePerMonth * (term - minTerm);
  const finalRate = minRate + incrementalRate;

  const potentialGain = investAmount * (finalRate / 100);

  return potentialGain;
}
