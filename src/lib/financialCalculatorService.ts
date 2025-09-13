export interface FinancialProjection {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeProfit: number;
}

export interface BreakEvenAnalysis {
  breakEvenPoint: number; // months
  breakEvenRevenue: number;
  isProfitable: boolean;
}

export interface InvestmentAnalysis {
  totalInvestment: number;
  monthlyReturn: number;
  paybackPeriod: number; // months
  roi: number; // percentage
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return
}

export interface StartupFinancials {
  // Basic Info
  businessName: string;
  currency: string;
  
  // Revenue Projections
  monthlyRevenue: number;
  revenueGrowthRate: number; // percentage per month
  revenueProjectionMonths: number;
  
  // Fixed Costs
  rent: number;
  salaries: number;
  insurance: number;
  utilities: number;
  marketing: number;
  otherFixedCosts: number;
  
  // Variable Costs
  costOfGoodsSold: number; // percentage of revenue
  variableCosts: number; // additional variable costs per month
  
  // One-time Costs
  equipment: number;
  initialInventory: number;
  legalFees: number;
  otherOneTimeCosts: number;
  
  // Investment
  initialInvestment: number;
  additionalInvestment: number; // per month
  investmentMonths: number;
  
  // Financial Goals
  targetMonthlyProfit: number;
  targetRevenue: number;
}

