<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { supabase } from './lib/supabase'

type Agent = { id: string; name: string; purpose: string; personality: string; knowledge_sources: string[]; created_at: string; updated_at: string }
type Message = { role: 'user' | 'assistant'; content: string }
const agents = ref<Agent[]>([]), selectedId = ref<string | null>(null), isLoading = ref(true), isSaving = ref(false)
const errorMessage = ref(''), notice = ref(''), showEditor = ref(false), isEditing = ref(false)
const activeTab = ref<'workspace' | 'knowledge'>('workspace'), messageInput = ref(''), isChatting = ref(false)
const messages = ref<Message[]>([]), form = ref({ name: '', purpose: '', personality: '', knowledge: '' })
const selectedAgent = computed(() => agents.value.find((agent) => agent.id === selectedId.value) ?? null)
const knowledgeList = computed(() => selectedAgent.value?.knowledge_sources ?? [])

function resetForm() { form.value = { name: '', purpose: '', personality: '', knowledge: '' } }
function newAgent() { resetForm(); isEditing.value = false; showEditor.value = true }
function editAgent(agent: Agent) { selectedId.value = agent.id; form.value = { name: agent.name, purpose: agent.purpose, personality: agent.personality, knowledge: agent.knowledge_sources.join('\n') }; isEditing.value = true; showEditor.value = true }
function selectAgent(agent: Agent) { selectedId.value = agent.id; messages.value = []; activeTab.value = 'workspace'; notice.value = '' }

