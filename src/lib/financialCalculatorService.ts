export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  burnRate: number;
  runway: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  ltvCacRatio: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  growthRate: number;
}

export interface InvestmentMetrics {
  valuation: number;
  equityOffered: number;
  investmentAmount: number;
  preMoneyValuation: number;
  postMoneyValuation: number;
  ownershipPercentage: number;
  returnMultiple: number;
  irr: number;
}

export interface LoanMetrics {
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  effectiveRate: number;
}

export interface StartupFinancials {
  businessName: string;
  currency: string;
  monthlyRevenue: number;
  revenueGrowthRate: number;
  revenueProjectionMonths: number;
  rent: number;
  salaries: number;
  insurance: number;
  utilities: number;
  marketing: number;
  otherFixedCosts: number;
  costOfGoodsSold: number;
  variableCosts: number;
  equipment: number;
  initialInventory: number;
  legalFees: number;
  otherOneTimeCosts: number;
  initialInvestment: number;
  additionalInvestment: number;
  investmentMonths: number;
  targetMonthlyProfit: number;
  targetRevenue: number;
}

export interface FinancialProjection {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  cumulativeProfit: number;
  cashFlow: number;
  cumulativeCashFlow: number;
}

export interface BreakEvenAnalysis {
  breakEvenPoint: number;
  breakEvenRevenue: number;
  monthsToBreakEven: number;
  isAchievable: boolean;
  recommendations: string[];
}

export interface InvestmentAnalysis {
  totalInvestment: number;
  monthlyBurnRate: number;
  runway: number;
  returnOnInvestment: number;
  paybackPeriod: number;
  roi: number;
  monthlyReturn: number;
  npv: number;
  irr: number;
  recommendations: string[];
}

export class FinancialCalculatorService {
  /**
   * Calculate basic financial metrics
   */
  static calculateFinancialMetrics(inputs: {
    revenue: number;
    costOfGoodsSold: number;
    operatingExpenses: number;
    otherExpenses: number;
    cashOnHand: number;
    monthlyExpenses: number;
    customers: number;
    acquisitionCost: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    churnRate: number;
    growthRate: number;
  }): FinancialMetrics {
    const {
      revenue,
      costOfGoodsSold,
      operatingExpenses,
      otherExpenses,
      cashOnHand,
      monthlyExpenses,
      // customers, // Unused variable
      acquisitionCost,
      averageOrderValue,
      purchaseFrequency,
      churnRate,
      growthRate
    } = inputs;

    const grossProfit = revenue - costOfGoodsSold;
    const netProfit = grossProfit - operatingExpenses - otherExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const cashFlow = netProfit;
    const burnRate = monthlyExpenses;
    const runway = burnRate > 0 ? cashOnHand / burnRate : 0;

    const customerAcquisitionCost = acquisitionCost;
    const customerLifetimeValue = averageOrderValue * purchaseFrequency * (1 / churnRate);
    const ltvCacRatio = customerAcquisitionCost > 0 ? customerLifetimeValue / customerAcquisitionCost : 0;

    const monthlyRecurringRevenue = revenue / 12;
    const annualRecurringRevenue = revenue;
    const churnRatePercent = churnRate * 100;
    const growthRatePercent = growthRate * 100;

    return {
      revenue,
      expenses: costOfGoodsSold + operatingExpenses + otherExpenses,
      grossProfit,
      netProfit,
      profitMargin,
      cashFlow,
      burnRate,
      runway,
      customerAcquisitionCost,
      customerLifetimeValue,
      ltvCacRatio,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      churnRate: churnRatePercent,
      growthRate: growthRatePercent
    };
  }

