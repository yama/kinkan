<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>カジュアル勤怠</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/alpinejs" defer></script>
</head>
<body class="bg-gray-100 min-h-screen text-gray-800">
  <div class="max-w-md mx-auto py-6 px-4" x-data="attendanceApp()">
    <!-- ヘッダー -->
    <h1 class="text-2xl font-bold text-center mb-4">🕒 カジュアル勤怠</h1>

    <!-- ユーザー情報と日付 -->
    <div class="bg-white rounded-xl shadow p-4 mb-4">
      <p class="text-sm">👤 ユーザー名: 山本さん</p>
      <p class="text-sm">📅 本日: <span x-text="today"></span></p>
    </div>

    <!-- 打刻ボタン -->
    <div class="flex justify-between gap-4 mb-4">
      <button class="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl" @click="clockIn">🟢 出勤</button>
      <button class="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl" @click="clockOut">🔴 退勤</button>
    </div>

    <!-- 最後の打刻 -->
    <div class="bg-white rounded-xl shadow p-4 text-sm mb-4">
      最後の打刻: <span x-text="lastAction"></span>
    </div>

    <!-- メニューリンク -->
    <div class="grid grid-cols-2 gap-4">
      <button class="bg-white rounded-xl shadow p-4 text-center" @click="showLog = !showLog">📄 勤怠ログ</button>
      <button class="bg-white rounded-xl shadow p-4 text-center" @click="showMemo = !showMemo">📝 所感を書く</button>
    </div>

    <!-- 勤怠ログ -->
    <div class="mt-6" x-show="showLog">
      <h2 class="font-bold mb-2">📄 勤怠ログ一覧</h2>
      <template x-for="item in logs" :key="item.date">
        <div class="bg-white rounded-xl shadow p-4 mb-2 text-sm">
          <div><strong x-text="item.date"></strong> 出勤: <span x-text="item.in"></span> / 退勤: <span x-text="item.out"></span></div>
          <div x-show="item.memo">🌱 <span x-text="item.memo"></span></div>
        </div>
      </template>
    </div>

    <!-- 所感入力 -->
    <div class="mt-6" x-show="showMemo">
      <h2 class="font-bold mb-2">📝 今日の所感</h2>
      <textarea class="w-full p-2 border rounded mb-2" rows="3" x-model="memoText"></textarea>
      <button class="w-full py-2 bg-blue-500 text-white rounded-xl" @click="saveMemo">💾 登録する</button>
    </div>
  </div>

  <script>
    function attendanceApp() {
      return {
        today: new Date().toLocaleDateString('ja-JP', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }),
        lastAction: '未打刻',
        showLog: false,
        showMemo: false,
        memoText: '',
        logs: [
          { date: '6/28（金）', in: '09:59', out: '18:13', memo: '今日は会議が多めの日でした' },
          { date: '6/27（木）', in: '10:15', out: '17:55', memo: '集中してタスク処理できた' }
        ],
        clockIn() {
          this.lastAction = '出勤 ' + new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        },
        clockOut() {
          this.lastAction = '退勤 ' + new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        },
        saveMemo() {
          const today = this.today.split(' ')[0];
          this.logs.unshift({ date: today, in: '--:--', out: '--:--', memo: this.memoText });
          this.memoText = '';
          this.showMemo = false;
        }
      }
    }
  </script>
</body>
</html>
