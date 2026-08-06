<script lang="ts">
  import { detectNodeType, nodeIcon } from '../lib/parser'
  import {
    adjacentDate,
    createNode,
    currentNode,
    currentNodeId,
    deleteNode,
    disconnect,
    sameAsNodes,
    updateNodeMeta,
  } from '../lib/stores'

  let current = $derived($currentNode)
  let sameAs = $derived($sameAsNodes)
  let editingName = $state(false)
  let nameDraft = $state('')
  let editingNote = $state(false)
  let noteDraft = $state('')
  let feedback = $state('')
  let nameInputEl = $state<HTMLInputElement>()
  let noteInputEl = $state<HTMLInputElement>()

  $effect(() => {
    if (editingName) nameInputEl?.focus()
  })

  $effect(() => {
    if (editingNote) noteInputEl?.focus()
  })

  function startEditName() {
    nameDraft = current?.name ?? ''
    editingName = true
  }

  async function saveName() {
    if (!current) return
    const name = nameDraft.trim()
    if (!name) return
    await updateNodeMeta(current.id, { name, type: detectNodeType(name) })
    editingName = false
  }

  function startEditNote() {
    noteDraft = current?.context_note ?? ''
    editingNote = true
  }

  async function saveNote() {
    if (!current) return
    await updateNodeMeta(current.id, { context_note: noteDraft.trim() || null })
    editingNote = false
  }

  async function goAdjacent(offset: 1 | -1) {
    const target = adjacentDate(offset)
    if (!target) return
    if (/^\d{4}-\d{2}-\d{2}$/.test(target)) {
      const n = await createNode(target)
      currentNodeId.set(n.id)
    } else {
      currentNodeId.set(target)
    }
  }

  async function undo(edgeId: string, name: string) {
    const ok = window.confirm(`「${name}」との統合（同一視）を解除しますか？`)
    if (!ok) return
    await disconnect(edgeId)
    feedback = `「${name}」との統合を解除しました`
    window.setTimeout(() => (feedback = ''), 2500)
  }

  async function remove() {
    if (!current) return
    const ok = window.confirm(
      `「${current.name}」を削除しますか？\nこのノードへの接続（エッジ）もすべて削除されます。`,
    )
    if (!ok) return
    await deleteNode(current.id)
  }

  function onNameKey(e: KeyboardEvent) {
    if (e.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      saveName()
    } else if (e.key === 'Escape') {
      editingName = false
    }
  }

  function onNoteKey(e: KeyboardEvent) {
    if (e.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      saveNote()
    } else if (e.key === 'Escape') {
      editingNote = false
    }
  }
</script>

{#if current}
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    {#if current.type === 'date_day'}
      <div class="mb-3 flex items-center justify-between">
        <button
          type="button"
          onclick={() => goAdjacent(-1)}
          class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ＜ 前日
        </button>
        <button
          type="button"
          onclick={() => goAdjacent(1)}
          class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          翌日 ＞
        </button>
      </div>
    {/if}

    <div class="flex items-start gap-3">
      <span class="mt-0.5 text-3xl">{nodeIcon(current.type)}</span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          {#if editingName}
            <div class="flex items-center gap-2">
              <input
                type="text"
                bind:value={nameDraft}
                bind:this={nameInputEl}
                onkeydown={onNameKey}
                placeholder="ノード名"
                class="rounded-lg border border-slate-300 px-2 py-1 text-xl font-bold text-slate-900 outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onclick={saveName}
                class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
              >
                保存
              </button>
              <button
                type="button"
                onclick={() => (editingName = false)}
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600"
              >
                キャンセル
              </button>
            </div>
          {:else}
            <button
              type="button"
              onclick={startEditName}
              title="クリックして名前を編集"
              class="break-words text-left text-xl font-bold text-slate-900 hover:text-indigo-600 hover:underline"
            >
              {current.name}
            </button>
          {/if}
          {#if current.type !== 'entity'}
            <span
              class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600"
            >
              {current.type}
            </span>
          {/if}
        </div>

        <div class="mt-1.5 text-sm text-slate-500">
          {#if editingNote}
            <div class="flex items-center gap-2">
              <input
                type="text"
                bind:value={noteDraft}
                bind:this={noteInputEl}
                onkeydown={onNoteKey}
                placeholder="識別用の一言メモ（例: 向かいの家）"
                class="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onclick={saveNote}
                class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
              >
                保存
              </button>
              <button
                type="button"
                onclick={() => (editingNote = false)}
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600"
              >
                キャンセル
              </button>
            </div>
          {:else}
            <button
              type="button"
              onclick={startEditNote}
              title="クリックして編集"
              class="text-left hover:text-indigo-600 hover:underline {current.context_note ? '' : 'text-slate-300'}"
            >
              {current.context_note || 'コンテキストメモを追加'}
            </button>
          {/if}
        </div>
      </div>

      <button
        type="button"
        onclick={remove}
        title="ノードを削除"
        class="shrink-0 self-start rounded-lg p-1.5 text-sm text-slate-300 hover:bg-rose-50 hover:text-rose-500"
      >
        🗑
      </button>
    </div>

    {#if sameAs.length > 0}
      <div class="mt-3 border-t border-slate-100 pt-3">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          同一視（SameAs）
        </p>
        <ul class="flex flex-wrap gap-2">
          {#each sameAs as s (s.edgeId)}
            <li class="flex items-center gap-1 rounded-full bg-amber-50 py-1 pl-1 pr-2 text-sm text-amber-800">
              <button
                type="button"
                onclick={() => currentNodeId.set(s.node.id)}
                title="このノードを開く"
                class="rounded-full px-2 py-0.5 hover:bg-amber-100 hover:underline"
              >
                {s.node.name}
              </button>
              <button
                type="button"
                onclick={() => undo(s.edgeId, s.node.name)}
                title="統合を解除"
                class="text-amber-400 hover:text-amber-700"
              >
                ✕
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if feedback}
      <p class="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {feedback}
      </p>
    {/if}
  </section>
{/if}
