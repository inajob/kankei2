<script lang="ts">
  import { searchLocal, nodeContextNames } from '../lib/stores'
  import { nodeIcon } from '../lib/parser'
  import type { Node } from '../lib/types'

  let {
    placeholder = 'ノード名を入力',
    onSelect = (_node: Node) => {},
    onCreate = (_name: string) => {},
    autofocus = false,
    value = $bindable(''),
  } = $props()

  let open = $state(false)
  let highlight = $state(0)
  let inputEl = $state<HTMLInputElement>()
  let container = $state<HTMLElement>()

  const suggestions = $derived(value.trim() ? searchLocal(value).slice(0, 8) : [])

  $effect(() => {
    if (open) highlight = suggestions.length
  })

  function close() {
    open = false
  }

  function pick(node: Node) {
    close()
    value = ''
    onSelect(node)
  }

  function create() {
    const name = value.trim()
    if (!name) return
    close()
    value = ''
    onCreate(name)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.isComposing) return
    const total = suggestions.length + 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      open = true
      highlight = (highlight + 1) % total
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      open = true
      highlight = (highlight - 1 + total) % total
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight < suggestions.length) {
        pick(suggestions[highlight])
      } else {
        create()
      }
    } else if (e.key === 'Escape') {
      close()
    }
  }

  $effect(() => {
    function onDocClick(ev: MouseEvent) {
      if (container && !container.contains(ev.target as HTMLElement)) close()
    }
    window.addEventListener('mousedown', onDocClick)
    return () => window.removeEventListener('mousedown', onDocClick)
  })

  $effect(() => {
    if (autofocus) inputEl?.focus()
  })
</script>

<div class="relative" bind:this={container}>
  <input
    type="text"
    bind:value={value}
    bind:this={inputEl}
    oninput={() => (open = true)}
    onkeydown={onKeydown}
    onfocus={() => (open = true)}
    placeholder={placeholder}
    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
  />

  {#if open && value.trim()}
    <ul
      class="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
    >
      {#each suggestions as node, i (node.id)}
        <li>
          <button
            type="button"
            onclick={() => pick(node)}
            onmouseenter={() => (highlight = i)}
            class="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-indigo-50 {highlight === i ? 'bg-indigo-50' : ''}"
          >
            <span class="flex items-center gap-1.5">
              <span>{nodeIcon(node.type)}</span>
              <span class="font-medium text-slate-800">{node.name}</span>
            </span>
            {#if nodeContextNames(node.id).length > 0}
              <span class="pl-6 text-xs text-slate-400">
                ({nodeContextNames(node.id).join(', ')})
              </span>
            {/if}
          </button>
        </li>
      {/each}
      <li>
        <button
          type="button"
          onclick={create}
          onmouseenter={() => (highlight = suggestions.length)}
          class="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm hover:bg-indigo-50 {highlight === suggestions.length ? 'bg-indigo-50' : ''}"
        >
          <span class="text-indigo-500">＋</span>
          <span class="text-indigo-600">「{value.trim()}」を新規作成</span>
        </button>
      </li>
    </ul>
  {/if}
</div>
