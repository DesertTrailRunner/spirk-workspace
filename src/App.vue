<script setup lang="ts">
/**
 * App
 * @date 2026-09-19
 */
import { onMounted } from 'vue'
import { manager } from './lib/AgentManager';

import AppHeader from './components/AppHeader.vue';
import AgentsList from './components/AgentsList.vue';
import IntroPanel from './components/IntroPanel.vue';
import AgentWorkspace from './components/AgentWorkspace.vue';
import AgentEditor from './components/AgentEditor.vue';
import TemplatesList from './components/TemplatesList.vue';

onMounted(async () => {
  await manager.init();
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <AppHeader />
    </header>
    <div class="app-layout">
      <aside class="sidebar">
        <AgentsList v-if="manager.isIntro" />
      </aside>
      <main class="main-content">
        <IntroPanel v-if="manager.isIntro" />
        <TemplatesList v-if="manager.isChoosingTemplates" />
        <AgentWorkspace v-if="manager.isChatting" />

        <div v-if="manager.notice" class="toast">{{ manager.notice }}</div>
        <div v-if="manager.errorMessage" class="error-banner">{{ manager.errorMessage }}</div>
      </main>
    </div>
    <div v-if="manager.isEditing" class="modal-backdrop" @click.self="manager.cancelEditor">
      <AgentEditor />
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

:root {
  --ink: #20201e;
  --muted: #777872;
  --paper: #f4f1eb;
  --line: #dbd8d0;
  --orange: #e85d31;
  --dark: #292a26;
  font-family: 'Manrope', sans-serif;
  color: var(--ink);
  background: var(--paper)
}

* {
  box-sizing: border-box
}

body {
  margin: 0
}

button,
input,
textarea {
  font: inherit
}

button {
  cursor: pointer
}

.app-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 75% 85%, #e9e2d6 0, transparent 35%), var(--paper)
}

.topbar {
  height: 70px;
  padding: 0 35px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line);
  background: #f4f1ebd9
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 800;
  font-size: 17px;
  letter-spacing: -.5px;
  cursor: pointer;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  color: #fff;
  background: var(--orange);
  font-family: Georgia, serif
}

.muted {
  color: #aeaca5
}

.topbar-meta {
  margin-left: auto;
  margin-right: 25px;
  color: var(--muted);
  font: 11px 'DM Mono', monospace;
  text-transform: uppercase;
  letter-spacing: .5px
}

.topbar-meta input {
  margin-left: 7px;
  padding: 5px 8px;
  border: 1px solid #cecac0;
  border-radius: 3px;
  outline-color: var(--orange);
  color: var(--ink);
  background: #faf8f3;
  font-size: 11px
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 7px;
  border-radius: 50%;
  background: #6eae7e
}

.avatar {
  border: 0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: #d7d8cc;
  color: #5d6555;
  font-weight: 700
}

.app-layout {
  display: grid;
  grid-template-columns: 286px minmax(0, 1fr);
  min-height: calc(100vh - 70px)
}

.sidebar {
  border-right: 1px solid var(--line);
  padding: 35px 20px 20px;
  display: flex;
  flex-direction: column
}

.sidebar-heading {
  display: flex;
  justify-content: space-between;
  margin: 0 14px 16px;
  color: var(--muted);
  font: 11px 'DM Mono', monospace;
  text-transform: uppercase;
  letter-spacing: .6px
}

.new-agent {
  margin-bottom: 20px;
  padding: 11px 14px;
  border: 1px solid #c8c5bc;
  border-radius: 4px;
  color: var(--ink);
  background: transparent;
  text-align: left;
  font-weight: 700
}

.new-agent span {
  margin-right: 8px;
  color: var(--orange);
  font-size: 20px
}

.delete-agent {
  margin-top: 50px;
  margin-bottom: 20px;
  padding: 8px 10px;
  border: 1px solid #c8c5bc;
  border-radius: 4px;
  color: var(--ink);
  background: transparent;
  text-align: left;
  font-weight: 700;
  font-size: 12px;
}

.delete-agent span {
  margin-right: 8px;
  color: var(--orange);
  font-size: 12px;
}

