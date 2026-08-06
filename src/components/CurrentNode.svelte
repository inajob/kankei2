<script lang="ts">
  import NodeAutocomplete from './NodeAutocomplete.svelte'
  import { detectNodeType, nodeIcon } from '../lib/parser'
  import {
    adjacentDate,
    connect,
    createNode,
    currentNode,
    currentNodeId,
    deleteNode,
    disconnect,
    sameAsNodes,
    updateNodeMeta,
  } from '../lib/stores'
  import type { Node } from '../lib/types'

  let current = $derived($currentNode)
  let sameAs = $derived($sameAsNodes)
  let editingName = $state(false)
  let nameDraft = $state('')
  let editingNote = $state(false)
  let noteDraft = $state('')
  let merging = $state(false)
  let feedback = $state('')

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

  async function sameAsTo(node: Node) {
    if (!current) return
    await connect(current.id, node.id, { is_same_as: true })
    merging = false
    feedback = `「${node.name}」と同一視しました`
    window.setTimeout(() => (feedback = ''), 2500)
  }

  async function sameAsCreate(name: string) {
    if (!current) return
    const n = await createNode(name)
    await sameAsTo(n)
  }

  async function undo(edgeId: string, name: string) {
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
      <span class="text-3xl">{nodeIcon(current.type)}</span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          {#if editingName}
            <div class="flex items-center gap-2">
              <input
                type="text"
                bind:value={nameDraft}
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
            <h1 class="truncate text-xl font-bold text-slate-900">{current.name}</h1>
            <button
              type="button"
              onclick={startEditName}
              title="名前を変更"
              class="text-xs text-indigo-500 hover:underline"
            >
              変更
            </button>
          {/if}
          <span
            class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600"
          >
            {current.type}
          </span>
        </div>
        <div class="mt-2 text-sm text-slate-500">
          {#if editingNote}
            <div class="flex items-center gap-2">
              <input
                type="text"
                bind:value={noteDraft}
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
            <div class="flex items-center gap-2">
              <span class={current.context_note ? '' : 'text-slate-300'}>
                {current.context_note || 'コンテキストメモなし'}
              </span>
              <button
                type="button"
                onclick={startEditNote}
                class="text-xs text-indigo-500 hover:underline"
              >
                編集
              </button>
            </div>
          {/if}
        </div>
      </div>
      <button
        type="button"
        onclick={remove}
        title="ノードを削除"
        class="shrink-0 rounded-lg border border-rose-200 px-2.5 py-1.5 text-sm text-rose-500 hover:bg-rose-50"
      >
        削除
      </button>
    </div>

    {#if sameAs.length > 0}
      <div class="mt-4 border-t border-slate-100 pt-3">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          同一視（SameAs）
        </p>
        <ul class="flex flex-wrap gap-2">
          {#each sameAs as s (s.edgeId)}
            <li class="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm text-amber-800">
              <span>{s.node.name}</span>
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

    <div class="mt-4 flex items-center gap-2">
      {#if merging}
        <div class="flex-1">
          <NodeAutocomplete
            placeholder="統合したいノードを選択 or 新規作成"
            onSelect={sameAsTo}
            onCreate={sameAsCreate}
            autofocus
          />
        </div>
      {:else}
        <button
          type="button"
          onclick={() => (merging = true)}
          class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100"
        >
          同じものとして統合（SameAs）
        </button>
      {/if}
    </div>

    {#if feedback}
      <p class="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {feedback}
      </p>
    {/if}
  </section>
{/if}
