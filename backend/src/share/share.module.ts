import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { Share, ShareSchema } from './schemas/share.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Share.name, schema: ShareSchema },
      { name: 'Project', schema: ProjectSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule { }