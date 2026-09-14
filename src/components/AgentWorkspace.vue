<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import { manager } from '../lib/AgentManager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <section v-if="manager.selectedAgent" class="agent-header">
        <div><span class="eyebrow">AGENT WORKSPACE</span>
            <h1>{{ manager.selectedAgent.name }}</h1>
            <p>{{ manager.selectedAgent.purpose }}</p>
        </div>
        <!-- <div class="header-actions"><button class="secondary-button" @click="manager.editAgent(manager.selectedAgent)">Edit
                agent</button><button class="danger-button" title="Delete agent" @click="manager.deleteAgent">⌫</button></div> -->
    </section>
    <nav class="tabs"><button :class="{ active: manager.activeTab === 'workspace' }"
            @click="manager.activeTab = 'workspace'">Chat</button><button :class="{ active: manager.activeTab === 'knowledge' }"
            @click="manager.activeTab = 'knowledge'">Knowledge <span>{{ manager.knowledgeList.length }}</span></button></nav>
    <section v-if="manager.selectedAgent && manager.activeTab === 'workspace'" class="chat-panel">
        <div v-if="!manager.messages.length" class="chat-empty">
            <div class="spark">✦</div>
            <h2>Say hello to {{ manager.selectedAgent.name }}</h2>
            <p>Your agent is ready. Ask it anything within its purpose.</p>
            <div class="suggestions"><button @click="manager.messageInput = 'What can you help me with?'">What can you help me
                    with?</button><button @click="manager.messageInput = 'Give me a quick introduction.'">Give me a quick
                    introduction.</button></div>
        </div>
        <div v-else class="messages">
            <div v-for="(message, index) in manager.messages" :key="index" class="message" :class="message.role"><span
                    class="message-label">{{ message.role === 'user' ? 'YOU' : manager.selectedAgent.name.toUpperCase()
                    }}</span>
                <p>{{ message.content }}</p>
            </div>
            <div v-if="manager.isChatting && manager.selectedAgent" class="typing">{{ manager.selectedAgent.name }} is thinking...</div>
        </div>
        <form v-if="manager.selectedAgent" class="composer" @submit.prevent="manager.sendMessage"><textarea v-model="manager.messageInput" rows="1"
                :placeholder="`Message ${manager.selectedAgent.name}...`"
                @keydown.enter.exact.prevent="manager.sendMessage"></textarea><button type="submit" class="send-button"
                :disabled="manager.isSendMessageActive()" title="Send message">↑</button></form><small
            class="disclaimer">AI can make mistakes. Check important information.</small>
    </section>
    <section v-else class="knowledge-panel">
        <div class="section-intro"><span class="eyebrow">CONTEXT LIBRARY</span>
            <h2 v-if="manager.selectedAgent">What {{ manager.selectedAgent.name }} knows</h2>
            <p>Knowledge sources are included in every conversation as context.</p>
        </div>
        <div v-if="manager.knowledgeList.length" class="source-list">
            <div v-for="(source, index) in manager.knowledgeList" :key="source" class="source-item"><span
                    class="source-number">0{{ index + 1 }}</span><span>{{ source }}</span></div>
        </div>
        <div v-else class="source-empty">No knowledge sources yet. <button v-if="manager.selectedAgent" @click="manager.editAgent(manager.selectedAgent)">Add one
                in the editor.</button></div>
    </section>
</template>
<style scoped></style>