async function loadAgents() {
  isLoading.value = true
  const { data, error } = await supabase.from('agents').select('*').order('updated_at', { ascending: false })
  if (error) errorMessage.value = error.message
  else { agents.value = data ?? []; if (!selectedId.value && agents.value[0]) selectAgent(agents.value[0]) }
  isLoading.value = false
}
async function saveAgent() {
  if (!form.value.name.trim() || !form.value.purpose.trim()) return
  isSaving.value = true; errorMessage.value = ''
  const payload = { name: form.value.name.trim(), purpose: form.value.purpose.trim(), personality: form.value.personality.trim(), knowledge_sources: form.value.knowledge.split('\n').map((item) => item.trim()).filter(Boolean) }
  const result = isEditing.value && selectedId.value ? await supabase.from('agents').update(payload).eq('id', selectedId.value).select().single() : await supabase.from('agents').insert(payload).select().single()
  if (result.error) errorMessage.value = result.error.message
  else { const saved = result.data as Agent; agents.value = isEditing.value ? agents.value.map((agent) => agent.id === saved.id ? saved : agent) : [saved, ...agents.value]; selectedId.value = saved.id; showEditor.value = false; notice.value = isEditing.value ? 'Agent updated' : 'Agent created'; messages.value = [] }
  isSaving.value = false
}
async function deleteAgent() {
  if (!selectedAgent.value || !window.confirm(`Delete ${selectedAgent.value.name}?`)) return
  const { error } = await supabase.from('agents').delete().eq('id', selectedAgent.value.id)
  if (error) errorMessage.value = error.message
  else { agents.value = agents.value.filter((agent) => agent.id !== selectedAgent.value?.id); selectedId.value = agents.value[0]?.id ?? null; messages.value = []; notice.value = 'Agent deleted' }
}
async function sendMessage() {
  const content = messageInput.value.trim()
  if (!content || !selectedAgent.value || isChatting.value) return
  messages.value.push({ role: 'user', content }); messageInput.value = ''; isChatting.value = true; errorMessage.value = ''
  try { const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent: selectedAgent.value, messages: messages.value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'The agent could not respond.'); messages.value.push({ role: 'assistant', content: data.content }) }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'The agent could not respond.' }
  finally { isChatting.value = false }
}
onMounted(loadAgents)
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand"><span class="brand-mark">e</span><span>eyns<span class="muted">/</span>agent</span></div>
      <div class="topbar-meta"><span class="status-dot"></span> Workspace <span class="muted">/</span> personal</div>
      <button class="avatar" title="Account">H</button>
    </header>
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-heading"><span>Your agents</span><span>{{ agents.length }}</span></div><button
          class="new-agent" @click="newAgent"><span>+</span> New agent</button>
        <div v-if="isLoading" class="empty-state">Loading agents...</div>
        <div v-else-if="!agents.length" class="empty-state">Your first agent starts here.</div><button
          v-for="agent in agents" :key="agent.id" class="agent-row" :class="{ active: selectedId === agent.id }"
          @click="selectAgent(agent)"><span class="agent-icon">{{ agent.name.slice(0, 1).toUpperCase() }}</span><span
            class="agent-row-copy"><strong>{{ agent.name }}</strong><small>{{ agent.purpose }}</small></span><span
            v-if="selectedId === agent.id" class="chevron">›</span></button>
        <div class="sidebar-footer">? &nbsp; Help & documentation <span>↗</span></div>
      </aside>
      <main class="main-content">
        <div v-if="!selectedAgent" class="welcome-panel"><span class="eyebrow">AGENT STUDIO</span>
          <h1>Make something<br><em>useful.</em></h1>
          <p>Design an AI companion with a point of view, a purpose, and the context to do its best work.</p><button
            class="primary-button" @click="newAgent">Create your first agent <span>→</span></button>
        </div>
        <template v-else>
          <section class="agent-header">
            <div><span class="eyebrow">AGENT WORKSPACE</span>
              <h1>{{ selectedAgent.name }}</h1>
              <p>{{ selectedAgent.purpose }}</p>
            </div>
            <div class="header-actions"><button class="secondary-button" @click="editAgent(selectedAgent)">Edit
                agent</button><button class="danger-button" title="Delete agent" @click="deleteAgent">⌫</button></div>
          </section>
          <nav class="tabs"><button :class="{ active: activeTab === 'workspace' }"
              @click="activeTab = 'workspace'">Chat</button><button :class="{ active: activeTab === 'knowledge' }"
              @click="activeTab = 'knowledge'">Knowledge <span>{{ knowledgeList.length }}</span></button></nav>
          <section v-if="activeTab === 'workspace'" class="chat-panel">
            <div v-if="!messages.length" class="chat-empty">
              <div class="spark">✦</div>
              <h2>Say hello to {{ selectedAgent.name }}</h2>
              <p>Your agent is ready. Ask it anything within its purpose.</p>
              <div class="suggestions"><button @click="messageInput = 'What can you help me with?'">What can you help me
                  with?</button><button @click="messageInput = 'Give me a quick introduction.'">Give me a quick
                  introduction.</button></div>
            </div>
            <div v-else class="messages">
              <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role"><span
                  class="message-label">{{ message.role === 'user' ? 'YOU' : selectedAgent.name.toUpperCase() }}</span>
                <p>{{ message.content }}</p>
              </div>
              <div v-if="isChatting" class="typing">{{ selectedAgent.name }} is thinking...</div>
            </div>
            <form class="composer" @submit.prevent="sendMessage"><textarea v-model="messageInput" rows="1"
                :placeholder="`Message ${selectedAgent.name}...`"
                @keydown.enter.exact.prevent="sendMessage"></textarea><button type="submit" class="send-button"
                :disabled="!messageInput.trim() || isChatting" title="Send message">↑</button></form><small
              class="disclaimer">AI can make mistakes. Check important information.</small>
          </section>
          <section v-else class="knowledge-panel">
            <div class="section-intro"><span class="eyebrow">CONTEXT LIBRARY</span>
              <h2>What {{ selectedAgent.name }} knows</h2>
              <p>Knowledge sources are included in every conversation as context.</p>
            </div>
            <div v-if="knowledgeList.length" class="source-list">
              <div v-for="(source, index) in knowledgeList" :key="source" class="source-item"><span
                  class="source-number">0{{ index + 1 }}</span><span>{{ source }}</span></div>
            </div>
            <div v-else class="source-empty">No knowledge sources yet. <button @click="editAgent(selectedAgent)">Add one
                in the editor.</button></div>
          </section>
        </template>
        <div v-if="notice" class="toast">{{ notice }}</div>
        <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
      </main>
    </div>
    <div v-if="showEditor" class="modal-backdrop" @click.self="showEditor = false">
      <form class="editor-modal" @submit.prevent="saveAgent">
        <div class="modal-heading">
          <div><span class="eyebrow">{{ isEditing ? 'EDIT AGENT' : 'NEW AGENT' }}</span>
            <h2>Give it a point of view.</h2>
          </div><button type="button" class="close-button" @click="showEditor = false">×</button>
        </div><label>Name<input v-model="form.name" required
            placeholder="e.g. Editorial partner"></label><label>Purpose<textarea v-model="form.purpose" required
            rows="2" placeholder="What is this agent here to help with?"></textarea></label><label>Personality<textarea
            v-model="form.personality" rows="3"
            placeholder="Thoughtful, concise, curious..."></textarea></label><label>Knowledge sources <span
            class="label-hint">one per line</span><textarea v-model="form.knowledge" rows="4"
            placeholder="https://example.com/guide&#10;Our internal product brief"></textarea></label>
        <div class="modal-actions"><button type="button" class="secondary-button"
            @click="showEditor = false">Cancel</button><button class="primary-button"
            :disabled="isSaving || !form.name.trim() || !form.purpose.trim()">{{ isSaving ? 'Saving...' : isEditing ?
              'Save changes' : 'Create agent' }} <span>→</span></button></div>
      </form>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

