// Record first-touch lead attribution on the landing page load (see
// app/utils/attribution.ts). Client plugins run once per full page load, so
// in-app navigation never overwrites the landing URL.
export default defineNuxtPlugin(() => {
  captureAttribution()
})
