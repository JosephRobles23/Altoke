export interface IExchangeRateProvider {
  getRate(from: string, to: string): Promise<number>;
}

export interface CalculateExchangeRateRequest {
  amountUsd: number;
  toCurrency: string;
}

export interface CalculateExchangeRateResponse {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  fee: number;
  totalCost: number;
}

export class CalculateExchangeRateUseCase {
  private static readonly FEE_PERCENTAGE = 0.005; // 0.5% fee

  constructor(private exchangeRateProvider: IExchangeRateProvider) {}

  async execute(
    request: CalculateExchangeRateRequest
  ): Promise<CalculateExchangeRateResponse> {
    const rate = await this.exchangeRateProvider.getRate('USD', request.toCurrency);
    const fee = request.amountUsd * CalculateExchangeRateUseCase.FEE_PERCENTAGE;
    const netAmount = request.amountUsd - fee;
    const toAmount = netAmount * rate;

    return {
      fromAmount: request.amountUsd,
      fromCurrency: 'USD',
      toAmount: Math.round(toAmount * 100) / 100,
      toCurrency: request.toCurrency,
      rate,
      fee,
      totalCost: request.amountUsd,
    };
  }
}
