<script lang="ts">
  import { nodeIcon } from '../lib/parser'
  import {
    currentNodeId,
    disconnect,
    hasTimeline,
    orderedConnections,
  } from '../lib/stores'

  let conns = $derived($orderedConnections)
  let timeline = $derived($hasTimeline)

  function navigate(id: string) {
    currentNodeId.set(id)
  }

  async function detach(edgeId: string, name: string) {
    if (window.confirm(`「${name}」との接続を外しますか？`)) {
      await disconnect(edgeId)
    }
  }
</script>

<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold text-slate-600">
      接続 ({conns.length})
    </h2>
    {#if timeline}
      <span class="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600">
        🕐 タイムライン順
      </span>
    {:else}
      <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        🏷️ ハブ順（接続数）
      </span>
    {/if}
  </div>

  {#if conns.length === 0}
    <p class="py-6 text-center text-sm text-slate-400">
      まだ接続がありません。下のフォームから追加しましょう。
    </p>
  {:else}
    <ul class="divide-y divide-slate-100">
      {#each conns as c (c.edgeId)}
        <li>
          <div class="group flex items-center gap-3 py-2.5">
            <button
              type="button"
              onclick={() => navigate(c.node.id)}
              class="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span class="text-xl">{nodeIcon(c.node.type)}</span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="truncate font-medium text-slate-800">{c.node.name}</span>
                  {#if c.node.type === 'time'}
                    <span class="shrink-0 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-600">
                      {c.node.name}
                    </span>
                  {/if}
                  {#if c.viaSameAs}
                    <span
                      class="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-600"
                    >
                      ({c.viaSameAs.name} 経由)
                    </span>
                  {/if}
                </span>
                {#if c.node.context_note}
                  <span class="block truncate text-xs text-slate-400">
                    {c.node.context_note}
                  </span>
                {/if}
              </span>
              <span class="shrink-0 text-xs text-slate-300">
                接続 {c.degree}
              </span>
            </button>
            <button
              type="button"
              onclick={() => detach(c.edgeId, c.node.name)}
              title="接続を外す"
              class="shrink-0 rounded p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
            >
              ✕
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
