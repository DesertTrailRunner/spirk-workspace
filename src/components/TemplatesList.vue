<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import { manager } from '../lib/AgentManager';
import { type Template } from '../lib/types/Template';
import TemplateButton from './TemplateButton.vue';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <section ref="containerRef">
        <TemplateButton v-for="(template, t) in manager.templates" :key="t" :template="template" />
    </section>
</template>
<style scoped>
section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>