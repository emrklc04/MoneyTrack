import { Directory, File, Paths } from 'expo-file-system';

function getReceiptsDirectory(): Directory {
  const directory = new Directory(Paths.document, 'receipts');
  if (!directory.exists) {
    directory.create();
  }
  return directory;
}

export function saveReceiptImage(temporaryUri: string, transactionId: string): string {
  const sourceFile = new File(temporaryUri);
  const destinationFile = new File(getReceiptsDirectory(), `${transactionId}.jpg`);
  sourceFile.copy(destinationFile);
  return destinationFile.uri;
}