.agent-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 12px 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  text-align: left;
  color: var(--ink)
}

.agent-row.active {
  background: #e7e3da
}

.agent-icon {
  flex: 0 0 29px;
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  border-radius: 4px;
  background: #d9ded0;
  color: #58624f;
  font-size: 12px;
  font-weight: 800
}

.agent-row-copy {
  min-width: 0;
  display: grid;
  gap: 3px
}

.agent-row strong,
.agent-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.agent-row strong {
  font-size: 13px
}

.agent-row small {
  color: var(--muted);
  font-size: 11px
}

.chevron {
  margin-left: auto;
  color: var(--orange);
  font-size: 20px
}

.empty-state {
  padding: 12px 14px;
  color: var(--muted);
  font-size: 12px
}

.sidebar-footer {
  margin-top: auto;
  padding: 20px 12px 4px;
  color: var(--muted);
  font-size: 11px
}

.sidebar-footer span {
  float: right
}

.main-content {
  position: relative;
  max-width: 1000px;
  width: 100%;
  margin: auto;
  padding: 72px 8%
}

.eyebrow {
  display: block;
  color: var(--orange);
  font: 10px 'DM Mono', monospace;
  letter-spacing: 1.7px
}

.welcome-panel {
  max-width: 560px;
  margin: 7vh auto
}

.welcome-panel h1 {
  margin: 18px 0 20px;
  font-size: clamp(44px, 6vw, 78px);
  line-height: .98;
  letter-spacing: -4px
}

.welcome-panel h1 em {
  color: var(--orange);
  font-family: Georgia, serif;
  font-weight: 400
}

.welcome-panel p {
  max-width: 430px;
  color: var(--muted);
  line-height: 1.7
}

.primary-button,
.secondary-button,
.danger-button {
  border-radius: 3px;
  padding: 12px 17px;
  font-weight: 700
}

.primary-button {
  border: 0;
  color: #fff;
  background: var(--orange)
}

.primary-button span {
  margin-left: 18px;
  font-size: 18px
}

.welcome-panel .primary-button {
  margin-top: 22px
}

.agent-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px
}

.agent-header h1 {
  margin: 11px 0 7px;
  font-size: clamp(32px, 4vw, 48px);
  letter-spacing: -2px
}

.agent-header p {
  margin: 0;
  color: var(--muted);
  font-size: 14px
}

.header-actions {
  display: flex;
  gap: 8px
}

.secondary-button {
  border: 1px solid #c8c5bc;
  color: var(--ink);
  background: transparent
}

.danger-button {
  border: 1px solid #ddc9c0;
  color: #ad573b;
  background: transparent;
  font-size: 18px
}

.tabs {
  display: flex;
  gap: 28px;
  margin-top: 62px;
  border-bottom: 1px solid var(--line)
}

.tabs button {
  position: relative;
  padding: 0 0 13px;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-weight: 700
}

.tabs button.active {
  color: var(--ink)
}

.tabs button.active:after {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--orange);
  content: ''
}

.tabs span {
  margin-left: 5px;
  color: #aaa79e;
  font: 10px 'DM Mono', monospace
}

.chat-panel {
  min-height: 440px;
  display: flex;
  flex-direction: column
}

.chat-empty {
  margin: auto;
  text-align: center
}

.spark {
  color: var(--orange);
  font-size: 31px
}

.chat-empty h2 {
  margin: 12px 0 8px;
  font-size: 19px
}

.chat-empty p {
  color: var(--muted);
  font-size: 13px
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px;
  margin-top: 28px
}

.suggestions button {
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 30px;
  color: var(--muted);
  background: transparent;
  font-size: 11px
}

.messages {
  flex: 1;
  display: grid;
  align-content: end;
  gap: 22px;
  padding: 30px 0
}

.message {
  max-width: 78%
}

.message.user {
  justify-self: end;
  text-align: right
}

.message-label {
  color: var(--orange);
  font: 9px 'DM Mono', monospace;
  letter-spacing: 1px
}

.message p {
  margin: 6px 0 0;
  line-height: 1.6;
  white-space: pre-wrap
}