  /**
   * Calculate investment metrics
   */
  static calculateInvestmentMetrics(inputs: {
    currentValuation: number;
    investmentAmount: number;
    expectedExitValuation: number;
    expectedExitYears: number;
  }): InvestmentMetrics {
    const { currentValuation, investmentAmount, expectedExitValuation, expectedExitYears } = inputs;

    const equityOffered = (investmentAmount / (currentValuation + investmentAmount)) * 100;
    const preMoneyValuation = currentValuation;
    const postMoneyValuation = currentValuation + investmentAmount;
    const ownershipPercentage = (investmentAmount / postMoneyValuation) * 100;
    const returnMultiple = expectedExitValuation / postMoneyValuation;
    const irr = Math.pow(expectedExitValuation / postMoneyValuation, 1 / expectedExitYears) - 1;

    return {
      valuation: currentValuation,
      equityOffered,
      investmentAmount,
      preMoneyValuation,
      postMoneyValuation,
      ownershipPercentage,
      returnMultiple,
      irr: irr * 100
    };
  }

  /**
   * Calculate loan metrics
   */
  static calculateLoanMetrics(inputs: {
    principal: number;
    annualInterestRate: number;
    termYears: number;
  }): LoanMetrics {
    const { principal, annualInterestRate, termYears } = inputs;
    const monthlyRate = annualInterestRate / 100 / 12;
    const termMonths = termYears * 12;

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);

    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - principal;
    const effectiveRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;

