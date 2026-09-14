<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import * as Manager from '../lib/manager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <div class="brand"><span>EY Northeast Ohio Teens in Tech Workshop<span class="muted">/</span>agent</span></div>
    <div class="topbar-meta"><span class="status-dot"></span> Workspace <span class="muted">/</span> personal</div>
    <button class="avatar" title="Account">H</button>
</template>
<style scoped></style>