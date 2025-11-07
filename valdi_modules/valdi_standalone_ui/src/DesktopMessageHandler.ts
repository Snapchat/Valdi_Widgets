import { CustomMessageHandler } from 'valdi_core/src/debugging/CustomMessageHandler';
import { fs } from 'file_system/src/FileSystem';

export class DesktopMessageHandler implements CustomMessageHandler {
  messageReceived(identifier: string, body: any): Promise<any> | undefined {
    if (identifier === 'SaveFile') {
      const outputPath = body.outputPath as string;
      const data = body.data;
      return new Promise<void>((resolve, reject) => {
        try {
          fs.writeFileSync(outputPath, data);
          resolve();
          console.log('Saved file to', outputPath);
        } catch (err: any) {
          reject(err);
        }
      });
    }

    return undefined;
  }
}
