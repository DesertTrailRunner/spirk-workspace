/**
 * AgentManager
 * @date 2026-09-14
 */
import { reactive } from 'vue'
import { supabase } from './supabase'
import type { Agent } from './types/Agent'
import type { Message } from './types/Message'

class AgentManager {
    public agents: Agent[] = [];
    public formData = {
        name: '', purpose: '', personality: '', knowledge: ''
    }
    public selectedId: string | null = null;
    public isLoading: boolean = false;
    public isSaving: boolean = false;
    public notice: string = '';
    public errorMessage: string = '';
    public activeTab: 'workspace' | 'knowledge' = 'workspace';
    public showEditor: boolean = false;
    public isEditing: boolean = false;
    public messages: Message[] = [];
    public messageInput: string = '';
    public isChatting: boolean = false;

    public get selectedAgent(): Agent | null {
        return this.agents.find((agent) => agent.id === this.selectedId) ?? null;
    }
    public get knowledgeList(): string[] {
        return this.selectedAgent?.knowledge_sources ?? [];
    }

    public async loadAgents() {
        this.isLoading = true;
        const { data, error } = await supabase.from('agents').select('*').order('updated_at', { ascending: false })
        if (error) this.errorMessage = error.message
        else {
            this.agents = data ?? [];
            if (!this.selectedId && this.agents[0]) this.selectAgent(this.agents[0])
        }
        this.isLoading = false;
    }
    public selectAgent(agent: Agent) {
        this.selectedId = agent.id;
        this.messages = [];
        this.activeTab = 'workspace';
        this.notice = ''
    }

    public resetForm() {
        this.formData = { name: '', purpose: '', personality: '', knowledge: '' }
    }
    public newAgent() {
        this.resetForm();
        this.isEditing = false;
        this.showEditor = true
    }
    public editAgent(agent: Agent) {
        this.selectedId = agent.id;
        this.formData = { 
            name: agent.name, 
            purpose: agent.purpose, 
            personality: agent.personality, 
            knowledge: agent.knowledge_sources.join('\n') 
        };
        this.isEditing = true;
        this.showEditor = true
    }

    public async saveAgent() {
        if (!this.formData.name.trim() || !this.formData.purpose.trim()) return
        this.isSaving = true;
        this.errorMessage = ''
        const payload = {
            name: this.formData.name.trim(),
            purpose: this.formData.purpose.trim(),
            personality: this.formData.personality.trim(),
            knowledge_sources: this.formData.knowledge.split('\n').map((item) => item.trim()).filter(Boolean),
        }
        const result = this.isEditing && this.selectedId
            ? await supabase.from('agents').update(payload).eq('id', this.selectedId).select().single()
            : await supabase.from('agents').insert(payload).select().single()
        if (result.error) this.errorMessage = result.error.message
        else {
            const saved = result.data as Agent
            this.agents = this.isEditing
                ? this.agents.map((agent) => agent.id === saved.id ? saved : agent)
                : [saved, ...this.agents]
            this.selectedId = saved.id
            this.showEditor = false
            this.notice = this.isEditing ? 'Agent updated' : 'Agent created'
            this.messages = []
        }
        this.isSaving = false
    }

    public async deleteAgent() {
        const agent = this.selectedAgent
        if (!agent || !window.confirm(`Delete ${agent.name}?`)) return
        const { error } = await supabase.from('agents').delete().eq('id', agent.id)
        if (error) this.errorMessage = error.message
        else {
            this.agents = this.agents.filter((item) => item.id !== agent.id)
            this.selectedId = this.agents[0]?.id ?? null
            this.messages = []
            this.notice = 'Agent deleted'
        }
    }

    public async sendMessage() {
        const content = this.messageInput.trim()
        const agent = this.selectedAgent
        if (!content || !agent || this.isChatting) return
        this.messages.push({ role: 'user', content })
        this.messageInput = ''
        this.isChatting = true
        this.errorMessage = ''
        // try to send message to LLM API and get response
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent, messages: this.messages }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error ?? 'The agent could not respond.')
            this.messages.push({ role: 'assistant', content: data.content })
        } catch (error) {
            this.errorMessage = error instanceof Error ? error.message : 'The agent could not respond.'
        } finally {
            this.isChatting = false
        }
    }

    public toggleEditor() {
        this.showEditor = !this.showEditor
        if (!this.showEditor) this.resetForm()
    }

    public isSaveActive(): boolean {
        return this.isSaving || !this.formData.name.trim() || !this.formData.purpose.trim()
    }

    public isThisSelectedAgent(agent: Agent): boolean {
        return this.selectedId === agent.id
    }

    public isSendMessageActive(): boolean {
        return !this.messageInput.trim() || this.isChatting
    }
}

export const manager = reactive(new AgentManager());