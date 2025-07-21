import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🧪 Testing property data API...");
    
    // Test with a simple LA location
    const testLocation = "Los Angeles, CA";
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/property-data?location=${encodeURIComponent(testLocation)}`);
    
    if (!response.ok) {
      throw new Error(`API test failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Property data API test successful:", data);
    
    return NextResponse.json({
      success: true,
      message: "Property data API is working correctly",
      data: {
        capRate: data.capRate,
        cashOnCash: data.cashOnCash,
        irr: data.irr,
        propertyValue: data.propertyValue
      }
    });
    
  } catch (error) {
    console.error("❌ Property data API test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Property data API test failed"
    }, { status: 500 });
  }
} 