<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import { manager } from '../lib/AgentManager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <form class="editor-modal" @submit.prevent="manager.saveAgent">
        <div class="modal-heading">
            <div><span class="eyebrow">{{ manager.isEditingExistingAgent ? 'EDIT AGENT' : 'NEW AGENT' }}</span>
                <h2>Give it a point of view.</h2>
            </div><button type="button" class="close-button" @click="manager.cancelEditor">×</button>
        </div><label>Name<input v-model="manager.formData.name" required placeholder="e.g. Editorial partner"></label>
        <label>Purpose<textarea v-model="manager.formData.purpose" required rows="2"
                placeholder="What is this agent here to help with?"></textarea></label><label>Personality<textarea
                v-model="manager.formData.personality" rows="3"
                placeholder="Thoughtful, concise, curious..."></textarea></label>
        <label>Knowledge sources <span class="label-hint">one per line</span>
            <textarea v-model="manager.formData.knowledge" rows="4"
                placeholder="https://example.com/guide&#10;Our internal product brief"></textarea></label>
        <div class="modal-actions">
            <button type="button" class="secondary-button" @click="manager.cancelEditor">Cancel</button>
            <button class="primary-button" :disabled="manager.isSaveActive()">{{ manager.isSaving ? 'Saving...' :
                manager.isEditingExistingAgent
                    ?
                    'Save changes' : 'Create agent' }} <span>→</span></button>
        </div>
    </form>
</template>
<style scoped></style>