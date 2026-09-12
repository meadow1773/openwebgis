import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import TenantManagerService from './tenant-manager/tenant-manager.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, TenantManagerService],
})
export class AppModule {}
