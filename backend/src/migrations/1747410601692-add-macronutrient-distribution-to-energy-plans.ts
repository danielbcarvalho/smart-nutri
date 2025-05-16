import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMacronutrientDistributionToEnergyPlans1747410601692
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'energy_plans',
      new TableColumn({
        name: 'macronutrient_distribution',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('energy_plans', 'macronutrient_distribution');
  }
}
