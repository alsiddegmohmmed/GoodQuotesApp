import { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { Screen, ScreenHeading, SectionHeading } from '../components/layout/Screen';
import { useLibrary } from '../data/LibraryProvider';
import { prepareEvidence, askCompanion, type Answer, type Turn } from '../data/companion';
import { searchPassages, recordConnection } from '../data/connections';
import { AutomaticDiscovery } from '../components/quotes/AutomaticDiscovery';
import { PassageCard } from '../components/quotes/PassageCard';
import type { RootStackParamList } from '../navigation/types';
import type { ConnectionRelation } from '../data/personalLibrary';
import { colors, radius, spacing, typography } from '../theme/tokens';

const relations: ConnectionRelation[] = ['Agreement','Contrast','Complement','Recurring question','Other'];
export function CompanionScreen({route,navigation}:StackScreenProps<RootStackParamList,'Companion'>) {
  const { library, saving, change } = useLibrary();
  const [ids,setIds] = useState<string[]>(route.params?.sourceIds ?? []);
  const [base,setBase] = useState(''), [token,setToken] = useState('');
  const [includeNotes,setIncludeNotes] = useState(false), [consent,setConsent] = useState(false);
  const [mode,setMode] = useState<'connect'|'discuss'>('connect');
  const [query,setQuery] = useState(''), [question,setQuestion] = useState('');
  const [turns,setTurns] = useState<Turn[]>([]), [answer,setAnswer] = useState<Answer|null>(null);
  const [busy,setBusy] = useState(false), [error,setError] = useState(''), [status,setStatus] = useState('');
  const [relation,setRelation] = useState<ConnectionRelation|undefined>(), [reflection,setReflection] = useState('');
  const [limit,setLimit] = useState(20);
  const found=useMemo(()=>searchPassages(library,query),[library,query]);
  const selected=library.highlights.filter(h=>ids.includes(h.id));
  function resetContext() { setConsent(false); setTurns([]); setAnswer(null); setRelation(undefined); setReflection(''); setStatus(''); setError(''); }
  function toggle(id:string) {
    if (!ids.includes(id) && ids.length>=10) {setError('Select at most ten passages.');return;}
    setIds(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]); resetContext();
  }
  async function send() {
    if(!consent||busy)return;
    setBusy(true);setError('');setStatus('');
    try{
      const evidence=prepareEvidence(library,ids,includeNotes);
      if(!evidence.length || (mode==='connect' && new Set(evidence.map(s=>s.bookId)).size<2))throw new Error('Select evidence from '+(mode==='connect'?'at least two books.':'your library.'));
      if(mode==='discuss'&&!question.trim())throw new Error('Enter a question.');
      const q=question;
      const result=await askCompanion(base,token,mode,q,evidence,turns);
      setAnswer(result);setRelation(undefined);setReflection('');
      setTurns(old=>[...old,{role:'reader' as const,text:q.trim()||'Compare these passages'},{role:'assistant' as const,text:result.text}].slice(-6));
      setQuestion('');
    }catch(e){setError(e instanceof Error?e.message:'Could not reach companion.');}
    finally{setBusy(false);}
  }
  const pair=answer?.status==='insight'?[...new Set(answer.evidence.map(e=>e.sourceId))]:[];
  const pairBooks=new Set(library.highlights.filter(h=>pair.includes(h.id)).map(h=>h.bookId));
  async function saveConnection(){
    if(pair.length!==2||pairBooks.size!==2||!relation)return;
    try{
      await change(current=>recordConnection(current,pair[0],pair[1],'saved',relation,reflection));
      setStatus('Your interpretation was saved. The model response was not stored as your reflection.');
    }catch(e){setError(e instanceof Error?e.message:'Could not save.');}
  }
  return <Screen>
    <ScreenHeading title="Reading companion" subtitle="A conversation grounded in your own reading." />
    <View style={styles.panel}>
      <Text style={styles.meta}>Connect your private HTTPS server. Its model credentials stay server-side. The access token is held only while this screen is open.</Text>
      <TextInput editable={!busy} autoCapitalize="none" autoCorrect={false} value={base} onChangeText={v=>{setBase(v);resetContext();}} placeholder="https://your-server.example" placeholderTextColor={colors.textMuted} style={styles.input} />
      <TextInput editable={!busy} secureTextEntry autoCapitalize="none" autoCorrect={false} value={token} onChangeText={v=>{setToken(v);resetContext();}} placeholder="Private access token" placeholderTextColor={colors.textMuted} style={styles.input} />
    </View>
    <View style={styles.row}>{(['connect','discuss'] as const).map(m=><Pressable key={m} disabled={busy} onPress={()=>{setMode(m);setAnswer(null);setRelation(undefined);setReflection('');setStatus('');setConsent(false);}} style={[styles.action,mode===m&&styles.selected]}><Text style={mode===m?styles.dark:styles.body}>{m==='connect'?'Find a connection':'Discuss a question'}</Text></Pressable>)}</View>
    <SectionHeading title={'Selected passages ('+selected.length+'/10)'} />
    {selected.map(h=><View key={h.id} style={styles.panel}><PassageCard highlight={h} onOpenBook={()=>navigation.push('BookDetail',{bookId:h.bookId})} /><Pressable disabled={busy} onPress={()=>toggle(h.id)}><Text style={styles.meta}>Remove from AI context</Text></Pressable></View>)}
    {!selected.length&&<Text style={styles.meta}>Choose actual saved material below.</Text>}
    <View style={styles.row}><Text style={[styles.body,{flex:1}]}>Include the selected passages' personal notes</Text><Switch disabled={busy} value={includeNotes} onValueChange={v=>{setIncludeNotes(v);resetContext();}} /></View>
    <TextInput editable={!busy} multiline value={question} onChangeText={v=>{setQuestion(v);setConsent(false);}} placeholder={mode==='connect'?'Optional question or theme':'What would you like to discuss?'} placeholderTextColor={colors.textMuted} style={styles.input} maxLength={2000}/>
    <AutomaticDiscovery library={library} mode={mode} question={question} includeNotes={includeNotes} preferredId={ids[0]} base={base} token={token} busy={busy} setBusy={setBusy} onError={setError} onSelected={next=>{setIds(next);resetContext();setStatus('Semantic selection ready. Review the passages above before sending your question.');}} />
    {!answer&&!!status&&<Text style={styles.meta}>{status}</Text>}
    <View style={styles.row}><Switch disabled={busy} value={consent} onValueChange={setConsent}/><Text style={[styles.meta,{flex:1}]}>Allow this request to send selected passages, book metadata, {includeNotes?'their notes, ':''}your question and up to six recent conversation messages to your configured server and its model provider. Provider data policies apply.</Text></View>
    <Pressable disabled={!consent||busy||!ids.length||!base.trim()||!token.trim()} onPress={async()=>{await send();setConsent(false);}} style={[styles.action,styles.selected,(!consent||busy)&&{opacity:0.5}]}><Text style={styles.dark}>{busy?'Thinking…':mode==='connect'?'Find a meaningful connection':'Send question'}</Text></Pressable>
    {!!error&&<Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text>}
    {turns.length>2&&<View style={styles.panel}><Text style={styles.meta}>Earlier messages in this session</Text>{turns.slice(0,-2).map((t,i)=><Text key={i} style={styles.body}>{t.role==='reader'?'You: ':'Companion: '}{t.text}</Text>)}</View>}
    {answer&&<View style={styles.panel}>
      <Text style={styles.eyebrow}>{answer.status==='insufficient'?'NOT ENOUGH EVIDENCE':'AI INTERPRETATION · NOT YOUR BELIEF'}</Text>
      {turns.length>=2&&<Text style={styles.meta}>Your question: {turns[turns.length-2].text}</Text>}
      {!!answer.relation&&<Text style={styles.meta}>Suggested relationship: {answer.relation}</Text>}
      <Text selectable style={styles.body}>{answer.text}</Text>
      {answer.evidence.map(e=>{const h=library.highlights.find(x=>x.id===e.sourceId);const b=h&&library.books.find(x=>x.id===h.bookId);return <Pressable key={e.sourceId+'|'+e.kind} disabled={!h} onPress={()=>h&&navigation.push('BookDetail',{bookId:h.bookId})} style={styles.action}><Text style={styles.meta}>{e.kind==='reader-note'?'Your note':'Saved passage'} · {b?.title} · {b?.author}</Text><Text selectable style={styles.body}>{e.excerpt}</Text></Pressable>;})}
      {pair.length===2&&pairBooks.size===2&&<><Text style={styles.meta}>Save your own interpretation (choose the relationship yourself).</Text><View style={styles.row}>{relations.map(r=><Pressable key={r} onPress={()=>setRelation(r)} style={[styles.action,relation===r&&styles.selected]}><Text style={relation===r?styles.dark:styles.body}>{r}</Text></Pressable>)}</View><TextInput value={reflection} onChangeText={setReflection} multiline scrollEnabled placeholder="Your own reflection (optional)" placeholderTextColor={colors.textMuted} style={[styles.input, {height:120,maxHeight:120,textAlignVertical:'top'}]}/><Pressable disabled={saving||!relation||busy} onPress={saveConnection} style={styles.action}><Text style={styles.body}>Save my connection</Text></Pressable></>}
      {!!status&&<Text style={styles.meta}>{status}</Text>}
      <Pressable disabled={busy} onPress={resetContext}><Text style={styles.meta}>Clear conversation</Text></Pressable>
    </View>}
    <SectionHeading title="Choose evidence" />
    <TextInput editable={!busy} value={query} onChangeText={v=>{setQuery(v);setLimit(20);}} placeholder="Search your saved passages" placeholderTextColor={colors.textMuted} style={styles.input}/>
    {found.slice(0,limit).map(h=><View key={h.id} style={styles.panel}><PassageCard highlight={h}/><Pressable disabled={busy} style={styles.action} onPress={()=>toggle(h.id)}><Text style={styles.body}>{ids.includes(h.id)?'Remove from context':'Include in context'}</Text></Pressable></View>)}
    {found.length>limit&&<Pressable onPress={()=>setLimit(n=>n+20)}><Text style={styles.body}>Show more</Text></Pressable>}
  </Screen>;
}
const styles=StyleSheet.create({
  panel:{backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.md,gap:spacing.sm},
  row:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:spacing.sm},
  body:{...typography.body,color:colors.text},
  meta:{...typography.caption,color:colors.textMuted},
  eyebrow:{...typography.meta,color:colors.accentWarm,letterSpacing:1},
  input:{...typography.body,color:colors.text,backgroundColor:colors.surface2,minHeight:48,padding:spacing.md,borderRadius:radius.md},
  action:{backgroundColor:colors.surface2,padding:spacing.md,minHeight:44,borderRadius:radius.sm,justifyContent:'center',gap:spacing.xs},
  selected:{backgroundColor:colors.accentPrimary},dark:{...typography.body,color:colors.bg}
});
