<script lang="ts">
  import { nodeIcon } from '../lib/parser'
  import { currentNodeId } from '../lib/stores'
  import type { Node } from '../lib/types'

  let { nodes = [] as Node[] } = $props()

  function navigate(id: string) {
    currentNodeId.set(id)
  }
</script>

<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold text-slate-600">検索結果</h2>
    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
      {nodes.length} 件
    </span>
  </div>

  {#if nodes.length === 0}
    <p class="py-6 text-center text-sm text-slate-400">一致するノードがありません。</p>
  {:else}
    <ul class="divide-y divide-slate-100">
      {#each nodes as node (node.id)}
        <li>
          <button
            type="button"
            onclick={() => navigate(node.id)}
            class="flex w-full items-center gap-3 py-2.5 text-left"
          >
            <span class="text-xl">{nodeIcon(node.type)}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-slate-800">{node.name}</span>
              {#if node.context_note}
                <span class="block truncate text-xs text-slate-400">
                  {node.context_note}
                </span>
              {/if}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>
