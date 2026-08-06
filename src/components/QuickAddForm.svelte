<script lang="ts">
  import NodeAutocomplete from './NodeAutocomplete.svelte'
  import { connect, createNode, currentNodeId } from '../lib/stores'
  import type { Node } from '../lib/types'

  let message = $state('')

  function flash(text: string) {
    message = text
    window.setTimeout(() => (message = ''), 2500)
  }

  async function connectExisting(node: Node) {
    const cur = $currentNodeId
    if (!cur) return
    const edge = await connect(cur, node.id)
    flash(edge ? `「${node.name}」に接続しました` : `「${node.name}」とは既に接続済みです`)
  }

  async function createAndConnect(name: string) {
    const cur = $currentNodeId
    if (!cur) return
    const n = await createNode(name)
    await connect(cur, n.id)
    flash(`「${name}」を作成して接続しました`)
  }
</script>

<section class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
  <h2 class="mb-2 text-sm font-semibold text-slate-600">クイック追加</h2>
  <NodeAutocomplete
    placeholder="接続するノードを入力 or 新規作成"
    onSelect={connectExisting}
    onCreate={createAndConnect}
  />
  {#if message}
    <p class="mt-2 text-sm text-emerald-700">{message}</p>
  {/if}
</section>
