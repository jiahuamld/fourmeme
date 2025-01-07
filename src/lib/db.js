import { Pool } from 'pg';

// 使用连接池而不是单个客户端连接，以获得更好的性能
const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});

export default pool; 