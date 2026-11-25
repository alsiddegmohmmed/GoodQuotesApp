import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {ActivityIndicator,Pressable,Text,View} from 'react-native';
import {loadCloudLibrary,saveCloudLibrary,CloudLibraryError} from './cloudLibrary';
import {emptyLibrary,type Library} from './personalLibrary';
import {useAuth} from './AuthGate';
import {colors,spacing,typography} from '../theme/tokens';

type Context={library:Library;saving:boolean;change:(fn:(current:Library)=>Library)=>Promise<void>;refresh:()=>Promise<void>};
const LibraryContext=createContext<Context|null>(null);

export function LibraryProvider({userId,children}:{userId:string;children:ReactNode}){
  const {signOut}=useAuth();
  const [library,setLibrary]=useState(emptyLibrary);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  const state=useRef({library:emptyLibrary,revision:0});
  const busy=useRef(false), needsRefresh=useRef(false);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true;
    loadCloudLibrary(userId).then(snapshot=>{
      if(!active)return;
      state.current=snapshot;needsRefresh.current=false;setLibrary(snapshot.library);setStatus('ready');
    }).catch(e=>{if(active){setError(e instanceof Error?e.message:'Could not open your cloud library.');setStatus('error');}});
    return()=>{active=false;};
  },[attempt,userId]);
  async function refresh(){
    if(busy.current)throw new Error('A save is in progress. Try again.');
    busy.current=true;setSaving(true);
    try{const snapshot=await loadCloudLibrary(userId);state.current=snapshot;setLibrary(snapshot.library);needsRefresh.current=false;}
    finally{busy.current=false;setSaving(false);}
  }
  async function change(fn:(current:Library)=>Library){
    if(busy.current)throw new Error('A save is in progress. Try again.');
    if(needsRefresh.current){await refresh();throw new Error('Your library has been refreshed. Review and retry your change.');}
    busy.current=true;setSaving(true);
    try{
      const next=fn(state.current.library);
      try{
        const snapshot=await saveCloudLibrary(userId,next,state.current.revision);
        state.current=snapshot;setLibrary(snapshot.library);
      }catch(e){
        // A lost response may follow a successful commit; never replay automatically.
        needsRefresh.current=true;
        if(e instanceof CloudLibraryError&&e.code==='40001'){
          try{const snapshot=await loadCloudLibrary(userId);state.current=snapshot;setLibrary(snapshot.library);needsRefresh.current=false;}catch{/* Keep refresh required. */}
          throw new Error('Your library changed elsewhere. Review the latest library and try again.');
        }
        throw new Error('Cloud save was not confirmed. Refresh in Profile before retrying. '+(e instanceof Error?e.message:''));
      }
    }finally{busy.current=false;setSaving(false);}
  }
  if(status!=='ready')return <View style={{flex:1,backgroundColor:colors.bg,justifyContent:'center',padding:spacing.lg,gap:spacing.md}}>
    {status==='loading'?<ActivityIndicator color={colors.text}/>:<>
      <Text style={{...typography.body,color:colors.text}}>{error}</Text>
      <Pressable onPress={()=>{setStatus('loading');setAttempt(n=>n+1);}}><Text style={{color:colors.accentPrimary}}>Retry</Text></Pressable>
      <Pressable onPress={async()=>{try{await signOut();}catch(e){setError(e instanceof Error?e.message:'Could not sign out.');}}}><Text style={{color:colors.accentPrimary}}>Sign out</Text></Pressable>
    </>}
  </View>;
  return <LibraryContext.Provider value={{library,saving,change,refresh}}>{children}</LibraryContext.Provider>;
}
export function useLibrary(){const context=useContext(LibraryContext);if(!context)throw new Error('LibraryProvider is required.');return context;}
