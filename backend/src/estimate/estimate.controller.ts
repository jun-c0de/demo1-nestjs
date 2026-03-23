import { Controller, Post, Param } from '@nestjs/common';
import { EstimateService } from './estimate.service';

@Controller('estimates')
export class EstimateController {
    constructor(private readonly service: EstimateService) { }

    @Post('project/:projectId')
    generate(@Param('projectId') projectId: string) {
        return this.service.generate(projectId);
    }
}