:root {
  --ink: #20201e;
  --muted: #777872;
  --paper: #f4f1eb;
  --line: #dbd8d0;
  --orange: #e85d31;
  --dark: #292a26;
  font-family: 'Manrope', sans-serif;
  color: var(--ink);
  background: var(--paper)
}

* {
  box-sizing: border-box
}

body {
  margin: 0
}

button,
input,
textarea {
  font: inherit
}

button {
  cursor: pointer
}

.app-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 75% 85%, #e9e2d6 0, transparent 35%), var(--paper)
}

.topbar {
  height: 70px;
  padding: 0 35px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line);
  background: #f4f1ebd9
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 800;
  font-size: 17px;
  letter-spacing: -.5px
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  color: #fff;
  background: var(--orange);
  font-family: Georgia, serif
}

.muted {
  color: #aeaca5
}

.topbar-meta {
  margin-left: auto;
  margin-right: 25px;
  color: var(--muted);
  font: 11px 'DM Mono', monospace;
  text-transform: uppercase;
  letter-spacing: .5px
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 7px;
  border-radius: 50%;
  background: #6eae7e
}

.avatar {
  border: 0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: #d7d8cc;
  color: #5d6555;
  font-weight: 700
}

.app-layout {
  display: grid;
  grid-template-columns: 286px minmax(0, 1fr);
  min-height: calc(100vh - 70px)
}

.sidebar {
  border-right: 1px solid var(--line);
  padding: 35px 20px 20px;
  display: flex;
  flex-direction: column
}

.sidebar-heading {
  display: flex;
  justify-content: space-between;
  margin: 0 14px 16px;
  color: var(--muted);
  font: 11px 'DM Mono', monospace;
  text-transform: uppercase;
  letter-spacing: .6px
}

.new-agent {
  margin-bottom: 20px;
  padding: 11px 14px;
  border: 1px solid #c8c5bc;
  border-radius: 4px;
  color: var(--ink);
  background: transparent;
  text-align: left;
  font-weight: 700
}

.new-agent span {
  margin-right: 8px;
  color: var(--orange);
  font-size: 20px
}

.agent-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 12px 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  text-align: left;
  color: var(--ink)
}

