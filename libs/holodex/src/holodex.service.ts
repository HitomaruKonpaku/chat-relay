import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios'

@Injectable()
export class HolodexService {
  public readonly client!: AxiosInstance

  /**
   * @see https://docs.holodex.net
   */
  constructor() {
    const config: CreateAxiosDefaults = {
      baseURL: process.env.HOLODEX_API_URL || 'https://staging.holodex.net/api/v2',
      headers: { 'x-apikey': process.env.HOLODEX_API_KEY },
    }
    this.client = axios.create(config)
  }

  public canActive(): boolean {
    return true
      && !!process.env.HOLODEX_API_KEY
      && !!this.client
  }
}
