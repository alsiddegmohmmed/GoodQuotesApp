import {isLibrary,type Library} from './personalLibrary';
import {supabase} from './supabase';

export type CloudSnapshot={revision:number;library:Library};
export class CloudLibraryError extends Error{
  constructor(message:string,public readonly code?:string){super(message);}
}
export function parseSnapshot(value:unknown):CloudSnapshot{
  if(!value||typeof value!=='object')throw new CloudLibraryError('Invalid cloud library response.');
  const v=value as CloudSnapshot;
  if(!Number.isSafeInteger(v.revision)||v.revision<0||!isLibrary(v.library))throw new CloudLibraryError('Invalid cloud library response. No data was overwritten.');
  return v;
}
export async function loadCloudLibrary(userId:string):Promise<CloudSnapshot>{
  const {data,error}=await supabase.rpc('read_library',{p_user_id:userId});
  if(error)throw new CloudLibraryError(error.message,error.code);
  return parseSnapshot(data);
}
export async function saveCloudLibrary(userId:string,library:Library,revision:number):Promise<CloudSnapshot>{
  if(!isLibrary(library))throw new CloudLibraryError('Invalid reading data.');
  const {data,error}=await supabase.rpc('save_library',{p_user_id:userId,p_revision:revision,p_library:library});
  if(error)throw new CloudLibraryError(error.message,error.code);
  const next=parseSnapshot(data);
  if(next.revision!==revision+1)throw new CloudLibraryError('Unexpected cloud revision. Refresh your library before saving again.');
  return next;
}
