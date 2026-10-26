/* Menu lớp + mã lớp (dùng ở trang chủ và trang lớp lop/<lớp>/).
   - Trang lớp chỉ mở khi máy có mã lớp: cô gửi link lop/<lớp>/#ma=<mã> cho riêng lớp đó → máy nhớ mã (localStorage nari-lop).
   - Menu chỉ hiện lớp máy này đã mở → học sinh TOPIK II không thấy lớp Seoul.
   - Mã không nằm trong repo, chỉ có SHA-256 của "nari-lop|<lớp>|<mã>". Đổi mã: thay dòng trong H (link cũ hết dùng, máy đã nhớ mã cũ phải mở link mới).
   Site công khai nên đây chỉ là “cửa có khóa”, không phải bảo mật thật: ai có link trang học liệu bên trong vẫn mở được trang đó. */
(function(){
  var H = {
    '4a': '5bc3658e24c9c2fb0c2497dc92d6a7d589f9f469022d9cf11b5d64ee9d86f3e3',
    '3a': 'fe48d386ddd83e92c88238533220eaaded537ef46f2044e6e4759bdabecb7dfa',
    '2a': '44bd1aace4607271946bfe2a140b03177ced8ce7f395749d10c1c9b0d80fd238',
    '1a': 'b358a72c2afc5a45a97be7e9e2e46b7603832dc314c713fc02cdf3f91e58c18d'
  };
  var LOP = [['4a', 'Seoul 4A'], ['3a', 'Seoul 3A'], ['2a', 'Seoul 2A'], ['1a', 'Seoul 1A']];
  var KEY = 'nari-lop';
  var me = document.currentScript, root = (me && me.getAttribute('data-root')) || '', here = (me && me.getAttribute('data-lop')) || '';
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } }
  function save(m){ try{ localStorage.setItem(KEY, JSON.stringify(m)); }catch(e){} }
  function sha(s){
    if(!(window.crypto && crypto.subtle && window.TextEncoder)) return Promise.reject();
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function(b){
      return [].map.call(new Uint8Array(b), function(x){ return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function check(lop, code){ code = String(code || '').trim().toUpperCase(); return code ? sha('nari-lop|' + lop + '|' + code).then(function(h){ return h === H[lop] ? code : null; }) : Promise.resolve(null); }

  function menu(){
    var nav = document.getElementById('lopnav'); if(!nav) return;
    var m = load(), h = '<a' + (here ? '' : ' class="on"') + ' href="' + root + '">TOPIK II</a>';
    LOP.forEach(function(l){ if(m[l[0]] || l[0] === here) h += '<a' + (l[0] === here ? ' class="on"' : '') + ' href="' + root + 'lop/' + l[0] + '/">' + l[1] + '</a>'; });
    nav.innerHTML = h + '<a class="kh" href="' + root + 'hoc-cung-co/">Khóa học ›</a>';
  }
  menu();
  if(!here) return;

  /* Trang lớp: nội dung trong #lop-nd (ẩn sẵn), chưa có mã thì hiện ô nhập mã */
  var nd = document.getElementById('lop-nd'), gate = document.getElementById('lop-ma');
  function open(){ nd.hidden = false; gate.hidden = true; menu(); }
  function ask(err){
    gate.hidden = false;
    gate.innerHTML = '<p><b>Trang này chỉ dành cho học sinh lớp ' + (LOP.filter(function(l){ return l[0] === here; })[0] || ['', ''])[1] + '.</b><br>' +
      'Em mở đúng link cô gửi trong nhóm lớp, hoặc nhập mã lớp cô đưa:</p>' +
      '<form><input name="m" autocomplete="off" autocapitalize="characters" placeholder="Mã lớp" maxlength="12"> <button>Vào lớp</button></form>' +
      (err ? '<p class="err">' + err + '</p>' : '') + '<p class="nt">Em học TOPIK II thì về <a href="' + root + '">trang TOPIK II</a>.</p>';
    gate.querySelector('form').onsubmit = function(e){ e.preventDefault(); tryCode(this.m.value); };
  }
  function tryCode(code){
    check(here, code).then(function(ok){
      if(!ok) return ask(code ? 'Mã chưa đúng. Em kiểm tra lại mã cô gửi nhé.' : '');
      var m = load(); m[here] = ok; save(m); open();
    }, function(){ ask('Trình duyệt này cũ quá, em mở bằng Chrome hoặc Safari mới nhé.'); });
  }
  function fromHash(){
    var hm = /[#&]ma=([^&]*)/i.exec(location.hash);
    if(!hm) return false;
    history.replaceState(null, '', location.pathname + location.search);
    tryCode(decodeURIComponent(hm[1]));
    return true;
  }
  window.addEventListener('hashchange', fromHash);
  if(!fromHash()) tryCode(load()[here]);
})();
