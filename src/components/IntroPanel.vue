<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import { manager } from '../lib/AgentManager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <div v-if="!manager.selectedAgent" class="welcome-panel"><span class="eyebrow">AGENT STUDIO</span>
        <h1>Build your own <br><em>agent</em></h1>
        <p>Design an AI companion with a point of view, a purpose, and the context to do its best work.</p>
    </div>
</template>
<style scoped></style>