<script lang="ts">
  import { authLoading, session, signIn, signInWithGoogle, signUp } from '../lib/auth'

  let mode = $state<'login' | 'signup'>('login')
  let email = $state('')
  let password = $state('')
  let error = $state('')
  let submitting = $state(false)
  let info = $state('')

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    error = ''
    info = ''
    submitting = true
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        info = '確認メールを送信しました。メールからログインしてください。'
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'エラーが発生しました'
    } finally {
      submitting = false
    }
  }

  async function google() {
    error = ''
    info = ''
    try {
      await signInWithGoogle()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Google ログインに失敗しました'
    }
  }
</script>

{#if $authLoading}
  <div class="flex min-h-screen items-center justify-center text-slate-400">
    読み込み中…
  </div>
{:else}
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <p class="text-3xl">🏷️</p>
        <h1 class="mt-2 text-xl font-bold text-slate-900">Kankei</h1>
        <p class="text-sm text-slate-500">ご近所・日常のグラフ型メモ</p>
      </div>

      <form
        onsubmit={submit}
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <button
          type="button"
          onclick={google}
          class="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <span aria-hidden="true">G</span>
          Google でログイン
        </button>

        <div class="mb-4 flex items-center gap-3 text-xs text-slate-400">
          <span class="h-px flex-1 bg-slate-200"></span>
          またはメールアドレスで
          <span class="h-px flex-1 bg-slate-200"></span>
        </div>

        <div class="mb-4 flex rounded-lg bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onclick={() => {
              mode = 'login'
              error = ''
            }}
            class="flex-1 rounded-md py-1.5 font-medium {mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}"
          >
            ログイン
          </button>
          <button
            type="button"
            onclick={() => {
              mode = 'signup'
              error = ''
            }}
            class="flex-1 rounded-md py-1.5 font-medium {mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}"
          >
            新規登録
          </button>
        </div>

        <label class="mb-1 block text-xs font-medium text-slate-500" for="auth-email">メールアドレス</label>
        <input
          type="email"
          id="auth-email"
          required
          bind:value={email}
          autocomplete="email"
          class="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        />

        <label class="mb-1 block text-xs font-medium text-slate-500" for="auth-password">パスワード</label>
        <input
          type="password"
          id="auth-password"
          required
          bind:value={password}
          autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
          class="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        />

        {#if error}
          <p class="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        {/if}
        {#if info}
          <p class="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>
        {/if}

        <button
          type="submit"
          disabled={submitting}
          class="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? '処理中…' : mode === 'login' ? 'ログイン' : '登録する'}
        </button>
      </form>
    </div>
  </div>
{/if}
