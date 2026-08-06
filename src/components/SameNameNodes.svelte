<script lang="ts">
  import { nodeIcon } from '../lib/parser'
  import { currentNodeId, sameNameGroups } from '../lib/stores'
  import type { Node } from '../lib/types'

  let groups = $derived($sameNameGroups)

  function navigate(id: string) {
    currentNodeId.set(id)
  }
</script>

{#if groups.length > 0}
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-600">同名のノード ({groups.length})</h2>
      <span class="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
        統合候補
      </span>
    </div>

    <div class="flex flex-col gap-4">
      {#each groups as g (g.node.id)}
        <div class="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
          <button
            type="button"
            onclick={() => navigate(g.node.id)}
            class="flex items-center gap-2 text-left"
          >
            <span>{nodeIcon(g.node.type)}</span>
            <span class="font-medium text-slate-800">{g.node.name}</span>
            {#if g.node.context_note}
              <span class="truncate text-xs text-slate-400">{g.node.context_note}</span>
            {/if}
          </button>

          {#if g.connections.length > 0}
            <ul class="mt-2 divide-y divide-slate-100">
              {#each g.connections as c (c.edgeId)}
                <li>
                  <button
                    type="button"
                    onclick={() => navigate(c.node.id)}
                    class="flex w-full items-center gap-2 py-1.5 text-left text-sm"
                  >
                    <span>{nodeIcon(c.node.type)}</span>
                    <span class="min-w-0 flex-1 truncate text-slate-700">
                      {c.node.name}
                    </span>
                    {#if c.viaSameAs}
                      <span
                        class="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-600"
                      >
                        ({c.viaSameAs.name} 経由)
                      </span>
                    {/if}
                  </button>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="mt-2 text-xs text-slate-400">接続なし</p>
          {/if}
        </div>
      {/each}
    </div>
  </section>
{/if}
