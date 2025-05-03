import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PhotosService } from './photos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoType } from './entities/photo.entity';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: any, @Body() body: any) {
    // Extrair metadados do body
    const { patientId, assessmentId, type } = body;
    if (!file || !patientId || !type) {
      return { error: 'file, patientId e type são obrigatórios' };
    }
    // Chamar o service
    const photo = await this.photosService.uploadPhoto({
      file,
      patientId,
      assessmentId,
      type: type as PhotoType,
    });
    return photo;
  }

  @Get()
  async listPhotos(@Query() query: any) {
    // Extrair filtros dos query params
    const { patientId, assessmentId, type, from, to, page, limit, order } =
      query;
    const result = await this.photosService.listPhotos({
      patientId,
      assessmentId,
      type,
      from,
      to,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      order,
    });
    return result;
  }

  @Delete(':id')
  async removePhoto(@Param('id') id: string) {
    await this.photosService.removePhoto(id);
    return { status: 204 };
  }
}
