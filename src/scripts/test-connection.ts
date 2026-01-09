// Set DATABASE_URL from SUPABASE_DATABASE_URL before importing Prisma
if (process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
}

import { getPrismaClient } from '../config/database';

async function testConnection() {
  console.log('Testing Prisma connection to Supabase database...\n');
  
  try {
    const prisma = getPrismaClient();
    
    // Test connection by running a simple query
    console.log('Attempting to connect...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    console.log('✅ Connection successful!');
    console.log('Test query result:', result);
    
    // Try to get database name
    const dbInfo = await prisma.$queryRaw<Array<{ current_database: string }>>`
      SELECT current_database() as current_database
    `;
    
    if (dbInfo && dbInfo.length > 0) {
      console.log(`📊 Connected to database: ${dbInfo[0].current_database}`);
    }
    
    // Test a simple table query (check if business table exists)
    try {
      const businessCount = await prisma.business.count();
      console.log(`📦 Business table accessible. Record count: ${businessCount}`);
    } catch (error: any) {
      console.log('⚠️  Business table query failed:', error.message);
    }
    
    // Test product table
    try {
      const productCount = await prisma.product.count();
      console.log(`📦 Product table accessible. Record count: ${productCount}`);
    } catch (error: any) {
      console.log('⚠️  Product table query failed:', error.message);
    }
    
    // Test service table
    try {
      const serviceCount = await prisma.service.count();
      console.log(`📦 Service table accessible. Record count: ${serviceCount}`);
    } catch (error: any) {
      console.log('⚠️  Service table query failed:', error.message);
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 This usually means:');
      console.error('   - Database server is not reachable');
      console.error('   - Wrong host or port in connection string');
      console.error('   - Firewall blocking the connection');
    } else if (error.code === 'P1000') {
      console.error('\n💡 This usually means:');
      console.error('   - Authentication failed');
      console.error('   - Wrong username or password');
    } else if (error.code === 'P1003') {
      console.error('\n💡 This usually means:');
      console.error('   - Database does not exist');
      console.error('   - Wrong database name in connection string');
    }
    
    console.error('\n📝 Please check your SUPABASE_DATABASE_URL in .env file');
    process.exit(1);
  }
}

testConnection();

