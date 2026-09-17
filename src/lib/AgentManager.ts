/**
 * AgentManager
 * @date 2026-09-17
 */
import { reactive } from 'vue'
import { supabase } from './supabase'
import type { Agent } from './types/Agent'
import type { Message } from './types/Message'
import type { Template } from './types/Template'

class AgentManager {
    public isProduction: boolean = import.meta.env.PROD;

    public agents: Agent[] = [];
    public templates: Template[] = [];
    public formData = {
        name: '', purpose: '', personality: '', knowledge: ''
    }

    // state
    public step: string = 'intro'; // loading | intro | choosing-template | editing | saving | chatting
    public get isLoading(): boolean { return this.step === 'loading' }
    public get isIntro(): boolean { return this.step === 'intro' }
    public get isChoosingTemplates(): boolean { return this.step === 'choosing-template' }
    public get isEditing(): boolean { return this.step === 'editing' }
    public get isSaving(): boolean { return this.step === 'saving' }
    public get isChatting(): boolean { return this.step === 'chatting' }

    // selections
    public isEditingExistingAgent: boolean = false;
    public selectedTemplate: Template | null = null;
    public selectedId: string | null = null;

    public notice: string = '';
    public errorMessage: string = '';
    public activeTab: 'workspace' | 'knowledge' = 'workspace';
    public messages: Message[] = [];
    public messageInput: string = '';

    public get selectedAgent(): Agent | null {
        return this.agents.find((agent) => agent.id === this.selectedId) ?? null;
    }
    public get knowledgeList(): string[] {
        return this.selectedAgent?.knowledge ?? [];
    }

    public async init() {
        this.step = 'loading';
        await this.loadTemplates();
        await this.loadAgents();
        this.step = 'intro';
    }

    public async loadTemplates() {
        const config = await fetch('./config.json').then((res) => res.json())
        this.templates = config.templates ?? [];
    }

    public async loadAgents() {
        if (localStorage.getItem('agents')) {
            this.agents = JSON.parse(localStorage.getItem('agents') ?? '[]');
            // if (!this.selectedId && this.agents[0]) this.selectAgent(this.agents[0])
        }
        if (this.isProduction) {
            const { data, error } = await supabase.from('agents').select('*').order('updated_at', { ascending: false })
            if (error) this.errorMessage = error.message
            else {
                this.agents = data ?? [];
                if (!this.selectedId && this.agents[0]) this.selectAgent(this.agents[0])
            }
        } else {
            console.info("load locally");
        }
    }

    public selectTemplate(template: Template) {
        this.selectedTemplate = template;
        this.step = 'editing';
        this.formData.knowledge = template.knowledge.join('\n');
    }

    public selectAgent(agent: Agent) {
        this.selectedId = agent.id;
        this.messages = [];
        this.activeTab = 'workspace';
        this.notice = '';
        this.step = 'chatting';
    }

    public resetForm() {
        this.formData = { name: '', purpose: '', personality: '', knowledge: '' }
    }
    public newAgent() {
        this.resetForm();
        this.formData.personality = 'Professional';
        this.isEditingExistingAgent = false;
        this.step = 'choosing-template';
    }
    public editAgent(agent: Agent) {
        this.selectedId = agent.id;
        this.formData = {
            name: agent.name,
            purpose: agent.purpose,
            personality: agent.personality,
            knowledge: agent.knowledge.join('\n')
        };
        this.isEditingExistingAgent = true;
        this.step = 'editing';
    }

    public async saveAgent() {
        if (!this.formData.name.trim() || !this.formData.purpose.trim()) return
        this.step = 'saving';
        this.errorMessage = ''
        let agent: Agent = {
            name: this.formData.name.trim(),
            purpose: this.formData.purpose.trim(),
            personality: this.formData.personality.trim(),
            knowledge: this.formData.knowledge.split('\n').map((item) => item.trim()).filter(Boolean),
            id: this.isEditingExistingAgent && this.selectedId ? this.selectedId : crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        this.agents.push(agent);
        localStorage.setItem('agents', JSON.stringify(this.agents));
        this.selectedId = agent.id;
        this.step = 'chatting';
        this.notice = this.isEditingExistingAgent ? 'Agent updated' : 'Agent created';
        this.messages = [];

        const payload = {
            name: this.formData.name.trim(),
            purpose: this.formData.purpose.trim(),
            personality: this.formData.personality.trim(),
            knowledge: this.formData.knowledge.split('\n').map((item) => item.trim()).filter(Boolean),
        }
        // if (this.isProduction) {
        //     const result = this.isEditingExistingAgent && this.selectedId
        //         ? await supabase.from('agents').update(payload).eq('id', this.selectedId).select().single()
        //         : await supabase.from('agents').insert(payload).select().single();
        //     if (result.error) this.errorMessage = result.error.message
        //     else {
        //         const saved = result.data as Agent
        //         this.agents = this.isEditingExistingAgent
        //             ? this.agents.map((agent) => agent.id === saved.id ? saved : agent)
        //             : [saved, ...this.agents]
        //         this.selectedId = saved.id
        //         this.step = 'chatting'
        //         this.notice = this.isEditingExistingAgent ? 'Agent updated' : 'Agent created'
        //         this.messages = []
        //     }
        // } else {
        //     console.info("save locally");
        //     this.step = 'chatting'
        //     this.notice = this.isEditingExistingAgent ? 'Agent updated' : 'Agent created'
        //     this.messages = []
        // }

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
            // this.isChatting = false
        }
    }

    public cancelEditor() {
        this.step = this.selectedAgent === null ? 'intro' : 'chatting';
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