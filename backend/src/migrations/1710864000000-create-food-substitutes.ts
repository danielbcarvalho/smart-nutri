import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFoodSubstitutes1710864000000 implements MigrationInterface {
  name = 'CreateFoodSubstitutes1710864000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE food_substitutes (
                id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
                original_food_id VARCHAR(100) NOT NULL,
                original_source VARCHAR(50) NOT NULL,
                substitute_food_id VARCHAR(100) NOT NULL,
                substitute_source VARCHAR(50) NOT NULL,
                substitute_amount NUMERIC NOT NULL,
                substitute_unit VARCHAR(100) NOT NULL,
                nutritionist_id UUID REFERENCES nutritionists(id),
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                
                UNIQUE(original_food_id, original_source, substitute_food_id, substitute_source, nutritionist_id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE food_substitutes;`);
  }
}
