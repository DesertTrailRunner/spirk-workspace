<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import { manager } from '../lib/AgentManager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <button class="primary-button" style="margin-bottom: 20px;" @click="manager.newAgent">Create agent <span>→</span></button>
    <div class="sidebar-heading"><span>Your agents</span><span>{{ manager.agents.length }}</span></div>
    <div v-if="manager.isLoading" class="empty-state">Loading agents...</div>
    <div v-else-if="!manager.agents.length" class="empty-state">Your first agent starts here.</div>
    <button v-for="agent in manager.agents" :key="agent.id" class="agent-row"
        :class="{ active: manager.isThisSelectedAgent(agent) }" @click="manager.selectAgent(agent)">
        <span class="agent-icon">{{ agent.name.slice(0, 1).toUpperCase() }}</span>
        <span class="agent-row-copy"><strong>{{ agent.name }}</strong>
            <small>{{ agent.purpose }}</small></span>
        <span v-if="manager.isThisSelectedAgent(agent)" class="chevron">›</span>
    </button>
    <button class="delete-agent" @click="manager.deleteAgents"><span>-</span> Delete all your agents</button>
    <!-- <div class="sidebar-footer">? &nbsp; Help & documentation <span>↗</span></div> -->
</template>
<style scoped></style>