<script lang="ts">
  import { nodeIcon } from '../lib/parser'
  import { currentNodeId, recentNodes } from '../lib/stores'

  let recent = $derived($recentNodes.slice(0, 30))

  function formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return 'たった今'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}分前`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}時間前`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}日前`
    return new Date(iso).toLocaleDateString('ja-JP')
  }

  function navigate(id: string) {
    currentNodeId.set(id)
  }
</script>

<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold text-slate-600">最近の更新</h2>
    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
      {recent.length} 件
    </span>
  </div>

  {#if recent.length === 0}
    <p class="py-6 text-center text-sm text-slate-400">まだノードがありません。</p>
  {:else}
    <ul class="divide-y divide-slate-100">
      {#each recent as node (node.id)}
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
            <span class="shrink-0 text-xs text-slate-400">
              {formatRelative(node.updated_at)}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>
