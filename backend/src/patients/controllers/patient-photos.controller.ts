import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PatientPhotosService } from '../services/patient-photos.service';
import { CreatePatientPhotoDto } from '../dto/create-patient-photo.dto';
import { UpdatePatientPhotoDto } from '../dto/update-patient-photo.dto';
import { PatientPhoto, PhotoType } from '../entities/patient-photo.entity';

@ApiTags('patient-photos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients/:patientId/photos')
export class PatientPhotosController {
  constructor(private readonly patientPhotosService: PatientPhotosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient photo' })
  @ApiResponse({
    status: 201,
    description: 'The photo has been successfully created.',
    type: PatientPhoto,
  })
  create(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() createPatientPhotoDto: CreatePatientPhotoDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PatientPhoto> {
    // Override patientId from URL parameter
    createPatientPhotoDto.patientId = patientId;

    return this.patientPhotosService.create(createPatientPhotoDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all photos for a patient' })
  @ApiResponse({
    status: 200,
    description: 'List of patient photos',
    type: [PatientPhoto],
  })
  findAll(
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ): Promise<PatientPhoto[]> {
    return this.patientPhotosService.findAll(patientId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get photos by type for a patient' })
  @ApiResponse({
    status: 200,
    description: 'List of patient photos of a specific type',
    type: [PatientPhoto],
  })
  findByType(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('type') type: PhotoType,
  ): Promise<PatientPhoto[]> {
    return this.patientPhotosService.findByType(patientId, type);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get photos within a date range' })
  @ApiResponse({
    status: 200,
    description: 'List of patient photos within the specified date range',
    type: [PatientPhoto],
  })
  findByDateRange(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<PatientPhoto[]> {
    return this.patientPhotosService.findPhotosByDateRange(
      patientId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific photo' })
  @ApiResponse({
    status: 200,
    description: 'The found photo',
    type: PatientPhoto,
  })
  @ApiResponse({
    status: 404,
    description: 'Photo not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PatientPhoto> {
    return this.patientPhotosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a photo' })
  @ApiResponse({
    status: 200,
    description: 'The photo has been successfully updated.',
    type: PatientPhoto,
  })
  @ApiResponse({
    status: 404,
    description: 'Photo not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientPhotoDto: UpdatePatientPhotoDto,
  ): Promise<PatientPhoto> {
    return this.patientPhotosService.update(id, updatePatientPhotoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a photo' })
  @ApiResponse({
    status: 200,
    description: 'The photo has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Photo not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.patientPhotosService.remove(id);
  }
}