.agent-row.active {
  background: #e7e3da
}

.agent-icon {
  flex: 0 0 29px;
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  border-radius: 4px;
  background: #d9ded0;
  color: #58624f;
  font-size: 12px;
  font-weight: 800
}

.agent-row-copy {
  min-width: 0;
  display: grid;
  gap: 3px
}

.agent-row strong,
.agent-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.agent-row strong {
  font-size: 13px
}

.agent-row small {
  color: var(--muted);
  font-size: 11px
}

.chevron {
  margin-left: auto;
  color: var(--orange);
  font-size: 20px
}

.empty-state {
  padding: 12px 14px;
  color: var(--muted);
  font-size: 12px
}

.sidebar-footer {
  margin-top: auto;
  padding: 20px 12px 4px;
  color: var(--muted);
  font-size: 11px
}

.sidebar-footer span {
  float: right
}

.main-content {
  position: relative;
  max-width: 1000px;
  width: 100%;
  margin: auto;
  padding: 72px 8%
}

.eyebrow {
  display: block;
  color: var(--orange);
  font: 10px 'DM Mono', monospace;
  letter-spacing: 1.7px
}

.welcome-panel {
  max-width: 560px;
  margin: 7vh auto
}

.welcome-panel h1 {
  margin: 18px 0 20px;
  font-size: clamp(44px, 6vw, 78px);
  line-height: .98;
  letter-spacing: -4px
}

.welcome-panel h1 em {
  color: var(--orange);
  font-family: Georgia, serif;
  font-weight: 400
}

.welcome-panel p {
  max-width: 430px;
  color: var(--muted);
  line-height: 1.7
}

.primary-button,
.secondary-button,
.danger-button {
  border-radius: 3px;
  padding: 12px 17px;
  font-weight: 700
}

.primary-button {
  border: 0;
  color: #fff;
  background: var(--orange)
}

.primary-button span {
  margin-left: 18px;
  font-size: 18px
}

.welcome-panel .primary-button {
  margin-top: 22px
}

.agent-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px
}

.agent-header h1 {
  margin: 11px 0 7px;
  font-size: clamp(32px, 4vw, 48px);
  letter-spacing: -2px
}

.agent-header p {
  margin: 0;
  color: var(--muted);
  font-size: 14px
}

.header-actions {
  display: flex;
  gap: 8px
}

.secondary-button {
  border: 1px solid #c8c5bc;
  color: var(--ink);
  background: transparent
}

.danger-button {
  border: 1px solid #ddc9c0;
  color: #ad573b;
  background: transparent;
  font-size: 18px
}

.tabs {
  display: flex;
  gap: 28px;
  margin-top: 62px;
  border-bottom: 1px solid var(--line)
}

.tabs button {
  position: relative;
  padding: 0 0 13px;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-weight: 700
}

.tabs button.active {
  color: var(--ink)
}

.tabs button.active:after {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--orange);
  content: ''
}

.tabs span {
  margin-left: 5px;
  color: #aaa79e;
  font: 10px 'DM Mono', monospace
}

.chat-panel {
  min-height: 440px;
  display: flex;
  flex-direction: column
}

.chat-empty {
  margin: auto;
  text-align: center
}

.spark {
  color: var(--orange);
  font-size: 31px
}

.chat-empty h2 {
  margin: 12px 0 8px;
  font-size: 19px
}

.chat-empty p {
  color: var(--muted);
  font-size: 13px
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px;
  margin-top: 28px
}

.suggestions button {
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 30px;
  color: var(--muted);
  background: transparent;
  font-size: 11px
}

.messages {
  flex: 1;
  display: grid;
  align-content: end;
  gap: 22px;
  padding: 30px 0
}

.message {
  max-width: 78%
}

.message.user {
  justify-self: end;
  text-align: right
}

.message-label {
  color: var(--orange);
  font: 9px 'DM Mono', monospace;
  letter-spacing: 1px
}

