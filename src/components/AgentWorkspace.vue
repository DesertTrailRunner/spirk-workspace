<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import * as Manager from '../lib/manager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <section class="agent-header">
        <div><span class="eyebrow">AGENT WORKSPACE</span>
            <!-- <h1>{{ Manager.selectedAgent.value.name }}</h1>
            <p>{{ Manager.selectedAgent.purpose }}</p> -->
        </div>
        <!-- <div class="header-actions"><button class="secondary-button" @click="Manager.editAgent(Manager.selectedAgent)">Edit
                agent</button><button class="danger-button" title="Delete agent" @click="Manager.deleteAgent">⌫</button></div> -->
    </section>
    <nav class="tabs"><button :class="{ active: Manager.activeTab.value === 'workspace' }"
            @click="Manager.activeTab.value = 'workspace'">Chat</button><button :class="{ active: Manager.activeTab.value === 'knowledge' }"
            @click="Manager.activeTab.value = 'knowledge'">Knowledge <span>{{ Manager.knowledgeList.value.length }}</span></button></nav>
    <section v-if="Manager.activeTab.value === 'workspace'" class="chat-panel">
        <!-- <div v-if="!Manager.messages.length" class="chat-empty">
            <div class="spark">✦</div>
            <h2>Say hello to {{ Manager.selectedAgent.value.name }}</h2>
            <p>Your agent is ready. Ask it anything within its purpose.</p>
            <div class="suggestions"><button @click="Manager.messageInput = 'What can you help me with?'">What can you help me
                    with?</button><button @click="Manager.messageInput = 'Give me a quick introduction.'">Give me a quick
                    introduction.</button></div>
        </div>
        <div v-else class="messages">
            <div v-for="(message, index) in Manager.messages" :key="index" class="message" :class="message.role"><span
                    class="message-label">{{ message.role === 'user' ? 'YOU' : Manager.selectedAgent.value.name.toUpperCase()
                    }}</span>
                <p>{{ message.content }}</p>
            </div>
            <div v-if="Manager.isChatting && Manager.selectedAgent && Manager.selectedAgent.value" class="typing">{{ Manager.selectedAgent.value.name }} is thinking...</div>
        </div> -->
        <form v-if="Manager.selectedAgent && Manager.selectedAgent.value" class="composer" @submit.prevent="Manager.sendMessage"><textarea v-model="Manager.messageInput.value" rows="1"
                :placeholder="`Message ${Manager.selectedAgent.value.name}...`"
                @keydown.enter.exact.prevent="Manager.sendMessage"></textarea><button type="submit" class="send-button"
                :disabled="Manager.isSendMessageActive()" title="Send message">↑</button></form><small
            class="disclaimer">AI can make mistakes. Check important information.</small>
    </section>
    <section v-else class="knowledge-panel">
        <div class="section-intro"><span class="eyebrow">CONTEXT LIBRARY</span>
            <h2 v-if="Manager.selectedAgent && Manager.selectedAgent.value">What {{ Manager.selectedAgent.value.name }} knows</h2>
            <p>Knowledge sources are included in every conversation as context.</p>
        </div>
        <div v-if="Manager.knowledgeList.value.length" class="source-list">
            <div v-for="(source, index) in Manager.knowledgeList.value" :key="source" class="source-item"><span
                    class="source-number">0{{ index + 1 }}</span><span>{{ source }}</span></div>
        </div>
        <div v-else class="source-empty">No knowledge sources yet. <button v-if="Manager.selectedAgent && Manager.selectedAgent.value" @click="Manager.editAgent(Manager.selectedAgent.value)">Add one
                in the editor.</button></div>
    </section>
</template>
<style scoped></style>