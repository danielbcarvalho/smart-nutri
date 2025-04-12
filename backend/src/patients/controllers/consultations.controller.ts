import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ConsultationsService } from '../services/consultations.service';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { Consultation } from '../entities/consultation.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@ApiTags('consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new consultation' })
  @ApiResponse({
    status: 201,
    description: 'The consultation has been successfully created.',
    type: Consultation,
  })
  create(
    @Body() createConsultationDto: CreateConsultationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Consultation> {
    return this.consultationsService.create(createConsultationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all consultations or filter by patient' })
  @ApiResponse({
    status: 200,
    description: 'Return all consultations or filtered by patient.',
    type: [Consultation],
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('patientId') patientId?: string,
  ): Promise<Consultation[]> {
    if (patientId) {
      return this.consultationsService.findByPatient(patientId, user.id);
    }
    return this.consultationsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a consultation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the consultation.',
    type: Consultation,
  })
  @ApiResponse({
    status: 404,
    description: 'Consultation not found.',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Consultation> {
    return this.consultationsService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a consultation' })
  @ApiResponse({
    status: 200,
    description: 'The consultation has been successfully updated.',
    type: Consultation,
  })
  @ApiResponse({
    status: 404,
    description: 'Consultation not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: Partial<CreateConsultationDto>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Consultation> {
    return this.consultationsService.update(id, updateConsultationDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a consultation' })
  @ApiResponse({
    status: 200,
    description: 'The consultation has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Consultation not found.',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.consultationsService.remove(id, user.id);
  }
}
