import prisma from './config/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        console.log('🔌 Testing Prisma connection to Docker MySQL...');
        console.log(`📍 Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')}`);
        
        // Test raw query to check connection
        await prisma.$queryRaw`SELECT 1 as connection_test`;
        
        console.log('✅ SUCCESS: Prisma successfully connected to MySQL!');
        console.log('✅ Docker MySQL is running and accessible');
        
        // Get database version
        const result = await prisma.$queryRaw`SELECT VERSION() as version`;
        console.log(`📊 MySQL Version: ${result[0].version}`);
        
        // Check database name
        const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as db_name`;
        console.log(`🗄️  Database Name: ${dbInfo[0].db_name}`);
        
    } catch (error) {
        console.error('❌ ERROR: Failed to connect to MySQL');
        console.error('Error details:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Troubleshooting:');
            console.error('   1. Check if Docker containers are running: docker-compose ps');
            console.error('   2. Make sure MySQL container is healthy');
            console.error('   3. Verify port 3306 is not blocked');
        } else if (error.message.includes('Access denied')) {
            console.error('\n💡 Troubleshooting:');
            console.error('   1. Check DATABASE_URL credentials in .env file');
            console.error('   2. Verify MySQL root password is correct');
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

testConnection();
