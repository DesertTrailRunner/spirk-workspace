<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import { manager } from '../lib/AgentManager';
import { type Template } from '../lib/types/Template';

interface IProps {
    template: Template;
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <button @click="manager.selectTemplate(template)" class="new-agent">{{ template.topic }}</button>
</template>
<style scoped></style>