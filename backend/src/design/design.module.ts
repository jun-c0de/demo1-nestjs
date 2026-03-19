import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignService } from './design.service';
import { DesignController } from './design.controller';
import { Design, DesignSchema } from './schemas/design.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Design.name, schema: DesignSchema },
      // Project 모델을 여기서도 참조할 수 있게 등록 (문자열로 참조)
      { name: 'Project', schema: {} },
    ]),
  ],
  controllers: [DesignController],
  providers: [DesignService],
  exports: [DesignService],
})
export class DesignModule { }