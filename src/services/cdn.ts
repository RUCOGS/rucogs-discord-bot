import { ServerConfig } from '@src/classes/config';

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
    },
  ) {
    let url = '';
    if (!filePath) url = '';
    else if (this.isSelfHostedFile(filePath)) url = this.getSelfHostedFileLink(filePath);

    if (options)
      url =
        this.serverConfig.httpsPrefix +
        this.serverConfig.backendDomain +
        this.serverConfig.dynamicCdnRelativePath +
        '?' +
        new URLSearchParams({
          src: url,
          width: options.width.toString(),
          height: options.height.toString(),
        }).toString();

    return url;
  }

  getSelfHostedFileLink(selfHostedFilePath: string) {
    const relativePath = this.selfHostedToRelativeFilePath(selfHostedFilePath);
    return (
      this.serverConfig.httpsPrefix +
      this.serverConfig.cdnDomain +
      this.serverConfig.cdnRelativePath +
      '/' +
      relativePath
    );
  }
}
