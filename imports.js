"use strict";

const notInDatabase = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAMAAAAL34HQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhQTFRF/52d//b2/9HRAAAA/8LC/7Ky/4iI/+LjcCOcXAAAA0BJREFUeNrsl4u2oyAMRSMHyv//8WhLK48AKtrGOwkrigHSwzZ4Z2gSaaSyVJbKUlkqS2WpLJWlslSWyurJ8vNVnAt+iefv14/mEFxbAhtNImteKi2R3wfBtCQ2pbWTlvc99xvmnLtWKq10T9yds6kyPjXWTcz4VBmXS0ui0UA1X+hiadWqrlWhE1PNvvJl8BvyF6ftEC0g3C+trStl4auysFeW+YaswOtKWqbafG0EZv651z1uWKwT2dgO0nrhAlNxuJyWadD6eEQm3FNeR/LPtExUk7H7LB73EdggnovQRzIfppK71R+gtdABx+UsWvsbwhWF1uIc4JCqAVoGEEnLFF8DRsdRWmY2H5wzz/Tx6gPp1PCVyoNlDp/1czfHaF3fyIg0CuQ8Q9NnfV+lvo55pu+Z9bXfC3GxtFTWH5Bl56s4F0xLYDtMy5roL9Gg2Qto4RJaIt8hT8v+vraGMyB9o8s/bk6gZUcNyQPelzHjadnsTVrmzdqMll3rH/ka26gU7rdOp1WGDtOyQ474Gc87RnPKpSVWlgteM9eMI16PZx/8Grex7wTTchIbre+w5rbzvHf9lnGptNzOvX/HD9JyA7GNtCQ2cmFPslwuLYlGTuRbzGhheJ84jdZqNksa7yGPczbH0ZtrK/dkfC8t/IKWKFmRNFAUI2YOmLXJPKTP+dapRME9r6HlP3j5Xp+x7BmtCYvuMsZNY0ORstCwXAFycUPwNELpqnQN4IpYmQfEZv5EspeDXrFsnYD2tNowMlqIdpHsHU1az5dR8GOoZnmQ5wnr3rneuEKtI61JrDUcHGktI1lDYb8U8n3mIuRqVBteFuY0aVUqIHvq0wLHOSOWZqEW+/qvdnWjk4ef4/g5TJ2gRwv9kwieTeskplVZVmpx1pFVfJG9OAVMHhRnqTg9JNQltlVfbFzcMfF8nJjxWh6qcHqPyKQl1SRW/J2Mq+pWxe85DdSJ342V2u3sMeSPk9aUMam0Vr15v9fohDlUicqlJa+RSJdKq32Gf8lT25lfHm0fWg/GqOGPSj+OPZjnXt40331osQAHjXbPv09t/d5IpoulJZKX4NpSWSpLZakslaWyVJbKUln/nax/AgwAE+Yw8Q3qDzQAAAAASUVORK5CYII=";

const SVG = function(spinner) {
  return {
    spinner,
    spinner100: '<svg width="100px" height="100' + spinner,
    spinner34: '<svg width="34px" height="34' + spinner
  };
}('px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-ring-alt"><rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect><circle cx="50" cy="50" r="40" stroke="#b4b197" fill="none" stroke-width="10" stroke-linecap="round"></circle><circle cx="50" cy="50" r="40" stroke="#f4efcc" fill="none" stroke-width="6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray" dur="1s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate></circle></svg>');

const HTML = function() {
  return {
    populating: `<div class="loadingSpinner"><div>${SVG.spinner100}</div></div><div class="loadingText"><span></span><span></span> . . .<br /><br /><strong>Your browser might freeze for several minutes. Don't panic!</strong><br />This is the initial setup and will only occur this one time.<br />Future updates to the local database will happen in a non-intrusive way.<br />Happy Booru browsing!</div>`,
    window: "width=600,height=300,toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=0",
    forage: "https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js",
    update: `${SVG.spinner34}<br /><span class="progress"><span></span><span></span></span>`
  };
}();