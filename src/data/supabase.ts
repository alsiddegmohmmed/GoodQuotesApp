import 'react-native-url-polyfill/auto';
import {createClient,processLock} from '@supabase/supabase-js';
import {sessionStorage} from './sessionStorage';

// This project-scoped publishable key is public by design. No secret or service-role key in the app.
const projectUrl='https://hrjbxctmvqpulpocjlfr.supabase.co';
const publishableKey='sb_publishable_9Sj7MbYILsJy_ciy7YdG4A_bMyX8CzL';
export const supabase=createClient(projectUrl,publishableKey,{
  auth:{storage:sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock}
});
