(function() {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  // 'kinkan'クッキーが存在しない場合はuc.htmlにリダイレクト
  if (!getCookie('kinkan')) {
    window.location.href = 'uc.html';
    return;
  }
})();
