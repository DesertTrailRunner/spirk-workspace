<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import * as Manager from '../lib/manager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <div v-if="!Manager.selectedAgent" class="welcome-panel"><span class="eyebrow">AGENT STUDIO</span>
        <h1>Make something<br><em>useful.</em></h1>
        <p>Design an AI companion with a point of view, a purpose, and the context to do its best work.</p><button
            class="primary-button" @click="Manager.newAgent">Create your first agent <span>→</span></button>
    </div>
</template>
<style scoped></style>