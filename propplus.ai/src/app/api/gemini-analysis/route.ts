import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { t12Data, rentRollData, propertyInfo, userCriteria = {} } = await req.json();

    // Use user-supplied criteria or fallback to defaults
    const minCoCReturn = userCriteria.minCoCReturn;
    const capRateRange = userCriteria.capRateRange;
    const yearBuiltThreshold = userCriteria.yearBuiltThreshold;
    const holdPeriod = userCriteria.holdPeriod;
    const minDSCR = userCriteria.minDSCR;
    const marketConditions = userCriteria.marketConditions;
    const propertyCondition = userCriteria.propertyCondition;

    console.log('userCriteria:', userCriteria);

    // Use env variable if set, otherwise fallback to the provided key (for immediate testing)
    const geminiApiKey = process.env.GEMINI_API_KEY || "AIzaSyB8yCLrTAx1Nb7oh4YgTtT47TOW3wgOLIk";
    
    const prompt = `You are PropPulse AI, a commercial real estate underwriting platform. Analyze the following T12 (Trailing 12 Months) and Rent Roll data to provide accurate financial predictions and insights.

PROPERTY INFORMATION:
${JSON.stringify(propertyInfo, null, 2)}

T12 DATA (Trailing 12 Months):
${JSON.stringify(t12Data, null, 2)}

RENT ROLL DATA:
${JSON.stringify(rentRollData, null, 2)}

Please provide a comprehensive analysis including:

1. FINANCIAL METRICS:
- Cap Rate calculation and analysis
- Cash-on-Cash return calculation
- IRR (Internal Rate of Return) projection
- DSCR (Debt Service Coverage Ratio) analysis
- NOI (Net Operating Income) trends
- Gross Rent Multiplier (GRM)

2. MARKET ANALYSIS:
- Rent growth trends and projections
- Occupancy rate analysis
- Market positioning assessment
- Comparable property analysis

3. RISK ASSESSMENT:
- Vacancy risk factors
- Rent collection risk
- Market volatility indicators
- Property condition risks

4. RECOMMENDATIONS:
- Value-add opportunities
- Pricing recommendations
- Financing suggestions
- Exit strategy options

5. CONFIDENCE SCORE CALCULATION:
Calculate confidence score (0-100%) based on these key factors:
- Min CoC Return: Target ${minCoCReturn} (weight: 25%)
- Cap Rate: Target ${capRateRange} (weight: 20%)
- Year Built Threshold: Prefer ${yearBuiltThreshold} (weight: 15%)
- Target Hold Period: ${holdPeriod} (weight: 10%)
- DSCR: Target ${minDSCR} (weight: 15%)
- Market Conditions: ${marketConditions} (weight: 10%)
- Property Condition: ${propertyCondition} (weight: 5%)

Return the analysis in this exact JSON format:
{
  "financialMetrics": {
    "capRate": "6.2%",
    "cashOnCash": "8.4%",
    "irr": "14.7%",
    "dscr": "1.34",
    "noi": "$187,200",
    "grm": "8.2",
    "purchasePrice": "$2,850,000",
    "grossRent": "$312,000",
    "expenses": "$124,800"
  },
  "marketAnalysis": {
    "rentGrowth": "4.2%",
    "occupancyRate": "96%",
    "marketTrend": "Strong growth",
    "comparableProperties": [
      {
        "address": "1556 Oak St",
        "distance": "0.3 mi",
        "price": "$2,650,000",
        "capRate": "5.9%",
        "cashOnCash": "7.8%"
      }
    ]
  },
  "riskAnalysis": [
    {
      "level": "Medium",
      "factor": "Crime rate 12% above city average",
      "impact": "May affect tenant retention"
    },
    {
      "level": "Low",
      "factor": "Property built in 1998, major systems aging",
      "impact": "Potential maintenance costs"
    }
  ],
  "recommendations": [
    "Negotiate purchase price down by 5% to improve returns",
    "Consider value-add opportunities in units 12-24",
    "Budget additional $25k for deferred maintenance"
  ],
  "confidenceScore": 87,
  "confidenceFactors": {
    "cocReturn": {
      "value": "8.4%",
      "target": "7.0%",
      "score": 100,
      "weight": 25
    },
    "capRate": {
      "value": "6.2%",
      "target": "5.5-7.5%",
      "score": 100,
      "weight": 20
    },
    "yearBuilt": {
      "value": "1998",
      "target": "1990+",
      "score": 80,
      "weight": 15
    },
    "holdPeriod": {
      "value": "7 years",
      "target": "5-10 years",
      "score": 100,
      "weight": 10
    },
    "dscr": {
      "value": "1.34",
      "target": "1.25+",
      "score": 100,
      "weight": 15
    },
    "marketConditions": {
      "value": "Strong",
      "score": 90,
      "weight": 10
    },
    "propertyCondition": {
      "value": "Good",
      "score": 85,
      "weight": 5
    }
  },
  "dealPasses": true,
  "summary": "Strong cash-on-cash return at 8.4% exceeds required 7.0%"
}

Provide accurate, realistic numbers based on the data provided. Focus on commercial real estate underwriting best practices.`;

    const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText, "API Key present:", !!geminiApiKey);
      throw new Error("Gemini API failed");
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    let analysisResult;
    try {
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      analysisResult = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      throw new Error("Invalid response from Gemini API");
    }

    // Enforce pass/fail logic based on confidenceScore
    if (typeof analysisResult.confidenceScore === 'number') {
      analysisResult.dealPasses = analysisResult.confidenceScore >= 80;
      analysisResult.summary = analysisResult.dealPasses
        ? `Deal PASSES with ${analysisResult.confidenceScore}% confidence.`
        : `Deal FAILS with ${analysisResult.confidenceScore}% confidence.`;
    }

    // Overwrite confidenceFactors.target with user-supplied values
    if (analysisResult.confidenceFactors && userCriteria) {
      if (analysisResult.confidenceFactors.cocReturn && minCoCReturn)
        analysisResult.confidenceFactors.cocReturn.target = `${minCoCReturn}`;
      if (analysisResult.confidenceFactors.capRate && capRateRange)
        analysisResult.confidenceFactors.capRate.target = capRateRange;
      if (analysisResult.confidenceFactors.yearBuilt && yearBuiltThreshold)
        analysisResult.confidenceFactors.yearBuilt.target = yearBuiltThreshold;
      if (analysisResult.confidenceFactors.holdPeriod && holdPeriod)
        analysisResult.confidenceFactors.holdPeriod.target = holdPeriod;
      if (analysisResult.confidenceFactors.dscr && minDSCR)
        analysisResult.confidenceFactors.dscr.target = minDSCR;
      if (analysisResult.confidenceFactors.marketConditions && marketConditions)
        analysisResult.confidenceFactors.marketConditions.target = marketConditions;
      if (analysisResult.confidenceFactors.propertyCondition && propertyCondition)
        analysisResult.confidenceFactors.propertyCondition.target = propertyCondition;
    }
    console.log('Final confidenceFactors:', analysisResult.confidenceFactors);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error("Error in Gemini analysis:", error);
    return NextResponse.json({ 
      error: "Failed to analyze data", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 