import { NextResponse } from 'next/server';

const API_KEY = process.env.SCRAPER_API_KEY || 'c934e01c97f502cbb432893785000db7';
const BASE_URL = 'https://api.scraperapi.com/';
const TARGET_URL = 'https://gmgn.ai/defi/quotation/v1/trend_data';

export async function GET() {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams({
      trending_limit: '3',
      wallet_limit: '20',
      signal_limit: '20',
      holding_limit: '5'
    }).toString();

    const params = new URLSearchParams({
      'api_key': API_KEY,
      'url': `${TARGET_URL}?${queryParams}`
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trend data' },
      { status: 500 }
    );
  }
} 