export class FinancialCalculatorService {
  static calculateMonthlyProjections(financials: StartupFinancials): FinancialProjection[] {
    const projections: FinancialProjection[] = [];
    let cumulativeProfit = 0;
    
    for (let month = 1; month <= financials.revenueProjectionMonths; month++) {
      // Calculate revenue with growth
      const revenue = financials.monthlyRevenue * Math.pow(1 + financials.revenueGrowthRate / 100, month - 1);
      
      // Calculate fixed costs
      const fixedCosts = financials.rent + financials.salaries + financials.insurance + 
                        financials.utilities + financials.marketing + financials.otherFixedCosts;
      
      // Calculate variable costs
      const variableCosts = (revenue * financials.costOfGoodsSold / 100) + financials.variableCosts;
      
      // Calculate total costs
      const totalCosts = fixedCosts + variableCosts;
      
      // Calculate profit
      const profit = revenue - totalCosts;
      cumulativeProfit += profit;
      
      projections.push({
        month,
        revenue: Math.round(revenue * 100) / 100,
        costs: Math.round(totalCosts * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
      });
    }
    
    return projections;
  }
  
  static calculateBreakEven(financials: StartupFinancials): BreakEvenAnalysis {
    const projections = this.calculateMonthlyProjections(financials);
    
    // Find break-even point
    let breakEvenPoint = 0;
    let breakEvenRevenue = 0;
    
    for (const projection of projections) {
      if (projection.cumulativeProfit >= 0) {
        breakEvenPoint = projection.month;
        breakEvenRevenue = projection.revenue;
        break;
      }
    }
    
    // If never profitable, set to last month
    if (breakEvenPoint === 0) {
      breakEvenPoint = projections.length;
      breakEvenRevenue = projections[projections.length - 1].revenue;
    }
    
    return {
      breakEvenPoint,
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      isProfitable: projections[projections.length - 1].cumulativeProfit > 0,
    };
  }
  
  static calculateInvestmentAnalysis(financials: StartupFinancials): InvestmentAnalysis {
    const projections = this.calculateMonthlyProjections(financials);
    const totalInvestment = financials.initialInvestment + 
                           (financials.additionalInvestment * financials.investmentMonths);
    
    // Calculate monthly return (average monthly profit)
    const totalProfit = projections.reduce((sum, p) => sum + p.profit, 0);
    const monthlyReturn = totalProfit / projections.length;
    
    // Calculate payback period
    let paybackPeriod = 0;
    let cumulativeReturn = 0;
    
    for (const projection of projections) {
      cumulativeReturn += projection.profit;
      paybackPeriod++;
      if (cumulativeReturn >= totalInvestment) {
        break;
      }
    }
    
    // If never pays back, set to total months
    if (cumulativeReturn < totalInvestment) {
      paybackPeriod = projections.length;
    }
    
    // Calculate ROI
    const roi = ((totalProfit - totalInvestment) / totalInvestment) * 100;
    
    // Calculate NPV (simplified with 10% discount rate)
    const discountRate = 0.10;
    let npv = -totalInvestment;
    
    for (let i = 0; i < projections.length; i++) {
      const discountFactor = Math.pow(1 + discountRate, i + 1);
      npv += projections[i].profit / discountFactor;
    }
    
    // Calculate IRR (simplified approximation)
    const irr = this.calculateIRR(projections, totalInvestment);
    
    return {
      totalInvestment: Math.round(totalInvestment * 100) / 100,
      monthlyReturn: Math.round(monthlyReturn * 100) / 100,
      paybackPeriod,
      roi: Math.round(roi * 100) / 100,
      npv: Math.round(npv * 100) / 100,
      irr: Math.round(irr * 100) / 100,
    };
  }
  
  static calculateTotalStartupCosts(financials: StartupFinancials): number {
    return financials.equipment + financials.initialInventory + 
           financials.legalFees + financials.otherOneTimeCosts;
  }
  
  static calculateMonthlyFixedCosts(financials: StartupFinancials): number {
    return financials.rent + financials.salaries + financials.insurance + 
           financials.utilities + financials.marketing + financials.otherFixedCosts;
  }
  
  static calculateMonthlyVariableCosts(financials: StartupFinancials, revenue: number): number {
    return (revenue * financials.costOfGoodsSold / 100) + financials.variableCosts;
  }
  
  static calculateRevenueProjection(financials: StartupFinancials, months: number): number[] {
    const projections: number[] = [];
    
    for (let month = 1; month <= months; month++) {
      const revenue = financials.monthlyRevenue * Math.pow(1 + financials.revenueGrowthRate / 100, month - 1);
      projections.push(Math.round(revenue * 100) / 100);
    }
    
    return projections;
  }
  
  static calculateProfitProjection(financials: StartupFinancials, months: number): number[] {
    const projections: number[] = [];
    const fixedCosts = this.calculateMonthlyFixedCosts(financials);
    
    for (let month = 1; month <= months; month++) {
      const revenue = financials.monthlyRevenue * Math.pow(1 + financials.revenueGrowthRate / 100, month - 1);
      const variableCosts = this.calculateMonthlyVariableCosts(financials, revenue);
      const profit = revenue - fixedCosts - variableCosts;
      projections.push(Math.round(profit * 100) / 100);
    }
    
    return projections;
  }
  
  static generateFinancialSummary(financials: StartupFinancials): {
    totalStartupCosts: number;
    monthlyFixedCosts: number;
    breakEvenRevenue: number;
    breakEvenPoint: number;
    isProfitable: boolean;
    recommendations: string[];
  } {
    const totalStartupCosts = this.calculateTotalStartupCosts(financials);
    const monthlyFixedCosts = this.calculateMonthlyFixedCosts(financials);
    const breakEven = this.calculateBreakEven(financials);
    const projections = this.calculateMonthlyProjections(financials);
    const lastProjection = projections[projections.length - 1];
    
    const recommendations: string[] = [];
    
    // Analyze profitability
    if (!breakEven.isProfitable) {
      recommendations.push("Tu negocio no será rentable con los números actuales. Considera reducir costos o aumentar ingresos.");
    } else if (breakEven.breakEvenPoint > 12) {
      recommendations.push("El punto de equilibrio es muy lejano (>12 meses). Considera ajustar tu modelo de negocio.");
    }
    
    // Analyze costs
    if (monthlyFixedCosts > financials.monthlyRevenue * 0.8) {
      recommendations.push("Tus costos fijos son muy altos comparado con tus ingresos. Considera reducir gastos fijos.");
    }
    
    // Analyze growth
    if (financials.revenueGrowthRate < 5) {
      recommendations.push("Tu tasa de crecimiento es baja. Considera estrategias de marketing más agresivas.");
    }
    
    // Analyze investment
    if (totalStartupCosts > financials.initialInvestment) {
      recommendations.push("Necesitas más capital inicial para cubrir todos los costos de inicio.");
    }
    
    return {
      totalStartupCosts: Math.round(totalStartupCosts * 100) / 100,
      monthlyFixedCosts: Math.round(monthlyFixedCosts * 100) / 100,
      breakEvenRevenue: breakEven.breakEvenRevenue,
      breakEvenPoint: breakEven.breakEvenPoint,
      isProfitable: breakEven.isProfitable,
      recommendations,
    };
  }
  
  private static calculateIRR(projections: FinancialProjection[], initialInvestment: number): number {
    // Simplified IRR calculation using Newton-Raphson method
    let rate = 0.1; // Start with 10%
    const tolerance = 0.0001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = -initialInvestment;
      let npvDerivative = 0;
      
      for (let j = 0; j < projections.length; j++) {
        const discountFactor = Math.pow(1 + rate, j + 1);
        npv += projections[j].profit / discountFactor;
        npvDerivative -= (j + 1) * projections[j].profit / (discountFactor * (1 + rate));
      }
      
      if (Math.abs(npv) < tolerance) {
        break;
      }
      
      rate = rate - npv / npvDerivative;
      
      if (rate < 0) {
        rate = 0.01; // Minimum 1%
      }
    }
    
    return rate * 100; // Convert to percentage
  }
}
