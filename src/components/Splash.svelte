<script lang="ts">
  let label = $state('読み込み中…')
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
  <span class="text-6xl">✳️</span>
  <div class="text-center">
    <h1 class="text-xl font-bold text-slate-800">Kankei</h1>
    <p class="mt-1 text-sm text-slate-400">ご近所・日常生活向けグラフメモ</p>
  </div>
  <div class="mt-2 flex items-center gap-2 text-xs text-slate-400">
    <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500"></span>
    {label}
  </div>
</div>
