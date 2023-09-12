function uaredirect(f) {
  if(window.location.href.indexOf('m.cnw')!=-1) return;
  if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
    location.href=f;
  }
}