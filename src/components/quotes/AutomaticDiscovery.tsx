import { useMemo,useState } from 'react';
import { Pressable,StyleSheet,Text,View } from 'react-native';
import type { Library } from '../../data/personalLibrary';
import { planRetrieval,retrieveEvidence } from '../../data/retrieval';
import { colors,radius,spacing,typography } from '../../theme/tokens';

type Props={library:Library;mode:'connect'|'discuss';question:string;includeNotes:boolean;preferredId?:string;base:string;token:string;busy:boolean;setBusy:(value:boolean)=>void;onSelected:(ids:string[])=>void;onError:(message:string)=>void};
export function AutomaticDiscovery({library,mode,question,includeNotes,preferredId,base,token,busy,setBusy,onSelected,onError}:Props){
  const [expanded,setExpanded]=useState(false);
  const plan=useMemo(()=>planRetrieval(library,mode,question,includeNotes,preferredId),[library,mode,question,includeNotes,preferredId]);
  async function search(){
    if(busy)return;
    setBusy(true);onError('');
    try{const ids=await retrieveEvidence(base,token,plan);onSelected(ids);setExpanded(false);}
    catch(e){onError(e instanceof Error?e.message:'Semantic retrieval failed.');}
    finally{setBusy(false);}
  }
  return <View style={styles.panel}>
    <Text style={styles.title}>Find connections in your library</Text>
    <Text style={styles.meta}>Search locally first, then rank a varied shortlist by meaning. You can review and change the selected passages before any AI discussion.</Text>
    <Pressable disabled={busy} onPress={()=>setExpanded(v=>!v)} style={styles.action}><Text style={styles.body}>{expanded?'Hide retrieval preview':'Find evidence automatically'}</Text></Pressable>
    {expanded&&<>
      <Text style={styles.meta}>{plan.candidates.length} excerpts shortlisted from {plan.eligibleCount} eligible passages. {plan.eligibleCount>plan.candidates.length?'Not all passages are semantically ranked. ':''}Personal notes {includeNotes?'included if present':'excluded'}. No full library, saved reflections or conversation history is sent during retrieval.</Text>
      {!!question.trim()&&<Text style={styles.body}>Search question: {question}</Text>}
      {plan.candidates.map(c=><View key={c.id} style={styles.source}><Text style={styles.meta}>{c.id===plan.anchorId?'Starting passage · ':''}{c.title} — {c.author}</Text><Text selectable style={styles.body}>{c.text}</Text>{!!c.note&&<Text selectable style={styles.meta}>Your note: {c.note}</Text>}</View>)}
      {!plan.candidates.length&&<Text style={styles.meta}>Not enough eligible unreviewed cross-book material. Choose sources manually or add more passages.</Text>}
      <Text style={styles.meta}>The following action sends the displayed excerpts, selected source IDs, book metadata and question to your configured server and embedding provider. Provider data policies apply.</Text>
      <Pressable disabled={busy||!base.trim()||!token.trim()||!plan.candidates.length||(mode==='discuss'&&!question.trim())} style={[styles.action,styles.primary]} onPress={search}><Text style={styles.dark}>{busy?'Searching…':'Send displayed excerpts for semantic search'}</Text></Pressable>
    </>}
  </View>;
}
const styles=StyleSheet.create({panel:{backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.md,gap:spacing.sm},title:{...typography.title,color:colors.text},meta:{...typography.caption,color:colors.textMuted},body:{...typography.body,color:colors.text},source:{padding:spacing.sm,gap:spacing.xs,backgroundColor:colors.surface2,borderRadius:radius.sm},action:{padding:spacing.md,minHeight:44,borderRadius:radius.sm,backgroundColor:colors.surface2,justifyContent:'center'},primary:{backgroundColor:colors.accentPrimary},dark:{...typography.body,color:colors.bg}});
