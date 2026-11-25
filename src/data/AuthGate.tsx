import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {ActivityIndicator,AppState,Pressable,Text,View} from 'react-native';
import type {Session} from '@supabase/supabase-js';
import {supabase} from './supabase';
import {AuthScreen} from '../screens/AuthScreen';
import {colors,spacing,typography} from '../theme/tokens';

type AuthState={session:Session;signOut:()=>Promise<void>};
const Context=createContext<AuthState|null>(null);
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('Authentication required.');return value;}

export function AuthGate({children}:{children:(userId:string)=>ReactNode}){
  const [session,setSession]=useState<Session|null>(null);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true,observed=false;
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
      if(!active)return;
      observed=true;setSession(next);setReady(true);setError('');
    });
    supabase.auth.getSession().then(({data,error})=>{
      if(!active||observed)return;
      if(error)throw error;
      setSession(data.session);setReady(true);
    }).catch(()=>{if(active&&!observed){setError('Could not restore your session. Retry or reset the session.');setReady(true);}});
    const update=(state:string)=>{if(state==='active')supabase.auth.startAutoRefresh();else supabase.auth.stopAutoRefresh();};
    update(AppState.currentState);
    const state=AppState.addEventListener('change',update);
    return()=>{active=false;subscription.unsubscribe();state.remove();supabase.auth.stopAutoRefresh();};
  },[attempt]);
  async function signOut(){const {error}=await supabase.auth.signOut({scope:'local'});if(error)throw new Error(error.message);}
  if(!ready||error)return <View style={{flex:1,backgroundColor:colors.bg,justifyContent:'center',padding:spacing.lg,gap:spacing.md}}>
    {!ready?<ActivityIndicator color={colors.text}/>:<>
      <Text style={{...typography.body,color:colors.text}}>{error}</Text>
      <Pressable onPress={()=>{setReady(false);setError('');setAttempt(x=>x+1);}}><Text style={{color:colors.accentPrimary}}>Retry</Text></Pressable>
      <Pressable onPress={async()=>{try{await signOut();setSession(null);setError('');}catch{setError('Could not reset the session. Please retry.');}}}><Text style={{color:colors.accentPrimary}}>Reset session</Text></Pressable>
    </>}
  </View>;
  if(!session)return <AuthScreen/>;
  return <Context.Provider value={{session,signOut}}>{children(session.user.id)}</Context.Provider>;
}
