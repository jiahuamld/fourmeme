// 代币信息
// ID：673508
// 链：以太坊 (ETH)
// 地址：0x8e938f7c4481135cb82ba43908b670ac0eda93fc
// 符号：LUIGI
// Logo：LUIGI Logo
// 当前价格：0.0030329323
// 价格变动：
// 1小时：-16.61%
// 5分钟：-8.00%
// 1分钟：-0.74%
// 24小时：-16.61%
// 市场数据
// 24小时交易量：686,534.57 USD
// 流动性：397,159.07 USD
// 市值：3,032,932.3 USD
// 交易次数：300
// 持有者数量：571
// 税务与合约
// 买入税：0%
// 卖出税：0%
// 是否为蜜罐（honeypot）：否
// 是否开源：是
// 是否放弃合约（Renounced）：是
// 社交链接
// Twitter：LUIGI_Token
// 网站：freeluigi.xyz
// Telegram：Free_Luigi_Official
// 锁仓与流动性
// 锁仓信息：
// 锁仓池：UNCX
// 锁仓比例：99.99%
// 锁仓剩余时间：28天
// 剩余未锁仓比例：0.05%
// 其他信息
// 创建者的代币状态：创建者已添加流动性
// 是否关闭：否
// 智能钱包买入：13
// 智能钱包卖出：8
// 智能交易者数量：0


import { NextResponse } from 'next/server';

const API_KEY = process.env.SCRAPER_API_KEY || 'c934e01c97f502cbb432893785000db7';
const BASE_URL = 'https://api.scraperapi.com/';
const TARGET_URL = 'https://gmgn.ai/defi/quotation/v1/rank/eth/swaps/1h';

export async function GET() {
  try {
    const params = new URLSearchParams({
      'api_key': API_KEY,
      'url': TARGET_URL,
      'orderby': 'swaps',
      'direction': 'desc',
      'filters[]': ['not_honeypot', 'verified', 'renounced']
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
  
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 