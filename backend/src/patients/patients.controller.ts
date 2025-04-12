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
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
  create(
    @Body() createPatientDto: CreatePatientDto,
    @Request() req: RequestWithUser,
  ) {
    return this.patientsService.create(createPatientDto, req.user.id);
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
  findAll(@Request() req: RequestWithUser) {
    return this.patientsService.findAll(req.user.id);
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
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.patientsService.findOne(id, req.user.id);
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
    @Request() req: RequestWithUser,
  ) {
    return this.patientsService.update(id, updatePatientDto, req.user.id);
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
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.patientsService.remove(id, req.user.id);
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
  createMeasurement(
    @Param('id') id: string,
    @Body() createMeasurementDto: CreateMeasurementDto,
    @Request() req: RequestWithUser,
  ) {
    createMeasurementDto.nutritionistId = req.user.id;

    return this.patientsService.createMeasurement(
      id,
      createMeasurementDto,
      req.user.id,
    );
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
  findMeasurements(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.patientsService.findMeasurements(id, req.user.id);
  }

  @Delete(':id/measurements/:measurementId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir medição',
    description: 'Remove uma medição específica de um paciente',
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
  @ApiParam({
    name: 'measurementId',
    description: 'ID da medição',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Medição removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente ou medição não encontrados',
  })
  removeMeasurement(
    @Param('id') id: string,
    @Param('measurementId') measurementId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.patientsService.removeMeasurement(
      id,
      measurementId,
      req.user.id,
    );
  }

  @Patch(':id/measurements/:measurementId')
  @ApiOperation({
    summary: 'Atualizar medição',
    description: 'Atualiza uma medição específica de um paciente',
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
  @ApiParam({
    name: 'measurementId',
    description: 'ID da medição',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiBody({ type: CreateMeasurementDto })
  @ApiResponse({
    status: 200,
    description: 'Medição atualizada com sucesso',
    type: Measurement,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente ou medição não encontrados',
  })
  updateMeasurement(
    @Param('id') id: string,
    @Param('measurementId') measurementId: string,
    @Body() updateMeasurementDto: CreateMeasurementDto,
    @Request() req: RequestWithUser,
  ) {
    updateMeasurementDto.nutritionistId = req.user.id;

    return this.patientsService.updateMeasurement(
      id,
      measurementId,
      updateMeasurementDto,
      req.user.id,
    );
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
  search(@Query('query') query: string, @Request() req: RequestWithUser) {
    return this.patientsService.search(query, req.user.id);
  }
}
