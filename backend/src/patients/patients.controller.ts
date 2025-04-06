import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo paciente',
    description: 'Cria um novo paciente com todas as informações necessárias.',
  })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({
    status: 201,
    description: 'Paciente criado com sucesso',
    type: Patient,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Paciente já existe com o mesmo CPF ou email',
  })
  create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os pacientes',
    description: 'Retorna uma lista de todos os pacientes cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes retornada com sucesso',
    type: [Patient],
  })
  findAll(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar paciente por ID',
    description: 'Retorna os detalhes de um paciente específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Paciente encontrado',
    type: Patient,
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar paciente',
    description: 'Atualiza as informações de um paciente existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({
    status: 200,
    description: 'Paciente atualizado com sucesso',
    type: Patient,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito com outro paciente (CPF ou email já existente)',
  })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover paciente',
    description: 'Remove um paciente do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Paciente removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.patientsService.remove(id);
  }

  @Post(':id/measurements')
  @ApiOperation({
    summary: 'Adicionar medição',
    description: 'Adiciona uma nova medição para um paciente específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiBody({ type: CreateMeasurementDto })
  @ApiResponse({
    status: 201,
    description: 'Medição criada com sucesso',
    type: Measurement,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  async createMeasurement(
    @Param('id') id: string,
    @Body() createMeasurementDto: CreateMeasurementDto,
  ): Promise<Measurement> {
    return this.patientsService.createMeasurement(id, createMeasurementDto);
  }

  @Get(':id/measurements')
  @ApiOperation({
    summary: 'Listar medições',
    description: 'Retorna todas as medições de um paciente específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de medições retornada com sucesso',
    type: [Measurement],
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  async findMeasurements(@Param('id') id: string): Promise<Measurement[]> {
    return this.patientsService.findMeasurements(id);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar pacientes',
    description: 'Busca pacientes por nome ou email',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Termo de busca (nome ou email)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes encontrados',
    type: [Patient],
  })
  async search(@Query('query') query: string) {
    return this.patientsService.search(query);
  }
}
