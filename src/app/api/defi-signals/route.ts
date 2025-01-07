// https://gmgn.ai/defi/quotation/v1/signals?size=10&better=true

// first_entry_price：首次价格为 0.0000115808298670682。
// id：信号 ID 为 228576。
// is_first：该信号不是首次信号，false。
// link：包含相关链接，包括 Twitter 用户名和网站地址：
// Twitter: OmniAgent_App
// 网站: OmniAgent
// previous_signals：前一个信号的相关数据，包括代币地址、历史信号 ID 等。


// price_change：价格变化为 59.073281669399066%，即价格有显著上涨。
// price_change_review：价格变动的评估为 60.073281669399066%。
// price_review：当前价格评估为 0.0006956984545697773。
// recent_buys：近期购买情况，包括智能钱包、跟随钱包的买入情况等，但目前为零。
// review_to_timestamp：信号评估的时间戳为 1734022847。
// signal_1h_count：该信号的 1 小时内计数为 1。
// signal_type：信号类型为 review，即对价格评估的回顾。
// smart_buy 和 smart_sell：分别为 16 和 16，可能代表智能钱包的买入和卖出次数。
// timestamp：信号时间戳为 1734087625。
// token：代币详细信息，包括：
// id：代币 ID 为 673378。
// chain：代币所在区块链为 eth（以太坊）。
// address：代币合约地址为 0x9e456714f6d4101d230b1f0aa9d9a25f72780ca6。


// token_address：代币地址同样为 0x9e456714f6d4101d230b1f0aa9d9a25f72780ca6。
// token_price：代币当前价格为 0.0000115808298670682。



import { NextResponse } from 'next/server';

const API_KEY = process.env.SCRAPER_API_KEY || 'c934e01c97f502cbb432893785000db7';
const BASE_URL = 'https://api.scraperapi.com/';
const TARGET_URL = 'https://gmgn.ai/defi/quotation/v1/signals';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size') || '10';
    const better = searchParams.get('better') || 'true';

    const params = new URLSearchParams({
      'api_key': API_KEY,
      'url': `${TARGET_URL}?size=${size}&better=${better}`
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
  
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 


