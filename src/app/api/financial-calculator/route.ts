import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FinancialCalculatorService } from "@/lib/financialCalculatorService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, inputs } = body;

    if (!type || !inputs) {
      return NextResponse.json(
        { error: "Type and inputs are required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "financial_metrics":
        result = FinancialCalculatorService.calculateFinancialMetrics(inputs);
        break;

      case "investment_metrics":
        result = FinancialCalculatorService.calculateInvestmentMetrics(inputs);
        break;

      case "loan_metrics":
        result = FinancialCalculatorService.calculateLoanMetrics(inputs);
        break;

      case "break_even":
        result = FinancialCalculatorService.calculateBreakEven(inputs);
        break;

      case "revenue_projections":
        result = FinancialCalculatorService.calculateRevenueProjections(inputs);
        break;

      case "customer_metrics":
        result = FinancialCalculatorService.calculateCustomerMetrics(inputs);
        break;

      case "valuation":
        result = FinancialCalculatorService.calculateValuation(inputs);
        break;

      case "compound_interest":
        result = FinancialCalculatorService.calculateCompoundInterest(inputs);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid calculation type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      type
    });

  } catch (error) {
    console.error("Financial calculation error:", error);
    return NextResponse.json(
      { error: "Calculation failed" },
      { status: 500 }
    );
  }
}
