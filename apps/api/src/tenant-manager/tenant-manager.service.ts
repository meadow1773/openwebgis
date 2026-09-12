import { Inject, Injectable } from '@nestjs/common';
import { CORE_DB_POOL } from '../core/core.module';
import { Pool } from 'pg';

interface TenantClient {
  id: number;
  name: string;
  socialNumber: string;
  tenant: string;
  db_connection: string;
}

@Injectable()
export default class TenantManagerService {
  constructor(@Inject(CORE_DB_POOL) private readonly pool: Pool) {}

  async findTenantByDomain(domain: string): Promise<TenantClient | undefined> {
    const result = await this.pool.query<TenantClient>(
      'SELECT * FROM owg_core_db.clients WHERE tenant = $1',
      [domain],
    );
    return result.rows[0];
  }
}
