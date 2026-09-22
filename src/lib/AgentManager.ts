/**
 * AgentManager
 * @date 2026-09-22
 */
import { reactive } from 'vue'
import { supabase } from '../api/supabase'
import type { Agent } from './types/Agent'
import type { Message } from './types/Message'
import type { Template } from './types/Template'
import * as ChatGPT from '../api/chat';

class AgentManager {
    public isProduction: boolean = import.meta.env.PROD;

    public authorName: string = "";
    public agents: Agent[] = [];
    public templates: Template[] = [];
    public formData = {
        name: '', purpose: '', personality: '', knowledge: ''
    }

    // state
    public step: string = 'intro'; // loading | intro | choosing-template | editing | chatting
    public get isLoading(): boolean { return this.step === 'loading' }
    public get isIntro(): boolean { return this.step === 'intro' }
    public get isChoosingTemplates(): boolean { return this.step === 'choosing-template' }
    public get isEditing(): boolean { return this.step === 'editing' }
    public isSaving: boolean = false;
    public get isChatting(): boolean { return this.step === 'chatting' }
    public isSendingMessage: boolean = false;

    // selections
    public isEditingExistingAgent: boolean = false;
    public selectedTemplate: Template | null = null;
    public selectedId: string | null = null;

    public notice: string = '';
    public errorMessage: string = '';
    public activeTab: 'workspace' | 'knowledge' = 'workspace';
    public messages: Message[] = [];
    public messageInput: string = '';
    private previousResponseId: string | undefined = undefined;

    public get selectedAgent(): Agent | null {
        return this.agents.find((agent) => agent.id === this.selectedId) ?? null;
    }
    public get knowledgeList(): string[] {
        return this.selectedAgent?.knowledge ?? [];
    }

    public async init() {
        this.step = 'loading';
        this.authorName = localStorage.getItem('authorName') ?? 'anonymous';
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
            // console.log("load from supabase");
            // const { data, error } = await supabase.from('agents').select('*').order('updated_at', { ascending: false })
            // if (error) this.errorMessage = error.message
            // else {
            //     this.agents = data ?? [];
            //     if (!this.selectedId && this.agents[0]) this.selectAgent(this.agents[0])
            // }
        } else {
            // console.info("load locally");
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

    public newAgent() {
        this.resetForm();
        // this.formData.personality = 'Professional';
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

    public async saveAgentToDatabase(payload: Omit<Agent, 'id' | 'created_at' | 'updated_at'>, id?: string): Promise<Agent> {
        const result = id
            ? await supabase.from('agents').update(payload).eq('id', id).select().single()
            : await supabase.from('agents').insert(payload).select().single()

        if (result.error) throw result.error
        return result.data as Agent
    }

    public async saveTrackingToDatabase(action: string): Promise<void> {
        const payload = {
            author: this.authorName,
            action: action
        },
         result = await supabase.from('tracking').insert(payload);
    }

    public async saveAgent() {
        if (!this.formData.name.trim() || !this.formData.purpose.trim()) return
        this.isSaving = true;
        this.errorMessage = ''
        let agent: Agent = {
            name: this.formData.name.trim(),
            purpose: this.formData.purpose.trim(),
            personality: this.formData.personality.trim(),
            knowledge: this.formData.knowledge.split('\n').map((item) => item.trim()).filter(Boolean),
            id: this.isEditingExistingAgent && this.selectedId ? this.selectedId : crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author: this.authorName.trim() || 'Anonymous'
        }
        this.agents.push(agent);
        localStorage.setItem('agents', JSON.stringify(this.agents));
        this.selectedId = agent.id;
        this.isSaving = false;
        this.step = 'chatting';
        this.notice = this.isEditingExistingAgent ? 'Agent updated' : 'Agent created';

        // also save to database
        const payload = {
            name: agent.name,
            purpose: agent.purpose,
            personality: agent.personality,
            knowledge: agent.knowledge,
            author: agent.author
        }
        await this.saveAgentToDatabase(payload, this.isEditingExistingAgent ? agent.id : undefined);

    }

    public async deleteAgent() {
        const agent = this.selectedAgent
        if (!agent || !window.confirm(`Delete ${agent.name}?`)) return
        const { error } = await supabase.from('agents').delete().eq('id', agent.id)
        if (error) this.errorMessage = error.message
        else {
            this.agents = this.agents.filter((item) => item.id !== agent.id);
            this.notice = 'Agent deleted';
            this.home();
        }
    }

    public async sendMessage() {
        const content = this.messageInput.trim();
        const agent = this.selectedAgent;
        if (!content || !agent || this.isSendingMessage) return;
        this.isSendingMessage = true;
        this.messages.push({ role: 'user', content });
        this.messageInput = '';
        this.errorMessage = '';

        this.saveTrackingToDatabase("Send message: "+content.substring(0, 25)+"...");

        // try to send message to LLM API and get response
        try {
            const response = await ChatGPT.sendMessage(agent, this.messages, this.previousResponseId);
            this.messages.push({ role: 'assistant', content: response.output_text ?? 'The agent could not respond.' });
            this.previousResponseId = response.id;
        } catch (error) {
            this.errorMessage = error instanceof Error ? error.message : 'The agent could not respond.';
        } finally {
            this.isSendingMessage = false;
        }
    }

    public cancelEditor() {
        this.step = this.selectedAgent === null ? 'intro' : 'chatting';
    }

    public home() {
        this.step = 'intro';
        this.selectedId = null;
        this.messages = [];
        this.previousResponseId = undefined;
    }
    public resetForm() {
        this.formData = { name: '', purpose: '', personality: '', knowledge: '' }
    }

    public isSaveActive(): boolean {
        return this.isSaving || !this.formData.name.trim() || !this.formData.purpose.trim()
    }

    public isThisSelectedAgent(agent: Agent): boolean {
        return this.selectedId === agent.id
    }

    public isSendMessageActive(): boolean {
        return this.messageInput.trim()!=''
    }

    public updateAuthor() {
        localStorage.setItem('authorName', this.authorName.trim());
    }

    public deleteAgents() {
        if (!window.confirm(`Delete all agents?`)) return
        this.agents = [];
        localStorage.removeItem('agents');
        this.notice = 'All agents deleted';
        this.home();
    }
}

export const manager = reactive(new AgentManager());