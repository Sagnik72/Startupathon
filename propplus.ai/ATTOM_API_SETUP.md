# ATTOM Data API Integration Setup

## Overview
PropPulse AI now integrates with ATTOM Data Solutions to fetch real property data for commercial real estate underwriting analysis.

## ATTOM API Features Used

### 1. Property Detail API
- **Endpoint**: `/property/detail`
- **Purpose**: Get comprehensive property information
- **Data**: Property characteristics, sales history, building details

### 2. Sales Trend API
- **Endpoint**: `/salestrend/detail`
- **Purpose**: Get market trends and appreciation rates
- **Data**: Sales trends, market analysis, appreciation rates

### 3. Assessment API
- **Endpoint**: `/assessment/detail`
- **Purpose**: Get property assessment and tax data
- **Data**: Assessed values, tax information, property valuations

## Setup Instructions

### 1. Get ATTOM API Key
1. Visit [ATTOM Data API Developer Portal](https://api.developer.attomdata.com/)
2. Sign up for a developer account
3. Request API access for Property API
4. Get your API key from the dashboard

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
# ATTOM Data API Configuration
ATTOM_API_KEY=your_actual_attom_api_key_here

# Other environment variables...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. API Endpoints Used

#### Property Detail
```
GET https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?address1={address}
```

#### Sales Trend
```
GET https://api.gateway.attomdata.com/propertyapi/v1.0.0/salestrend/detail?zipcode={zipcode}
```

#### Assessment
```
GET https://api.gateway.attomdata.com/propertyapi/v1.0.0/assessment/detail?address1={address}
```

## Data Transformation

The API transforms ATTOM data into PropPulse format:

### Financial Metrics Calculated
- **Cap Rate**: Based on NOI and property value
- **Cash on Cash**: Based on down payment and cash flow
- **IRR**: Based on cap rate and appreciation rates

### Property Details
- Property value from assessment or sales data
- Square footage from building details
- Year built from property records
- Units count for multifamily properties

### Market Analysis
- Sales trends and appreciation rates
- Market score and outlook
- Comparable properties analysis

## Fallback System

If ATTOM API fails, the system falls back to:
- Dynamic data generation based on location
- Consistent data structure
- Professional analysis and insights

## API Rate Limits

- ATTOM API has rate limits based on your plan
- The system includes error handling for rate limits
- Fallback data ensures continuous operation

## Testing

1. Start the development server: `npm run dev`
2. Go to the demo page: `http://localhost:3000/demo`
3. Enter a property address (e.g., "123 Main St, Los Angeles, CA")
4. Check the Market Analysis section for ATTOM data

## Data Sources Displayed

- **ATTOM Data Solutions**: 150+ million properties
- **County Assessor Records**: Property assessments
- **MLS Data**: Sales and market trends

## Benefits

1. **Real Property Data**: Actual property records and assessments
2. **Market Trends**: Real sales trends and appreciation rates
3. **Comprehensive Coverage**: 150+ million properties nationwide
4. **Professional Analysis**: AI-powered insights based on real data
5. **Reliable Fallbacks**: System continues working even if API fails

## Support

For ATTOM API issues:
- Check [ATTOM API Documentation](https://api.developer.attomdata.com/docs)
- Verify API key and permissions
- Check rate limits and usage

For PropPulse integration issues:
- Check environment variables
- Verify API endpoints
- Review console logs for errors 