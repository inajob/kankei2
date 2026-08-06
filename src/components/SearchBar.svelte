<script lang="ts">
  import NodeAutocomplete from './NodeAutocomplete.svelte'
  import { createNode, currentNodeId } from '../lib/stores'
  import type { Node } from '../lib/types'

  let { value = $bindable('') } = $props()

  async function go(node: Node) {
    currentNodeId.set(node.id)
  }

  async function createNew(name: string) {
    const n = await createNode(name)
    currentNodeId.set(n.id)
  }
</script>

<div class="relative flex-1">
  <NodeAutocomplete
    placeholder="ノードを検索 … Enter で新規作成"
    onSelect={go}
    onCreate={createNew}
    autofocus
    bind:value
  />
</div>
