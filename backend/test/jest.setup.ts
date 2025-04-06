import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TypeOrmConfigService } from '../src/config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

let dataSource: DataSource;

beforeAll(async () => {
  console.log('Setting up test environment...');
  jest.setTimeout(30000); // Increase timeout to 30 seconds

  try {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    console.log('Module compiled successfully');

    const app = moduleRef.createNestApplication();
    await app.init();
    console.log('Application initialized');

    // Get the data source
    dataSource = app.get(DataSource);
    console.log('Data source retrieved');

    // Verify database connection
    if (dataSource.isInitialized) {
      console.log('Database connection is initialized');

      // Drop all tables and recreate them
      await dataSource.dropDatabase();
      await dataSource.synchronize();
      console.log('Database schema recreated');
    } else {
      console.log('Database connection is not initialized');
    }
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
}, 30000);

beforeEach(async () => {
  console.log('Cleaning up database before test...');
  try {
    // Clean up the database before each test
    if (dataSource && dataSource.isInitialized) {
      const entities = dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
        console.log(`Truncated table: ${entity.tableName}`);
      }
    } else {
      console.log('Data source not initialized, skipping cleanup');
    }
  } catch (error) {
    console.error('Error in beforeEach cleanup:', error);
    throw error;
  }
});

afterAll(async () => {
  console.log('Cleaning up after all tests...');
  try {
    // Clean up the database after all tests
    if (dataSource && dataSource.isInitialized) {
      const entities = dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
        console.log(`Truncated table: ${entity.tableName}`);
      }
      await dataSource.destroy();
      console.log('Data source destroyed');
    } else {
      console.log('Data source not initialized, skipping cleanup');
    }
  } catch (error) {
    console.error('Error in afterAll cleanup:', error);
    throw error;
  }
});