    return {
      principal,
      interestRate: annualInterestRate,
      termMonths,
      monthlyPayment,
      totalInterest,
      totalPayment,
      effectiveRate
    };
  }

  /**
   * Calculate simple break-even point
   */
  static calculateSimpleBreakEven(inputs: {
    fixedCosts: number;
    variableCostPerUnit: number;
    pricePerUnit: number;
  }): { units: number; revenue: number; months: number } {
    const { fixedCosts, variableCostPerUnit, pricePerUnit } = inputs;
    
    const contributionMargin = pricePerUnit - variableCostPerUnit;
    const breakEvenUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
    const breakEvenRevenue = breakEvenUnits * pricePerUnit;
    
    // Assuming monthly fixed costs
    const breakEvenMonths = contributionMargin > 0 ? fixedCosts / (contributionMargin * 1) : 0;

    return {
      units: Math.ceil(breakEvenUnits),
      revenue: Math.ceil(breakEvenRevenue),
      months: Math.ceil(breakEvenMonths)
    };
  }

  /**
   * Calculate revenue projections
   */
  static calculateRevenueProjections(inputs: {
    currentRevenue: number;
    monthlyGrowthRate: number;
    months: number;
  }): Array<{ month: number; revenue: number; cumulative: number }> {
    const { currentRevenue, monthlyGrowthRate, months } = inputs;
    const projections = [];
    let cumulative = 0;

    for (let i = 1; i <= months; i++) {
      const revenue = currentRevenue * Math.pow(1 + monthlyGrowthRate / 100, i - 1);
      cumulative += revenue;
      projections.push({
        month: i,
        revenue: Math.round(revenue),
        cumulative: Math.round(cumulative)
      });
    }

    return projections;
  }

  /**
   * Calculate customer metrics
   */
  static calculateCustomerMetrics(inputs: {
    totalCustomers: number;
    newCustomersPerMonth: number;
    churnRate: number;
    averageOrderValue: number;
    purchaseFrequency: number;
  }): {
    monthlyActiveCustomers: number;
    customerLifetimeValue: number;
    monthlyRevenue: number;
    annualRevenue: number;
  } {
    const { totalCustomers, churnRate, averageOrderValue, purchaseFrequency } = inputs;
    // newCustomersPerMonth is destructured but not used

    const monthlyActiveCustomers = totalCustomers;
    const customerLifetimeValue = averageOrderValue * purchaseFrequency * (1 / churnRate);
    const monthlyRevenue = monthlyActiveCustomers * averageOrderValue * purchaseFrequency;
    const annualRevenue = monthlyRevenue * 12;

    return {
      monthlyActiveCustomers,
      customerLifetimeValue: Math.round(customerLifetimeValue),
      monthlyRevenue: Math.round(monthlyRevenue),
      annualRevenue: Math.round(annualRevenue)
    };
  }

  /**
   * Calculate valuation using different methods
   */
  static calculateValuation(inputs: {
    annualRevenue: number;
    netIncome: number;
    assets: number;
    industryMultiplier: number;
    growthRate: number;
  }): {
    revenueMultiple: number;
    earningsMultiple: number;
    assetBased: number;
    dcf: number;
    average: number;
  } {
    const { annualRevenue, netIncome, assets, industryMultiplier, growthRate } = inputs;

    const revenueMultiple = annualRevenue * industryMultiplier;
    const earningsMultiple = netIncome > 0 ? netIncome * (industryMultiplier * 2) : 0;
    const assetBased = assets * 1.2; // 20% premium on assets
    const dcf = annualRevenue * (1 + growthRate / 100) * industryMultiplier; // Simplified DCF

    const validValuations = [revenueMultiple, earningsMultiple, assetBased, dcf].filter(v => v > 0);
    const average = validValuations.length > 0 ? 
      validValuations.reduce((sum, val) => sum + val, 0) / validValuations.length : 0;

    return {
      revenueMultiple: Math.round(revenueMultiple),
      earningsMultiple: Math.round(earningsMultiple),
      assetBased: Math.round(assetBased),
      dcf: Math.round(dcf),
      average: Math.round(average)
    };
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Calculate compound interest
   */
  static calculateCompoundInterest(inputs: {
    principal: number;
    annualRate: number;
    years: number;
    compoundingFrequency: number;
  }): { finalAmount: number; totalInterest: number } {
    const { principal, annualRate, years, compoundingFrequency } = inputs;
    
    const rate = annualRate / 100;
    const periods = years * compoundingFrequency;
    const finalAmount = principal * Math.pow(1 + rate / compoundingFrequency, periods);
    const totalInterest = finalAmount - principal;

    return {
      finalAmount: Math.round(finalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100
    };
  }

  /**
   * Calculate monthly financial projections
   */
  static calculateMonthlyProjections(financials: StartupFinancials): FinancialProjection[] {
    const projections: FinancialProjection[] = [];
    let cumulativeProfit = 0;
    let cumulativeCashFlow = 0;
    let currentRevenue = financials.monthlyRevenue;

    for (let month = 1; month <= financials.revenueProjectionMonths; month++) {
      // Calculate monthly expenses
      const fixedCosts = financials.rent + financials.salaries + financials.insurance + 
                        financials.utilities + financials.marketing + financials.otherFixedCosts;
      const variableCosts = (currentRevenue * financials.costOfGoodsSold / 100) + financials.variableCosts;
      const totalExpenses = fixedCosts + variableCosts;

      // Calculate profit and cash flow
      const profit = currentRevenue - totalExpenses;
      cumulativeProfit += profit;
      
      // Cash flow includes one-time costs in first month
      const oneTimeCosts = month === 1 ? 
        (financials.equipment + financials.initialInventory + financials.legalFees + financials.otherOneTimeCosts) : 0;
      const cashFlow = profit - oneTimeCosts;
      cumulativeCashFlow += cashFlow;

      projections.push({
        month,
        revenue: Math.round(currentRevenue * 100) / 100,
        expenses: Math.round(totalExpenses * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
        cashFlow: Math.round(cashFlow * 100) / 100,
        cumulativeCashFlow: Math.round(cumulativeCashFlow * 100) / 100
      });

      // Apply growth rate for next month
      currentRevenue *= (1 + financials.revenueGrowthRate / 100);
    }

    return projections;
  }

  /**
   * Calculate break-even analysis
   */
  static calculateBreakEven(financials: StartupFinancials): BreakEvenAnalysis {
    const fixedCosts = financials.rent + financials.salaries + financials.insurance + 
                      financials.utilities + financials.marketing + financials.otherFixedCosts;
    const variableCostRate = financials.costOfGoodsSold / 100;
    
    // Break-even point: Revenue = Fixed Costs + (Revenue * Variable Cost Rate)
    // Revenue = Fixed Costs / (1 - Variable Cost Rate)
    const breakEvenRevenue = fixedCosts / (1 - variableCostRate);
    const breakEvenPoint = breakEvenRevenue;
    
    // Find month when break-even is reached
    let monthsToBreakEven = 0;
    let currentRevenue = financials.monthlyRevenue;
    let cumulativeProfit = 0;
    
    for (let month = 1; month <= financials.revenueProjectionMonths; month++) {
      const variableCosts = currentRevenue * variableCostRate;
      const profit = currentRevenue - fixedCosts - variableCosts;
      cumulativeProfit += profit;
      
      if (cumulativeProfit >= 0) {
        monthsToBreakEven = month;
        break;
      }
      
      currentRevenue *= (1 + financials.revenueGrowthRate / 100);
    }

    const isAchievable = monthsToBreakEven > 0 && monthsToBreakEven <= financials.revenueProjectionMonths;
    
    const recommendations: string[] = [];
    if (!isAchievable) {
      recommendations.push("Consider reducing fixed costs or increasing revenue growth rate");
      recommendations.push("Review pricing strategy to improve margins");
    } else if (monthsToBreakEven > 12) {
      recommendations.push("Break-even timeline is long - consider securing additional funding");
      recommendations.push("Focus on accelerating revenue growth");
    } else {
      recommendations.push("Break-even timeline looks achievable");
      recommendations.push("Monitor monthly performance closely");
    }

    return {
      breakEvenPoint: Math.round(breakEvenPoint * 100) / 100,
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      monthsToBreakEven,
      isAchievable,
      recommendations
    };
  }

  /**
   * Calculate investment analysis
   */
  static calculateInvestmentAnalysis(financials: StartupFinancials): InvestmentAnalysis {
    const totalInvestment = financials.initialInvestment + financials.additionalInvestment;
    const fixedCosts = financials.rent + financials.salaries + financials.insurance + 
                      financials.utilities + financials.marketing + financials.otherFixedCosts;
    const variableCosts = (financials.monthlyRevenue * financials.costOfGoodsSold / 100) + financials.variableCosts;
    const monthlyBurnRate = fixedCosts + variableCosts - financials.monthlyRevenue;
    
    const runway = totalInvestment / Math.abs(monthlyBurnRate);
    const returnOnInvestment = totalInvestment > 0 ? 
      ((financials.targetMonthlyProfit * 12) / totalInvestment) * 100 : 0;
    const paybackPeriod = totalInvestment > 0 ? 
      totalInvestment / (financials.targetMonthlyProfit || 1) : 0;
    
    // Calculate additional metrics
    const roi = returnOnInvestment;
    const monthlyReturn = financials.targetMonthlyProfit || 0;
    const npv = this.calculateNPV(financials);
    const irr = this.calculateIRR(financials);

    const recommendations: string[] = [];
    if (runway < 6) {
      recommendations.push("Low runway - secure additional funding immediately");
      recommendations.push("Consider reducing burn rate through cost optimization");
    } else if (runway < 12) {
      recommendations.push("Moderate runway - plan for next funding round");
      recommendations.push("Focus on revenue growth to extend runway");
    } else {
      recommendations.push("Good runway - focus on growth and profitability");
    }

    if (returnOnInvestment < 10) {
      recommendations.push("Low ROI - review business model and pricing");
    } else if (returnOnInvestment > 50) {
      recommendations.push("High ROI potential - consider scaling faster");
    }

    return {
      totalInvestment,
      monthlyBurnRate: Math.round(monthlyBurnRate * 100) / 100,
      runway: Math.round(runway * 100) / 100,
      returnOnInvestment: Math.round(returnOnInvestment * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      monthlyReturn: Math.round(monthlyReturn * 100) / 100,
      npv: Math.round(npv * 100) / 100,
      irr: Math.round(irr * 100) / 100,
      recommendations
    };
  }

  /**
   * Generate financial summary
   */
  static generateFinancialSummary(financials: StartupFinancials): {
    businessName: string;
    currency: string;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    finalCashFlow: number;
    totalStartupCosts: number;
    isProfitable: boolean;
    recommendations: string[];
    projections: Array<{ month: number; revenue: number; expenses: number; profit: number }>;
    breakEven: BreakEvenAnalysis;
    investment: { roi: number; paybackPeriod: number; npv: number };
    summary: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      profitMargin: number;
      growthRate: number;
    };
  } {
    const projections = this.calculateMonthlyProjections(financials);
    const breakEven = this.calculateBreakEven(financials);
    const investment = this.calculateInvestmentAnalysis(financials);
    
    const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
    const totalExpenses = projections.reduce((sum, p) => sum + p.expenses, 0);
    const totalProfit = projections.reduce((sum, p) => sum + p.profit, 0);
    const finalCashFlow = projections[projections.length - 1]?.cumulativeCashFlow || 0;
    
    // Calculate total startup costs
    const totalStartupCosts = financials.equipment + financials.initialInventory + 
                             financials.legalFees + financials.otherOneTimeCosts + 
                             financials.initialInvestment + financials.additionalInvestment;
    
    // Determine if business is profitable
    const isProfitable = totalProfit > 0 && breakEven.isAchievable;
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (!isProfitable) {
      recommendations.push("El negocio no es rentable con los parámetros actuales");
      recommendations.push("Considera reducir costos fijos o aumentar los ingresos");
    }
    if (breakEven.monthsToBreakEven > 12) {
      recommendations.push("El punto de equilibrio es muy lejano - considera más financiamiento");
    }
    if (investment.runway < 6) {
      recommendations.push("Poca liquidez - busca financiamiento adicional");
    }
    if (recommendations.length === 0) {
      recommendations.push("El plan financiero se ve prometedor");
      recommendations.push("Monitorea el rendimiento mensualmente");
    }

    return {
      businessName: financials.businessName,
      currency: financials.currency,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      finalCashFlow: Math.round(finalCashFlow * 100) / 100,
      totalStartupCosts: Math.round(totalStartupCosts * 100) / 100,
      isProfitable,
      recommendations,
      breakEven,
      investment,
      projections: projections.slice(0, 12), // First 12 months for summary
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(totalProfit * 100) / 100,
        profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100 * 100) / 100 : 0,
        growthRate: financials.revenueGrowthRate
      }
    };
  }

  /**
   * Calculate Net Present Value (NPV)
   */
  private static calculateNPV(financials: StartupFinancials): number {
    const discountRate = 0.1; // 10% discount rate
    const projections = this.calculateMonthlyProjections(financials);
    const initialInvestment = financials.initialInvestment + financials.additionalInvestment;
    
    let npv = -initialInvestment; // Initial investment is negative cash flow
    
    projections.forEach((projection, index) => {
      const discountFactor = Math.pow(1 + discountRate, (index + 1) / 12);
      npv += projection.cashFlow / discountFactor;
    });
    
    return npv;
  }

  /**
   * Calculate Internal Rate of Return (IRR)
   */
  private static calculateIRR(financials: StartupFinancials): number {
    const projections = this.calculateMonthlyProjections(financials);
    const initialInvestment = financials.initialInvestment + financials.additionalInvestment;
    
    // Simple IRR calculation using Newton-Raphson method
    let rate = 0.1; // Starting guess
    const tolerance = 0.0001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = -initialInvestment;
      let derivative = 0;
      
      projections.forEach((projection, index) => {
        const discountFactor = Math.pow(1 + rate, (index + 1) / 12);
        npv += projection.cashFlow / discountFactor;
        derivative -= (projection.cashFlow * (index + 1)) / (12 * Math.pow(1 + rate, (index + 1) / 12 + 1));
      });
      
      if (Math.abs(npv) < tolerance) break;
      
      const newRate = rate - npv / derivative;
      if (Math.abs(newRate - rate) < tolerance) break;
      
      rate = newRate;
    }
    
    return rate * 100; // Return as percentage
  }
}