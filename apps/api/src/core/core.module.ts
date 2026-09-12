import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const CORE_DB_POOL = 'CORE_DB_POOL';

@Global()
@Module({
  providers: [
    {
      provide: CORE_DB_POOL,
      useFactory: (configService: ConfigService) => {
        return new Pool({
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME', 'webgis_core_db'),
          max: 10,
          idleTimeoutMillis: 30000,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [CORE_DB_POOL],
})
export class CoreModule implements OnApplicationShutdown {
  constructor(@Inject(CORE_DB_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