.message p {
  margin: 6px 0 0;
  line-height: 1.6;
  white-space: pre-wrap
}

.message.user p {
  display: inline-block;
  padding: 10px 14px;
  border-radius: 12px 12px 2px 12px;
  background: #e6e1d7;
  text-align: left
}

.typing {
  color: var(--muted);
  font-size: 12px
}

.composer {
  display: flex;
  gap: 10px;
  align-items: end;
  padding: 11px 12px 11px 16px;
  border: 1px solid #c8c5bc;
  border-radius: 5px;
  background: #ffffff4d
}

.composer textarea {
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  color: var(--ink);
  background: transparent;
  font-size: 13px
}

.send-button {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 3px;
  color: #fff;
  background: var(--orange);
  font-size: 20px
}

.send-button:disabled {
  opacity: .4
}

.disclaimer {
  display: block;
  margin-top: 10px;
  color: #9a978e;
  font-size: 10px;
  text-align: center
}

.knowledge-panel {
  padding-top: 36px
}

.section-intro h2 {
  margin: 12px 0 8px;
  font-size: 25px
}

.section-intro p {
  color: var(--muted);
  font-size: 13px
}

.source-list {
  margin-top: 35px;
  border-top: 1px solid var(--line)
}

.source-item {
  display: flex;
  gap: 25px;
  padding: 17px 5px;
  border-bottom: 1px solid var(--line);
  font-size: 13px
}

.source-number {
  color: var(--orange);
  font: 10px 'DM Mono', monospace
}

.source-empty {
  margin-top: 35px;
  color: var(--muted);
  font-size: 13px
}

.source-empty button {
  padding: 0;
  border: 0;
  color: var(--orange);
  background: transparent;
  text-decoration: underline
}

.toast,
.error-banner {
  position: fixed;
  right: 25px;
  bottom: 25px;
  padding: 12px 16px;
  border-radius: 3px;
  color: #fff;
  background: var(--dark);
  font-size: 12px
}

.error-banner {
  bottom: 72px;
  background: #9e402e
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #20201e6b
}

.editor-modal {
  width: min(560px, 100%);
  padding: 32px;
  border-radius: 5px;
  background: var(--paper);
  box-shadow: 0 20px 60px #20201e33
}

.modal-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px
}

.modal-heading h2 {
  margin: 10px 0 0;
  font-size: 25px;
  letter-spacing: -1px
}

.close-button {
  align-self: start;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-size: 25px
}

.editor-modal label {
  display: block;
  margin-top: 18px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700
}

.label-hint {
  float: right;
  color: #aaa79e;
  font-weight: 400
}

.editor-modal input,
.editor-modal textarea {
  display: block;
  width: 100%;
  margin-top: 7px;
  padding: 11px;
  resize: vertical;
  border: 1px solid #cecac0;
  border-radius: 3px;
  outline-color: var(--orange);
  color: var(--ink);
  background: #faf8f3;
  font-size: 13px
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 28px
}

@media(max-width:700px) {
  .topbar {
    padding: 0 18px
  }

  .topbar-meta {
    display: none
  }

  .app-layout {
    display: block
  }

  .sidebar {
    min-height: auto;
    padding: 20px 15px 14px;
    border-right: 0;
    border-bottom: 1px solid var(--line)
  }

  .sidebar-footer {
    display: none
  }

  .sidebar-heading {
    margin-top: 0
  }

  .agent-row {
    display: none
  }

  .agent-row.active {
    display: flex
  }

  .new-agent {
    margin-bottom: 8px
  }

  .main-content {
    padding: 42px 20px
  }

  .agent-header {
    display: block
  }

  .header-actions {
    margin-top: 22px
  }

  .tabs {
    margin-top: 40px
  }

  .welcome-panel {
    margin: 5vh 0
  }

  .welcome-panel h1 {
    letter-spacing: -2px
  }

  .editor-modal {
    padding: 24px
  }
}
</style>
