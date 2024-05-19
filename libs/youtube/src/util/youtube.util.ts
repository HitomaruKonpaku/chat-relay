import { Credentials } from 'masterchat'

export class YoutubeUtil {
  public static getCredentials(): Credentials {
    const credentials: Credentials = {
      APISID: process.env.YOUTUBE_APISID,
      HSID: process.env.YOUTUBE_HSID,
      SAPISID: process.env.YOUTUBE_SAPISID,
      SID: process.env.YOUTUBE_SID,
      SSID: process.env.YOUTUBE_SSID,

      '__Secure-1PAPISID': process.env.YOUTUBE_SAPISID,
      '__Secure-1PSID': process.env.YOUTUBE_1PSID,
      '__Secure-1PSIDTS': process.env.YOUTUBE_1PSIDTS,
      '__Secure-1PSIDCC': process.env.YOUTUBE_1PSIDCC,
    }

    return credentials
  }

  public static genCookieString(credentials: Credentials) {
    return Object.entries(credentials)
      .map(([key, value]) => `${key}=${value};`)
      .join(' ')
  }
}
