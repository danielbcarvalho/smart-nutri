import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Execute a query on a table
   * @param tableName The name of the table
   * @param query The query to execute
   * @returns The result of the query
   */
  async query<T>(tableName: string, query: any): Promise<T[]> {
    return this.supabaseService.query<T>(tableName, query);
  }

  /**
   * Get a record by ID
   * @param tableName The name of the table
   * @param id The ID of the record
   * @returns The record
   */
  async getById<T>(tableName: string, id: number | string): Promise<T | null> {
    const { data, error } = await this.supabaseService.client
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(
        `Error getting record from ${tableName}: ${error.message}`,
      );
    }

    return data as T;
  }

  /**
   * Insert a record
   * @param tableName The name of the table
   * @param record The record to insert
   * @returns The inserted record
   */
  async insert<T>(tableName: string, record: Partial<T>): Promise<T> {
    const { data, error } = await this.supabaseService.client
      .from(tableName)
      .insert(record)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error inserting record into ${tableName}: ${error.message}`,
      );
    }

    return data as T;
  }

  /**
   * Update a record
   * @param tableName The name of the table
   * @param id The ID of the record
   * @param record The record to update
   * @returns The updated record
   */
  async update<T>(
    tableName: string,
    id: number | string,
    record: Partial<T>,
  ): Promise<T> {
    const { data, error } = await this.supabaseService.client
      .from(tableName)
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error updating record in ${tableName}: ${error.message}`,
      );
    }

    return data as T;
  }

  /**
   * Delete a record
   * @param tableName The name of the table
   * @param id The ID of the record
   */
  async delete(tableName: string, id: number | string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(
        `Error deleting record from ${tableName}: ${error.message}`,
      );
    }
  }
}
