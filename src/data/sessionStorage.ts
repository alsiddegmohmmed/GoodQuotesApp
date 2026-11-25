import * as SecureStore from 'expo-secure-store';

// Store session values in Keychain/Keystore. Small Unicode-safe chunks avoid
// native per-item size limits. Publish the pointer only after all writes succeed.
const options={keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY};
type Pointer={generation:string;count:number};
const pointerKey=(key:string)=>key+'.pointer';
const chunkKey=(key:string,generation:string,i:number)=>key+'.'+generation+'.'+i;
async function pointer(key:string):Promise<Pointer|null>{
  const raw=await SecureStore.getItemAsync(pointerKey(key),options);
  if(!raw)return null;
  const p=JSON.parse(raw) as Pointer;
  if(!/^[a-z0-9]+$/.test(p.generation)||!Number.isInteger(p.count)||p.count<1||p.count>256)throw new Error('Invalid stored session.');
  return p;
}
async function clean(key:string,p:Pointer|null){
  if(!p)return;
  await Promise.all(Array.from({length:p.count},(_,i)=>SecureStore.deleteItemAsync(chunkKey(key,p.generation,i),options)));
}
export const sessionStorage={
  async getItem(key:string){
    const p=await pointer(key);
    if(!p)return null;
    const parts=await Promise.all(Array.from({length:p.count},(_,i)=>SecureStore.getItemAsync(chunkKey(key,p.generation,i),options)));
    if(parts.some(v=>v===null))throw new Error('Incomplete stored session. Sign in again.');
    return parts.join('');
  },
  async setItem(key:string,value:string){
    const old=await pointer(key);
    const chars=Array.from(value),parts:string[]=[];
    for(let i=0;i<chars.length;i+=300)parts.push(chars.slice(i,i+300).join(''));
    if(!parts.length)parts.push('');
    if(parts.length>256)throw new Error('Session exceeds secure storage capacity.');
    const next={generation:Date.now().toString(36)+Math.random().toString(36).slice(2),count:parts.length};
    try{
      for(let i=0;i<parts.length;i++)await SecureStore.setItemAsync(chunkKey(key,next.generation,i),parts[i],options);
      await SecureStore.setItemAsync(pointerKey(key),JSON.stringify(next),options);
    }catch(e){await clean(key,next).catch(()=>{});throw e;}
    await clean(key,old).catch(()=>{});
  },
  async removeItem(key:string){
    let old:Pointer|null=null;
    try{old=await pointer(key);}catch{/* Invalid pointer: remove it without attempting arbitrary keys. */}
    await SecureStore.deleteItemAsync(pointerKey(key),options);
    await clean(key,old).catch(()=>{});
  }
};
