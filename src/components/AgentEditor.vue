<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import * as Manager from '../lib/manager';

interface IProps {
}
const containerRef = ref(null),
    props = defineProps<IProps>();
</script>
<template>
    <form class="editor-modal" @submit.prevent="Manager.saveAgent">
        <div class="modal-heading">
            <div><span class="eyebrow">{{ Manager.isEditing ? 'EDIT AGENT' : 'NEW AGENT' }}</span>
                <h2>Give it a point of view.</h2>
            </div><button type="button" class="close-button" @click="Manager.toggleEditor">×</button>
        </div><label>Name<input v-model="Manager.agentData.name" required
                placeholder="e.g. Editorial partner"></label><label>Purpose<textarea v-model="Manager.agentData.purpose" required
                rows="2"
                placeholder="What is this agent here to help with?"></textarea></label><label>Personality<textarea
                v-model="Manager.agentData.personality" rows="3"
                placeholder="Thoughtful, concise, curious..."></textarea></label><label>Knowledge sources <span
                class="label-hint">one per line</span><textarea v-model="Manager.agentData.knowledge" rows="4"
                placeholder="https://example.com/guide&#10;Our internal product brief"></textarea></label>
        <div class="modal-actions"><button type="button" class="secondary-button"
                @click="Manager.toggleEditor">Cancel</button><button class="primary-button"
                :disabled="Manager.isSaveActive()">{{ Manager.isSaving ? 'Saving...' : Manager.isEditing
                    ?
                    'Save changes' : 'Create agent' }} <span>→</span></button></div>
    </form>
</template>
<style scoped></style>