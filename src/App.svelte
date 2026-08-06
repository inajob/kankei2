<script lang="ts">
  import Auth from './components/Auth.svelte'
  import SearchBar from './components/SearchBar.svelte'
  import CurrentNode from './components/CurrentNode.svelte'
  import QuickAddForm from './components/QuickAddForm.svelte'
  import ConnectedNodeList from './components/ConnectedNodeList.svelte'
  import RecentNodes from './components/RecentNodes.svelte'
  import SearchResults from './components/SearchResults.svelte'
  import SameNameNodes from './components/SameNameNodes.svelte'
  import Splash from './components/Splash.svelte'
  import { allowed, authLoading, checkAllowed, session, signOut } from './lib/auth'
  import { clearGraph, currentNodeId, loadGraph, loading, searchLocal } from './lib/stores'

  let loggedIn = $derived($session !== null)
  let searchQuery = $state('')
  let searchResults = $derived(
    searchQuery.trim() ? searchLocal(searchQuery.trim()) : [],
  )
  let hasCurrent = $derived($currentNodeId !== null)

  $effect(() => {
    if (loggedIn) {
      checkAllowed()
      loadGraph()
    } else {
      allowed.set(null)
      clearGraph()
    }
  })

  $effect(() => {
    if ($currentNodeId !== null) searchQuery = ''
  })

  function goHome() {
    searchQuery = ''
    currentNodeId.set(null)
  }
</script>

{#if $authLoading || $loading || (loggedIn && $allowed === null)}
  <Splash />
{:else if !loggedIn}
  <Auth />
{:else if $allowed === false}
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p class="text-4xl">🔒</p>
      <h1 class="mt-3 text-lg font-bold text-slate-900">利用が許可されていません</h1>
      <p class="mt-2 text-sm text-slate-500">
        このアプリは事前に許可されたアカウントのみ利用できます。<br />
        管理者にメールアドレスの登録を依頼してください。
      </p>
      <button
        type="button"
        onclick={signOut}
        class="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        ログアウト
      </button>
    </div>
  </div>
{:else}
  <div class="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-10">
    <header class="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={goHome}
          title="ホーム"
          class="shrink-0 rounded-lg p-1 text-xl hover:bg-slate-100"
        >
          ✳️
        </button>
        <SearchBar bind:value={searchQuery} />
        <div class="flex shrink-0 items-center gap-2">
          <span class="hidden text-xs text-slate-400 sm:block">
            {$session?.user.email}
          </span>
          <button
            type="button"
            onclick={signOut}
            class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>

    <main class="mt-4 flex flex-col gap-4">
      {#if searchQuery.trim()}
        <SearchResults nodes={searchResults} />
      {:else if !hasCurrent}
        <RecentNodes />
      {:else}
        <CurrentNode />
        <QuickAddForm />
        <ConnectedNodeList />
        <SameNameNodes />
      {/if}
    </main>
  </div>
{/if}
