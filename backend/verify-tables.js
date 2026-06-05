import prisma from './config/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyTables() {
    try {
        console.log('📊 Verifying database tables...\n');
        
        // Check tables exist
        const tables = await prisma.$queryRaw`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'cartdb' 
            AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `;
        
        console.log('✅ Tables created:');
        tables.forEach(table => {
            console.log(`   - ${table.TABLE_NAME}`);
        });
        
        // Check foreign keys
        console.log('\n✅ Foreign key constraints:');
        const foreignKeys = await prisma.$queryRaw`
            SELECT 
                CONSTRAINT_NAME,
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'cartdb'
            AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY TABLE_NAME, CONSTRAINT_NAME
        `;
        
        foreignKeys.forEach(fk => {
            console.log(`   - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
        
        // Check indexes
        console.log('\n✅ Indexes:');
        const indexes = await prisma.$queryRaw`
            SELECT 
                TABLE_NAME,
                INDEX_NAME,
                GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
            FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = 'cartdb'
            AND INDEX_NAME != 'PRIMARY'
            GROUP BY TABLE_NAME, INDEX_NAME
            ORDER BY TABLE_NAME, INDEX_NAME
        `;
        
        indexes.forEach(idx => {
            console.log(`   - ${idx.TABLE_NAME}.${idx.INDEX_NAME} (${idx.COLUMNS})`);
        });
        
        // Check enums
        console.log('\n✅ Enum values:');
        const enums = await prisma.$queryRaw`
            SELECT 
                COLUMN_NAME,
                TABLE_NAME,
                COLUMN_TYPE
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = 'cartdb'
            AND DATA_TYPE = 'enum'
            ORDER BY TABLE_NAME, COLUMN_NAME
        `;
        
        enums.forEach(e => {
            console.log(`   - ${e.TABLE_NAME}.${e.COLUMN_NAME}: ${e.COLUMN_TYPE}`);
        });
        
        console.log('\n✅ All database structures verified successfully!');
        console.log('\n📝 You can view the tables in phpMyAdmin at: http://localhost:8080');
        
    } catch (error) {
        console.error('❌ Error verifying tables:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyTables();
