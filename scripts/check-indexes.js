const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIndexes() {
  try {
    const result = await prisma.$queryRaw`
      SHOW INDEX FROM Story;
    `;

    console.log('\n📊 Story Table Indexes:');
    console.log('========================\n');

    const indexes = {};
    result.forEach(row => {
      const indexName = row.Key_name;
      if (!indexes[indexName]) {
        indexes[indexName] = [];
      }
      indexes[indexName].push(row.Column_name);
    });

    Object.entries(indexes).forEach(([name, columns]) => {
      console.log(`✓ ${name}: [${columns.join(', ')}]`);
    });

    console.log('\n');
  } catch (error) {
    console.error('Error checking indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIndexes();
