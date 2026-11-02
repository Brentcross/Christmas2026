// Build stamp for cache-busting. Written by `node tools/seal-hunt.mjs seal` (or `stamp`); do not edit.
// Pages load this file fresh (version.js?t=<now>) and every other file with ?v=<build>, so a phone never
// mixes cached old files with new ones. See the head snippet in the screen builders' API notes.
window.FOR_UNTO_US_BUILD = '20261101T004357Z';
// ForUntoUsAsset('art/x.jpg') -> 'art/x.jpg?v=<build>'
window.ForUntoUsAsset = function (path) {
  path = String(path);
  return path + (path.indexOf('?') < 0 ? '?' : '&') + 'v=' + encodeURIComponent(window.FOR_UNTO_US_BUILD);
};
// ForUntoUsLoad(['css/base.css', 'config.js', ...]) writes the <link> and <script> tags in this order.
// Call it from an inline <script> in <head> while the page is still loading.
window.ForUntoUsLoad = function (paths) {
  for (var i = 0; i < paths.length; i++) {
    var url = window.ForUntoUsAsset(paths[i]).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    document.write(/\.css$/.test(paths[i]) ? '<link rel="stylesheet" href="' + url + '">' : '<script src="' + url + '"><\/script>');
  }
};
