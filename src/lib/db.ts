import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

const config: PoolConfig = {
  connectionString: process.env.POSTGRES_PRISMA_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // 最大连接数
  idleTimeoutMillis: 60000, // 连接最大空闲时间，增加到60秒
  connectionTimeoutMillis: 10000, // 连接超时时间，增加到10秒
  statement_timeout: 10000, // 查询超时时间，10秒
  query_timeout: 10000, // 查询超时时间，10秒
  keepAlive: true, // 保持连接活跃
  keepAliveInitialDelayMillis: 10000, // 保持连接活跃的初始延迟
};

// 创建连接池
const pool = new Pool(config);

// 连接成功事件
pool.on('connect', () => {
  console.log('Database connected successfully');
});

// 连接错误事件
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  // 不要立即退出，给予重试机会
  // process.exit(-1);
});

// 包装查询函数，添加重试机制
async function queryWithRetry<T extends QueryResultRow>(
  queryText: string,
  params: any[] = [],
  maxRetries = 3
): Promise<QueryResult<T>> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Executing query attempt ${attempt}/${maxRetries}`);
      const result = await pool.query<T>(queryText, params);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Query attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// 测试连接
async function testConnection() {
  try {
    const result = await queryWithRetry<{ now: Date }>('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

// 执行连接测试
testConnection();

export { pool as default, queryWithRetry }; 