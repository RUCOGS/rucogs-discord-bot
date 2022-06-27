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
  getFileLink(filePath: string | undefined | null) {
    if (!filePath) return '';
    if (this.isSelfHostedFile(filePath)) {
      return this.getSelfHostedFileLink(filePath);
    }
    return filePath;
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
