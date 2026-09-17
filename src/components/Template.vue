<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
interface IProps {
}
const containerRef = ref(null),
props = defineProps<IProps>();
</script>
<template>
<section ref="containerRef"></section>
</template>
<style scoped>
</style>