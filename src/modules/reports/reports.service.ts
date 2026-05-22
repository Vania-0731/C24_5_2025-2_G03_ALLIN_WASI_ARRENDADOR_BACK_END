import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create({
      reporterId,
      reportedUserId: dto.reportedUserId,
      conversationId: dto.conversationId,
      reason: dto.reason,
    });
    return await this.reportRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return await this.reportRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByReporter(reporterId: string): Promise<Report[]> {
    return await this.reportRepository.find({
      where: { reporterId },
      order: { createdAt: 'DESC' },
    });
  }
}
