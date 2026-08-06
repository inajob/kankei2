<script lang="ts">
  import NodeAutocomplete from './NodeAutocomplete.svelte'
  import { connect, createNode, currentNodeId } from '../lib/stores'
  import type { Node } from '../lib/types'

  let message = $state('')
  let isSameAs = $state(false)

  function flash(text: string) {
    message = text
    window.setTimeout(() => (message = ''), 2500)
  }

  async function connectExisting(node: Node) {
    const cur = $currentNodeId
    if (!cur) return
    const edge = await connect(cur, node.id, { is_same_as: isSameAs })
    if (isSameAs) {
      flash(
        edge
          ? `「${node.name}」と同一視しました`
          : `「${node.name}」とは既に接続されています`,
      )
    } else {
      flash(edge ? `「${node.name}」に接続しました` : `「${node.name}」とは既に接続済みです`)
    }
    isSameAs = false
  }

  async function createAndConnect(name: string) {
    const cur = $currentNodeId
    if (!cur) return
    const n = await createNode(name)
    await connect(cur, n.id, { is_same_as: isSameAs })
    flash(
      isSameAs
        ? `「${name}」を作成して同一視しました`
        : `「${name}」を作成して接続しました`,
    )
    isSameAs = false
  }
</script>

<section class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
  <h2 class="mb-2 text-sm font-semibold text-slate-600">クイック追加</h2>
  <NodeAutocomplete
    placeholder="接続するノードを入力 or 新規作成"
    onSelect={connectExisting}
    onCreate={createAndConnect}
  />
  <label class="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
    <input type="checkbox" bind:checked={isSameAs} class="h-4 w-4 accent-amber-500" />
    同一視する（SameAs）— 同じものとして統合
  </label>
  {#if message}
    <p class="mt-2 text-sm text-emerald-700">{message}</p>
  {/if}
</section>
