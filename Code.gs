/**
 * Arabic Character Recognizer — Google Apps Script Web App
 *
 * This file only has to do one job: serve the Index.html page.
 * All the camera + AI logic runs in the user's browser (client-side),
 * using TensorFlow.js. Apps Script itself never touches the model —
 * it just hosts the page.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Arabic Character Recognizer')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
