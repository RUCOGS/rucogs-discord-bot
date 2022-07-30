import { ServerConfig } from '@src/misc/config';

export const CropType = {
  Default: 'default',
  Circle: 'circle',
} as const;
export type CropType = typeof CropType[keyof typeof CropType];

export class CdnService {
  constructor(public serverConfig: ServerConfig) {}

  isSelfHostedFile(selfHostedFilePath: string) {
    return (
      selfHostedFilePath.startsWith(this.serverConfig.selfHostedPrefix) &&
      selfHostedFilePath.length > this.serverConfig.selfHostedPrefix.length
    );
  }

  selfHostedToRelativeFilePath(selfHostedFilePath: string) {
    if (!this.isSelfHostedFile(selfHostedFilePath))
      throw new Error("Cannot get self hosted filepath from filepath that isn't self hosted.");
    // Trim `self://` from the start
    return selfHostedFilePath.substring(this.serverConfig.selfHostedPrefix.length);
  }

  // Fetchs the link to a file. If it's self hosted, the
  // self hosted URL is converted into an actual link.
  getFileLink(
    filePath: string | undefined | null,
    options?: {
      width: number;
      height: number;
      crop?: CropType;
    },
  ) {
    let url = '';
    if (!filePath) url = '';
    else if (this.isSelfHostedFile(filePath)) url = this.getSelfHostedFileLink(filePath);

    if (options) {
      if (!options.crop) options.crop = CropType.Default;
      url =
        this.serverConfig.cdnHttpsPrefix +
        this.serverConfig.cdnDomain +
        this.serverConfig.dynamicCdnRelativePath +
        '?' +
        new URLSearchParams({
          src: url,
          width: options.width.toString(),
          height: options.height.toString(),
          crop: options.crop,
        }).toString();
    }

    return url;
  }

  getSelfHostedFileLink(selfHostedFilePath: string) {
    const relativePath = this.selfHostedToRelativeFilePath(selfHostedFilePath);
    return (
      this.serverConfig.cdnHttpsPrefix +
      this.serverConfig.cdnDomain +
      this.serverConfig.cdnRelativePath +
      '/' +
      relativePath
    );
  }
}
