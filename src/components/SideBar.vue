<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import * as Manager from '../lib/manager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <div class="sidebar-heading"><span>Your agents</span><span>{{ Manager.agents.length }}</span></div><button
        class="new-agent" @click="Manager.newAgent"><span>+</span> New agent</button>
    <div v-if="Manager.isLoading" class="empty-state">Loading agents...</div>
    <div v-else-if="!Manager.agents.length" class="empty-state">Your first agent starts here.</div><button
        v-for="agent in Manager.agents" :key="agent.id" class="agent-row" :class="{ active: Manager.isThisSelectedAgent(agent) }"
        @click="Manager.selectAgent(agent)"><span class="agent-icon">{{ agent.name.slice(0, 1).toUpperCase()
            }}</span><span class="agent-row-copy"><strong>{{ agent.name }}</strong><small>{{ agent.purpose
                }}</small></span><span v-if="Manager.isThisSelectedAgent(agent)" class="chevron">›</span></button>
    <div class="sidebar-footer">? &nbsp; Help & documentation <span>↗</span></div>
</template>
<style scoped></style>