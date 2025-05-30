# Estrutura do Banco de Dados

Gerado em: 5/30/2025, 4:38:21 PM

## Índice de Tabelas

- [consultations](#tabela-consultations)
- [energy_plans](#tabela-energy_plans)
- [food_substitutes](#tabela-food_substitutes)
- [food_templates](#tabela-food_templates)
- [foods](#tabela-foods)
- [meal_foods](#tabela-meal_foods)
- [meal_plan_templates](#tabela-meal_plan_templates)
- [meal_plans](#tabela-meal_plans)
- [meal_templates](#tabela-meal_templates)
- [meals](#tabela-meals)
- [measurements](#tabela-measurements)
- [migrations](#tabela-migrations)
- [nutritionists](#tabela-nutritionists)
- [patient_photos](#tabela-patient_photos)
- [patients](#tabela-patients)
- [photos](#tabela-photos)


## Tabela: consultations {#tabela-consultations}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| date | timestamp without time zone | - | NO | NULL | FK,PK |
| patient_id | uuid | - | NO | NULL | FK,PK |
| nutritionist_id | uuid | - | NO | NULL | FK,PK |
| notes | text | - | YES | NULL | FK,PK |
| status | USER-DEFINED | - | NO | 'scheduled' | FK,PK |
| type | USER-DEFINED | - | NO | 'follow_up' | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |

## Tabela: energy_plans {#tabela-energy_plans}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| patient_id | uuid | - | NO | NULL | FK,PK |
| nutritionist_id | uuid | - | NO | NULL | FK,PK |
| consultation_id | uuid | - | YES | NULL | FK,PK |
| name | character varying(255) | 255 | NO | NULL | FK,PK |
| calculation_date | date | - | NO | CURRENT_DATE | FK,PK |
| weight_at_calculation_kg | numeric | - | NO | NULL | FK,PK |
| height_at_calculation_cm | numeric | - | NO | NULL | FK,PK |
| fat_free_mass_at_calculation_kg | numeric | - | YES | NULL | FK,PK |
| age_at_calculation_years | integer | - | NO | NULL | FK,PK |
| gender_at_calculation | character varying(10) | 10 | NO | NULL | FK,PK |
| formula_key | character varying(100) | 100 | NO | NULL | FK,PK |
| activity_factor_key | character varying(50) | 50 | YES | NULL | FK,PK |
| injury_factor_key | character varying(50) | 50 | YES | NULL | FK,PK |
| additional_met_details | jsonb | - | YES | NULL | FK,PK |
| additional_met_total_kcal | numeric | - | YES | NULL | FK,PK |
| weight_goal_details | jsonb | - | YES | NULL | FK,PK |
| additional_pregnancy_kcal | numeric | - | YES | NULL | FK,PK |
| pregnancy_specific_inputs | jsonb | - | YES | NULL | FK,PK |
| custom_tmb_kcal_input | numeric | - | YES | NULL | FK,PK |
| custom_get_kcal_input | numeric | - | YES | NULL | FK,PK |
| calculated_tmb_kcal | numeric | - | YES | NULL | FK,PK |
| calculated_get_kcal | numeric | - | NO | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |
| macronutrient_distribution | jsonb | - | YES | NULL | FK,PK |

## Tabela: food_substitutes {#tabela-food_substitutes}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| original_food_id | character varying(100) | 100 | NO | NULL | FK,PK |
| original_source | character varying(50) | 50 | NO | NULL | FK,PK |
| substitute_food_id | character varying(100) | 100 | NO | NULL | FK,PK |
| substitute_source | character varying(50) | 50 | NO | NULL | FK,PK |
| substitute_amount | numeric | - | NO | NULL | FK,PK |
| substitute_unit | character varying(100) | 100 | NO | NULL | FK,PK |
| nutritionist_id | uuid | - | YES | NULL | FK,PK |
| created_at | timestamp without time zone | - | YES | now() | FK,PK |
| updated_at | timestamp without time zone | - | YES | now() | FK,PK |

## Tabela: food_templates {#tabela-food_templates}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| meal_template_id | uuid | - | NO | NULL | FK,PK |
| name | character varying | - | NO | NULL | FK,PK |
| portion | character varying | - | NO | NULL | FK,PK |
| calories | numeric | - | YES | NULL | FK,PK |
| protein | numeric | - | YES | NULL | FK,PK |
| carbs | numeric | - | YES | NULL | FK,PK |
| fat | numeric | - | YES | NULL | FK,PK |
| category | character varying | - | YES | NULL | FK,PK |
| tags | jsonb | - | YES | NULL | FK,PK |
| searchVector | tsvector | - | NO | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |

## Tabela: foods {#tabela-foods}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | PK |
| name | character varying | - | NO | NULL | PK |
| externalId | character varying | - | YES | NULL | PK |
| servingSize | numeric | - | NO | NULL | PK |
| servingUnit | character varying | - | NO | NULL | PK |
| calories | numeric | - | NO | NULL | PK |
| protein | numeric | - | NO | NULL | PK |
| carbohydrates | numeric | - | NO | NULL | PK |
| fat | numeric | - | NO | NULL | PK |
| fiber | numeric | - | YES | NULL | PK |
| sugar | numeric | - | YES | NULL | PK |
| sodium | numeric | - | YES | NULL | PK |
| additionalNutrients | jsonb | - | YES | NULL | PK |
| categories | ARRAY | - | NO | '{}' | PK |
| isFavorite | boolean | - | NO | false | PK |
| version | integer | - | NO | 1 | PK |
| is_verified | boolean | - | NO | false | PK |
| source | character varying | - | YES | NULL | PK |
| source_id | character varying | - | YES | NULL | PK |
| usage_count_meal_plans | integer | - | NO | 0 | PK |
| usage_count_favorites | integer | - | NO | 0 | PK |
| usage_count_searches | integer | - | NO | 0 | PK |
| category_hierarchy | jsonb | - | YES | NULL | PK |
| createdAt | timestamp without time zone | - | NO | now() | PK |
| updatedAt | timestamp without time zone | - | NO | now() | PK |
| external_id | character varying | - | YES | NULL | PK |

## Tabela: meal_foods {#tabela-meal_foods}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| amount | numeric | - | NO | NULL | FK,PK |
| unit | character varying | - | NO | NULL | FK,PK |
| createdAt | timestamp without time zone | - | NO | now() | FK,PK |
| updatedAt | timestamp without time zone | - | NO | now() | FK,PK |
| mealId | uuid | - | YES | NULL | FK,PK |
| foodId | character varying(100) | 100 | YES | NULL | FK,PK |
| source | character varying(50) | 50 | YES | NULL | FK,PK |

## Tabela: meal_plan_templates {#tabela-meal_plan_templates}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| name | character varying | - | NO | NULL | FK,PK |
| description | text | - | YES | NULL | FK,PK |
| nutritionist_id | uuid | - | YES | NULL | FK,PK |
| is_public | boolean | - | NO | false | FK,PK |
| tags | jsonb | - | YES | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |

## Tabela: meal_plans {#tabela-meal_plans}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| name | character varying | - | NO | NULL | FK,PK |
| description | text | - | YES | NULL | FK,PK |
| patient_id | uuid | - | NO | NULL | FK,PK |
| nutritionist_id | uuid | - | NO | NULL | FK,PK |
| startDate | timestamp without time zone | - | NO | NULL | FK,PK |
| endDate | timestamp without time zone | - | NO | NULL | FK,PK |
| createdAt | timestamp without time zone | - | NO | now() | FK,PK |
| updatedAt | timestamp without time zone | - | NO | now() | FK,PK |
| dailyCalories | numeric | - | NO | '0' | FK,PK |
| dailyProtein | numeric | - | NO | '0' | FK,PK |
| dailyCarbs | numeric | - | NO | '0' | FK,PK |
| dailyFat | numeric | - | NO | '0' | FK,PK |
| energy_plan_id | uuid | - | YES | NULL | FK,PK |

## Tabela: meal_templates {#tabela-meal_templates}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| plan_template_id | uuid | - | NO | NULL | FK,PK |
| name | character varying | - | NO | NULL | FK,PK |
| description | text | - | YES | NULL | FK,PK |
| time | time without time zone | - | YES | NULL | FK,PK |
| order_index | integer | - | NO | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |

## Tabela: meals {#tabela-meals}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| name | character varying | - | NO | NULL | FK,PK |
| time | time without time zone | - | NO | NULL | FK,PK |
| description | text | - | YES | NULL | FK,PK |
| createdAt | timestamp without time zone | - | NO | now() | FK,PK |
| updatedAt | timestamp without time zone | - | NO | now() | FK,PK |
| totalCalories | numeric | - | NO | '0' | FK,PK |
| totalProtein | numeric | - | NO | '0' | FK,PK |
| totalCarbs | numeric | - | NO | '0' | FK,PK |
| totalFat | numeric | - | NO | '0' | FK,PK |
| mealPlanId | uuid | - | YES | NULL | FK,PK |
| is_active_for_calculation | boolean | - | NO | true | FK,PK |

## Tabela: measurements {#tabela-measurements}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| date | date | - | NO | NULL | FK,PK |
| weight | numeric | - | NO | NULL | FK,PK |
| height | numeric | - | YES | NULL | FK,PK |
| sittingHeight | numeric | - | YES | NULL | FK,PK |
| kneeHeight | numeric | - | YES | NULL | FK,PK |
| bodyFat | numeric | - | YES | NULL | FK,PK |
| fatMass | numeric | - | YES | NULL | FK,PK |
| muscleMassPercentage | numeric | - | YES | NULL | FK,PK |
| muscleMass | numeric | - | YES | NULL | FK,PK |
| fatFreeMass | numeric | - | YES | NULL | FK,PK |
| boneMass | numeric | - | YES | NULL | FK,PK |
| visceralFat | numeric | - | YES | NULL | FK,PK |
| bodyWater | numeric | - | YES | NULL | FK,PK |
| metabolicAge | integer | - | YES | NULL | FK,PK |
| measurements | jsonb | - | NO | NULL | FK,PK |
| skinfolds | jsonb | - | YES | NULL | FK,PK |
| boneDiameters | jsonb | - | YES | NULL | FK,PK |
| skinfoldFormula | character varying(50) | 50 | YES | NULL | FK,PK |
| patient_id | uuid | - | NO | NULL | FK,PK |
| nutritionist_id | uuid | - | NO | NULL | FK,PK |
| consultation_id | uuid | - | YES | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |

## Tabela: migrations {#tabela-migrations}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | integer | - | NO | nextval('migrations_id_seq' | PK |
| timestamp | bigint | - | NO | NULL | PK |
| name | character varying | - | NO | NULL | PK |

## Tabela: nutritionists {#tabela-nutritionists}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | PK |
| name | character varying | - | NO | NULL | PK |
| email | character varying | - | NO | NULL | PK |
| passwordHash | character varying | - | NO | NULL | PK |
| phone | character varying | - | YES | NULL | PK |
| crn | character varying | - | YES | NULL | PK |
| specialties | jsonb | - | YES | NULL | PK |
| clinicName | character varying | - | YES | NULL | PK |
| created_at | timestamp without time zone | - | NO | now() | PK |
| updated_at | timestamp without time zone | - | NO | now() | PK |
| photo_url | character varying | - | YES | NULL | PK |
| instagram | character varying | - | YES | NULL | PK |
| custom_colors | jsonb | - | YES | NULL | PK |
| custom_fonts | jsonb | - | YES | NULL | PK |
| logo_url | character varying | - | YES | NULL | PK |

## Tabela: patient_photos {#tabela-patient_photos}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| patient_id | uuid | - | NO | NULL | FK,PK |
| nutritionist_id | uuid | - | NO | NULL | FK,PK |
| photoUrl | character varying | - | NO | NULL | FK,PK |
| photoType | USER-DEFINED | - | NO | 'other' | FK,PK |
| photoDate | date | - | NO | NULL | FK,PK |
| notes | text | - | YES | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |

## Tabela: patients {#tabela-patients}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| name | character varying | - | NO | NULL | FK,PK |
| email | character varying | - | YES | NULL | FK,PK |
| cpf | character varying | - | YES | NULL | FK,PK |
| phone | character varying | - | YES | NULL | FK,PK |
| address | character varying | - | YES | NULL | FK,PK |
| birthDate | date | - | YES | NULL | FK,PK |
| gender | USER-DEFINED | - | YES | NULL | FK,PK |
| instagram | character varying | - | YES | NULL | FK,PK |
| status | USER-DEFINED | - | NO | 'active' | FK,PK |
| height | numeric | - | YES | NULL | FK,PK |
| weight | numeric | - | YES | NULL | FK,PK |
| goals | jsonb | - | YES | NULL | FK,PK |
| allergies | jsonb | - | YES | NULL | FK,PK |
| healthConditions | jsonb | - | YES | NULL | FK,PK |
| medications | jsonb | - | YES | NULL | FK,PK |
| observations | character varying | - | YES | NULL | FK,PK |
| nutritionist_id | uuid | - | YES | NULL | FK,PK |
| lastConsultationAt | timestamp without time zone | - | YES | NULL | FK,PK |
| nextConsultationAt | timestamp without time zone | - | YES | NULL | FK,PK |
| monitoringStatus | USER-DEFINED | - | NO | 'in_progress' | FK,PK |
| consultationFrequency | USER-DEFINED | - | NO | 'monthly' | FK,PK |
| customConsultationDays | integer | - | YES | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |
| isSample | boolean | - | NO | false | FK,PK |
| photo_url | character varying | - | YES | NULL | FK,PK |

## Tabela: photos {#tabela-photos}

| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |
|--------|------|----------|----------|----------|------------|
| id | uuid | - | NO | extensions.uuid_generate_v4() | FK,PK |
| patientId | uuid | - | NO | NULL | FK,PK |
| assessmentId | uuid | - | YES | NULL | FK,PK |
| type | USER-DEFINED | - | NO | NULL | FK,PK |
| url | character varying | - | NO | NULL | FK,PK |
| thumbnail_url | character varying | - | NO | NULL | FK,PK |
| storage_path | character varying | - | NO | NULL | FK,PK |
| created_at | timestamp without time zone | - | NO | now() | FK,PK |
| updated_at | timestamp without time zone | - | NO | now() | FK,PK |
| deleted_at | timestamp without time zone | - | YES | NULL | FK,PK |

## Informações do Banco

- **Host:** localhost
- **Porta:** 5432
- **Banco de Dados:** smartnutri_db
- **Schema:** public
