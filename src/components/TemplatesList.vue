<script lang='ts' setup>
/**
 * List of templates
 * @date 2026-09-19
 */
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
    <h2>Choose a template for your agent based on one of these topics</h2>
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