.message .markdown-content {
  margin-top: 6px;
  line-height: 1.6
}

.markdown-content :first-child {
  margin-top: 0
}

.markdown-content :last-child {
  margin-bottom: 0
}

.markdown-content pre {
  overflow-x: auto;
  padding: 10px;
  background: #efede7
}

.markdown-content code {
  font-family: 'DM Mono', monospace;
  font-size: .9em
}

.message.user p {
  display: inline-block;
  padding: 10px 14px;
  border-radius: 12px 12px 2px 12px;
  background: #e6e1d7;
  text-align: left
}

.typing {
  color: var(--muted);
  font-size: 12px
}

.composer {
  display: flex;
  gap: 10px;
  align-items: end;
  padding: 11px 12px 11px 16px;
  border: 1px solid #c8c5bc;
  border-radius: 5px;
  background: #ffffff4d
}

.composer textarea {
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  color: var(--ink);
  background: transparent;
  font-size: 13px
}

.send-button {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 3px;
  color: #fff;
  background: var(--orange);
  font-size: 20px
}

.send-button:disabled {
  opacity: .4
}

.disclaimer {
  display: block;
  margin-top: 10px;
  color: #4e3b00;
  text-align: center
}

.knowledge-panel {
  padding-top: 36px
}

.section-intro h2 {
  margin: 12px 0 8px;
  font-size: 25px
}

.section-intro p {
  color: var(--muted);
  font-size: 13px
}

.source-list {
  margin-top: 35px;
  border-top: 1px solid var(--line)
}

.source-item {
  display: flex;
  gap: 25px;
  padding: 17px 5px;
  border-bottom: 1px solid var(--line);
  font-size: 13px
}

.source-number {
  color: var(--orange);
  font: 10px 'DM Mono', monospace
}

.source-empty {
  margin-top: 35px;
  color: var(--muted);
  font-size: 13px
}

.source-empty button {
  padding: 0;
  border: 0;
  color: var(--orange);
  background: transparent;
  text-decoration: underline
}

.toast,
.error-banner {
  position: fixed;
  right: 25px;
  bottom: 25px;
  padding: 12px 16px;
  border-radius: 3px;
  color: #fff;
  background: var(--dark);
  font-size: 12px
}

.error-banner {
  bottom: 72px;
  background: #9e402e
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #20201e6b
}

.editor-modal {
  width: min(560px, 100%);
  padding: 32px;
  border-radius: 5px;
  background: var(--paper);
  box-shadow: 0 20px 60px #20201e33
}

.modal-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px
}

.modal-heading h2 {
  margin: 10px 0 0;
  font-size: 25px;
  letter-spacing: -1px
}

.close-button {
  align-self: start;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-size: 25px
}

.editor-modal label {
  display: block;
  margin-top: 18px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700
}

.label-hint {
  float: right;
  color: #aaa79e;
  font-weight: 400
}

.editor-modal input,
.editor-modal textarea {
  display: block;
  width: 100%;
  margin-top: 7px;
  padding: 11px;
  resize: vertical;
  border: 1px solid #cecac0;
  border-radius: 3px;
  outline-color: var(--orange);
  color: var(--ink);
  background: #faf8f3;
  font-size: 13px
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 28px
}

@media(max-width:700px) {
  .topbar {
    padding: 0 18px
  }

  .topbar-meta {
    display: none
  }

  .app-layout {
    display: block
  }

  .sidebar {
    min-height: auto;
    padding: 20px 15px 14px;
    border-right: 0;
    border-bottom: 1px solid var(--line)
  }

  .sidebar-footer {
    display: none
  }

  .sidebar-heading {
    margin-top: 0
  }

  .agent-row.active {
    display: flex
  }

  .new-agent {
    margin-bottom: 8px
  }

  .main-content {
    padding: 42px 20px
  }

  .agent-header {
    display: block
  }

  .header-actions {
    margin-top: 22px
  }

  .tabs {
    margin-top: 40px
  }

  .welcome-panel {
    margin: 5vh 0
  }

  .welcome-panel h1 {
    letter-spacing: -2px
  }

  .editor-modal {
    padding: 24px
  }
}
</style>
