import {Rule } from '../lib/model_ctrl';

export interface IModel {
  baseCurrency: string;
  bankAccountId: string;
  bankAccount: { currency: string };
  legalEntityId: string;
  legalEntity: { currency: string };
  currency: string;
  currencyRate: number;
  netAmtBase: number;
  netAmtCurr: number;
  taxAmtBase: number;
  taxAmtCurr: number;
  taxRate: number;
  grossAmtBase: number;
  grossAmtCurr: number;
  crvCurrencyDefault: string;
  crvCurrencyFixed: string;
}

type M = IModel;

export const rules = {
  baseCurrency: [
    [Rule.Constraint, (i: M) => i.legalEntity.currency, { name: "Base currency" }],
    [Rule.Constraint, (i: M) => i.bankAccount.currency, { name: "Bank currency" }],
  ],
  currency: [
    [Rule.Constraint, (i: M) => i.crvCurrencyFixed, { name: "Account fixed currency" }],
    [Rule.Default, (i: M) => i.crvCurrencyDefault, { name: "Account default currency" }]
  ],
  netAmtBase: (i: M) => i.netAmtCurr * i.currencyRate,
  taxAmtCurr: (i: M) => i.netAmtBase * i.taxRate,
  taxAmtBase: (i: M) => i.taxAmtCurr * i.currencyRate,
  currencyRate: (i: M) => ({ GBP: 1, USD: 1.293, EUR: 1.11 })[i.currency.toLowerCase()];
};


