<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import { manager } from '../lib/AgentManager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <div class="brand"><span>EY Northeast Ohio Teens in Tech - Agent Studio</span></div>
    <div class="topbar-meta"><span class="status-dot"></span> <input @change="manager.updateAuthor" type="text" v-model="manager.authorName" placeholder="Your name" /></div>
    <button class="avatar" title="Account">EY</button>
</template>
<style scoped></style>