import {useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View,KeyboardAvoidingView,Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Screen} from '../components/layout/Screen';
import {supabase} from '../data/supabase';
import {colors,spacing,radius,typography} from '../theme/tokens';

export function AuthScreen(){
  const [mode,setMode]=useState<'signin'|'signup'>('signin');
  const [email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  async function submit(){
    if(busy||!email.trim()||!password)return;
    setBusy(true);setMessage('');
    try{
      if(mode==='signup'){
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password});
        if(error)throw error;
        if(!data.session){setMessage('Check your email to confirm your account, then return here and sign in.');setPassword('');setMode('signin');}
      }else{
        const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
        if(error)throw error;
      }
    }catch(e){setMessage(e instanceof Error?e.message:'Could not sign in. Please try again.');}
    finally{setBusy(false);}
  }
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><Screen>
    <View style={styles.hero}><Text style={styles.brand}>GoodQuotes</Text><Text style={styles.sub}>A second memory for a curious mind.</Text></View>
    <Text style={styles.heading}>{mode==='signup'?'Create your account':'Welcome back'}</Text>
    <TextInput accessibilityLabel="Email" style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" editable={!busy} value={email} onChangeText={setEmail}/>
    <TextInput accessibilityLabel="Password" style={styles.input} placeholder="Password" placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} secureTextEntry textContentType={mode==='signup'?'newPassword':'password'} editable={!busy} value={password} onChangeText={setPassword}/>
    <Pressable accessibilityRole="button" disabled={busy||!email.trim()||!password||(mode==='signup'&&password.length<8)} style={[styles.button,(busy||!email.trim()||!password||(mode==='signup'&&password.length<8))&&styles.disabled]} onPress={submit}><Text style={styles.buttonText}>{busy?'Please wait…':mode==='signup'?'Create account':'Sign in'}</Text></Pressable>
    {mode==='signup'&&<Text style={styles.sub}>Use at least 8 characters.</Text>}
    {!!message&&<Text accessibilityLiveRegion="polite" style={styles.sub}>{message}</Text>}
    <Pressable disabled={busy} onPress={()=>{setMode(m=>m==='signin'?'signup':'signin');setMessage('');setPassword('');}}><Text style={styles.link}>{mode==='signup'?'Already have an account? Sign in':'New to GoodQuotes? Create account'}</Text></Pressable>
    <Text style={styles.sub}>Your library is private to your account.</Text>
  </Screen></KeyboardAvoidingView></SafeAreaView>;
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.bg},hero:{paddingTop:spacing.xxl,gap:spacing.sm,marginBottom:spacing.xl},
 brand:{...typography.display,color:colors.text},heading:{...typography.title,color:colors.text},
 sub:{...typography.caption,color:colors.textMuted},input:{...typography.body,color:colors.text,backgroundColor:colors.surface2,minHeight:52,borderRadius:radius.md,padding:spacing.md},
 button:{backgroundColor:colors.accentPrimary,borderRadius:radius.md,minHeight:50,alignItems:'center',justifyContent:'center'},buttonText:{...typography.body,fontWeight:'600',color:colors.bg},
 disabled:{opacity:0.45},link:{...typography.body,color:colors.accentPrimary}
});
