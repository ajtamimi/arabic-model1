# Arabic Character Recognizer — Webcam + model_555.h5 + Google Apps Script

## What I found in your model

`model_555.h5` is a Keras Sequential CNN:

- **Input:** 64×64, 1 channel (grayscale)
- **Layers:** Conv2D(64) → Conv2D(64) → MaxPool → Dropout → Flatten → Dense(128) → Dropout → **Dense(32, softmax)**
- **Output:** 32 classes

I already converted it to TensorFlow.js format (`tfjs_model/model.json` + `group1-shard1of1.bin`) and verified the converted model produces the same predictions as the original `.h5` file (max difference ~1e-7, i.e. float32 rounding only). You don't need to redo the conversion.

⚠️ **Important — you must fill in two things yourself, or predictions will be wrong:**
1. **Class labels.** I don't have your training script, so I don't know which of the 32 output indices maps to which Arabic letter. `Index.html` currently has placeholder labels (`Class 0` … `Class 31`). Replace `LABELS` with the real order used when you trained the model (usually the sorted folder names of your dataset, or your `label_encoder.classes_`).
2. **Preprocessing.** I assumed grayscale + divide by 255 (no inversion), which is the most common setup for these datasets. If predictions look consistently wrong, try the "Invert colors" checkbox in the page — some Arabic handwriting datasets store white ink on a black background.

## Why the architecture looks like this

Apps Script can't run TensorFlow/Keras — it only runs JavaScript on Google's servers and has no Python runtime. So the model has to run **in the browser** with TensorFlow.js. Apps Script's job is just to serve the webpage; all the camera capture and AI inference happen client-side, in the user's browser.

```
Browser (camera + TensorFlow.js) ⇄ loads model.json/bin from wherever you host it
        ⇅
Google Apps Script (HtmlService) — just serves the HTML page
```

## Files in this delivery

| File | Purpose |
|---|---|
| `tfjs_model/model.json` | Converted model architecture + weight manifest |
| `tfjs_model/group1-shard1of1.bin` | Converted model weights (~28 MB) |
| `Index.html` | The webcam + prediction page |
| `Code.gs` | Apps Script server file that serves `Index.html` |

---

## Step 1 — Host the model files somewhere public

The `.bin` weight file is ~28 MB. Apps Script projects are meant for small text/HTML files, not large binaries, so host `tfjs_model/` on a static file host and just point the page at it. Easiest free option: **GitHub Pages**.

1. Create a new public GitHub repo (e.g. `arabic-model`).
2. Upload the whole `tfjs_model/` folder (both `model.json` and `group1-shard1of1.bin`) to it.
3. In the repo settings, enable **GitHub Pages** for the `main` branch.
4. Your model URL will be:
   `https://<your-username>.github.io/arabic-model/tfjs_model/model.json`

(Firebase Hosting or a public Google Cloud Storage bucket work the same way — you just need a URL that serves the two files with CORS allowed, which GitHub Pages does by default.)

## Step 2 — Edit `Index.html`

Open `Index.html` and edit the top of the `<script>` block:

```js
const MODEL_URL = 'https://<your-username>.github.io/arabic-model/tfjs_model/model.json';

const LABELS = [ /* your real 32 labels, in training order */ ];
```

## Step 3 — Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Delete the default `Code.gs` content and paste in the `Code.gs` from this delivery.
3. Add an HTML file: **File → New → HTML file**, name it exactly `Index` (Apps Script adds `.html` automatically).
4. Paste the contents of `Index.html` into it.

## Step 4 — Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone (or "Anyone with Google account" if you want it restricted)
4. Click **Deploy**, authorize the requested permissions, and copy the web app URL.
5. Open that URL — you should see "Loading model…", then "Camera ready" once it finishes loading.

## Step 5 — Use it

1. Click **Start Camera** and allow camera permission.
2. Hold up (or draw) an Arabic character in front of the camera.
3. Click **Capture & Predict**. The 64×64 grayscale image the model actually sees is shown below the video, so you can sanity-check that it looks like a recognizable character before trusting the prediction.

---

## A known Apps Script quirk to watch for

Apps Script serves `HtmlService` pages inside a sandboxed iframe. Camera access via `getUserMedia` generally works with the deployment settings above, but some organizations' Google Workspace security policies block camera/microphone permissions inside Apps Script iframes entirely. If **Start Camera** fails with a permissions error that isn't the normal browser prompt, that's the likely cause — in that case, host `Index.html` as a plain static page instead (e.g. the same GitHub Pages repo as the model) and it will work identically, since all the logic is client-side JavaScript.

## Improving accuracy

- Use good, even lighting and a plain background — the model was trained on clean, centered characters, not photos of handwriting on paper under mixed lighting.
- If accuracy is poor, consider adding a "crop to bounding box" step (find the ink pixels and crop tightly) before the 64×64 resize, since webcam frames include a lot of background the training data probably didn't have.
