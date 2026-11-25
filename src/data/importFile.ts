import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

const MAX_BYTES = 10 * 1024 * 1024;

export async function pickImportFile(extension: 'csv' | 'txt'): Promise<{name:string;text:string}|null> {
  // Some Files providers report CSV as plain text or octet-stream. Validate the actual filename and parser instead.
  const result = await DocumentPicker.getDocumentAsync({type:'*/*',multiple:false,copyToCacheDirectory:true});
  if(result.canceled)return null;
  const asset=result.assets[0];
  if(!asset)throw new Error('No file selected.');
  try {
    if(!asset.name.toLowerCase().endsWith('.'+extension))throw new Error('Choose a .'+extension+' file.');
    const info=await FileSystem.getInfoAsync(asset.uri);
    if(!info.exists||info.isDirectory)throw new Error('Unable to open the selected file.');
    if((asset.size??0)>MAX_BYTES||info.size>MAX_BYTES)throw new Error('The file exceeds the 10 MB import limit.');
    const text=await FileSystem.readAsStringAsync(asset.uri,{encoding:FileSystem.EncodingType.UTF8});
    if(!text.trim())throw new Error('The selected file is empty.');
    return {name:asset.name,text};
  } finally {
    // Only remove the temporary copy owned by this app, never a file in the user's Files folder.
    if(FileSystem.cacheDirectory && asset.uri.startsWith(FileSystem.cacheDirectory)){
      await FileSystem.deleteAsync(asset.uri,{idempotent:true}).catch(()=>{});
    }
  }
}
