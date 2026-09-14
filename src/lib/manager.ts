import { computed, onMounted, ref, reactive } from 'vue'
import { supabase } from './supabase'

export type Agent = {
    id: string;
    name: string;
    purpose: string;
    personality: string;
    knowledge_sources: string[];
    created_at: string;
    updated_at: string
};
export type Message = { 
    role: 'user' | 'assistant'; 
    content: string 
};

export let agents = reactive<Agent[]>([]);
export let agentData = reactive({ name: '', purpose: '', personality: '', knowledge: '' });

export const selectedId = ref<string | null>(null), 
    isLoading = ref(true), 
    isSaving = ref(false);
export const errorMessage = ref(''),
    notice = ref(''),
    showEditor = ref(false),
    isEditing = ref(false);
export const activeTab = ref<'workspace' | 'knowledge'>('workspace'),
    messageInput = ref(''),
    isChatting = ref(false);
export const messages = ref<Message[]>([]);
export const selectedAgent = computed(() => agents.find((agent) => agent.id === selectedId.value) ?? null);
export const knowledgeList = computed(() => selectedAgent.value?.knowledge_sources ?? []);

export function resetForm() {
    agentData = { name: '', purpose: '', personality: '', knowledge: '' }
}
export function newAgent() {
    resetForm();
    isEditing.value = false;
    showEditor.value = true
}
export function editAgent(agent: Agent) {
    selectedId.value = agent.id;
    agentData = reactive({ name: agent.name, purpose: agent.purpose, personality: agent.personality, knowledge: agent.knowledge_sources.join('\n') });
    isEditing.value = true;
    showEditor.value = true
}
export function selectAgent(agent: Agent) {
    selectedId.value = agent.id;
    messages.value = [];
    activeTab.value = 'workspace';
    notice.value = ''
}

export async function loadAgents() {
    isLoading.value = true
    const { data, error } = await supabase.from('agents').select('*').order('updated_at', { ascending: false })
    if (error) errorMessage.value = error.message
    else { agents = reactive<Agent[]>(data) ?? reactive<Agent[]>([]); if (!selectedId.value && agents[0]) selectAgent(agents[0]) }
    isLoading.value = false
}
export async function saveAgent() {
    if (!agentData.name.trim() || !agentData.purpose.trim()) return
    isSaving.value = true; errorMessage.value = ''
    const payload = { name: agentData.name.trim(), purpose: agentData.purpose.trim(), personality: agentData.personality.trim(), knowledge_sources: agentData.knowledge.split('\n').map((item) => item.trim()).filter(Boolean) }
    const result = isEditing.value && selectedId.value ? await supabase.from('agents').update(payload).eq('id', selectedId.value).select().single() : await supabase.from('agents').insert(payload).select().single()
    if (result.error) errorMessage.value = result.error.message
    else { const saved = result.data as Agent; agents = isEditing.value ? agents.map((agent) => agent.id === saved.id ? saved : agent) : [saved, ...agents]; selectedId.value = saved.id; showEditor.value = false; notice.value = isEditing.value ? 'Agent updated' : 'Agent created'; messages.value = [] }
    isSaving.value = false
}
export async function deleteAgent() {
    if (!selectedAgent.value || !window.confirm(`Delete ${selectedAgent.value.name}?`)) return
    const { error } = await supabase.from('agents').delete().eq('id', selectedAgent.value.id)
    if (error) errorMessage.value = error.message
    else { agents = agents.filter((agent) => agent.id !== selectedAgent.value?.id); selectedId.value = agents[0]?.id ?? null; messages.value = []; notice.value = 'Agent deleted' }
}
export async function sendMessage() {
    const content = messageInput.value.trim()
    if (!content || !selectedAgent.value || isChatting.value) return
    messages.value.push({ role: 'user', content }); messageInput.value = ''; isChatting.value = true; errorMessage.value = ''
    try { const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent: selectedAgent.value, messages: messages.value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'The agent could not respond.'); messages.value.push({ role: 'assistant', content: data.content }) }
    catch (error) { errorMessage.value = error instanceof Error ? error.message : 'The agent could not respond.' }
    finally { isChatting.value = false }
}
export function toggleEditor() { showEditor.value = !showEditor.value; if (!showEditor.value) resetForm() }
export function isSaveActive(): boolean {
    return isSaving.value==true || agentData.name.trim()=='' || agentData.purpose.trim()=='';
}
export function isThisSelectedAgent(agent: Agent): boolean {
    return selectedAgent.value?.id === agent.id;
}
export function isSendMessageActive(): boolean {
    return !messageInput.value.trim() || isChatting.value;
}