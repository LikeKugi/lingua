# Лингва — AI Error Explainer

A mobile app that explains **why** your answer in a language exercise was wrong.
You enter the task (a set of words or a source sentence), your answer and the
correct answer. The app asks an LLM of your choice to explain the mistake (grammar, syntax, vocabulary, examples) and
saves the explanation to a local
history.

Built with React Native, Expo and Expo Router. Runs on Android, iOS and the web.

---

## Features

- **Two task types:** "build a sentence from words" and "translate / transform
  a sentence".
- **Any OpenAI-compatible provider:** set the base URL and API key, then the app
  loads the available models from `/models` and sends requests to
  `/chat/completions`. Works with OpenAI, OpenRouter, Groq, Together, DeepSeek,
  Mistral, a local Ollama / LM Studio server and others.
- **Connection check:** test the key and URL before using them; the key is saved
  automatically once the check succeeds.
- **Response language:** explanations in Russian, English, German, French,
  Spanish, Italian, Portuguese, Chinese, Japanese or Korean (defaults to the
  device language).
- **Prompt library:** built-in prompts (Grammar, Syntax, Vocabulary, Examples)
  that can be toggled on or off, plus your own custom prompts.
- **Editable system prompt** with a one-tap reset to the default, and an extra
  instruction field appended to every request.
- **History:** every explanation is saved with the task, answers, model and
  language. Open an entry for details, delete it, or clear the whole history.
- **Markdown rendering** for model answers.

## Privacy and security

- **No backend.** The app talks **directly** to the API URL you configure. There
  is no intermediate server, no analytics and no telemetry. Your tasks, answers
  and AI explanations go to your chosen provider and nowhere else.
- **AI answers stay on your device.** History, prompts and settings are stored
  locally in AsyncStorage. They are never uploaded or synced anywhere.
- **The API key is stored in the system secure storage.** On Android it goes to
  the Keystore and on iOS to the Keychain, via `expo-secure-store`. It is only
  sent in the `Authorization` header to your provider.
- **Web caveat:** browsers have no secure store, so in the web build the key is
  kept in plain `localStorage`. Use the native apps if that matters to you.
- **Maximum privacy:** point the base URL at a model running on your own machine
  or network (for example Ollama: `http://<your-ip>:11434/v1`) and no data
  leaves your network at all.

## Free to use

- The app is free and open: no subscriptions, no in-app purchases, no ads and no
  accounts.
- You bring your own API key ("BYOK"). You pay only your provider for what you
  use, or nothing at all if you use a free tier (e.g. OpenRouter free models,
  Groq) or a local model.

---

## Requirements

| Tool                         | Version          | Needed for              |
|------------------------------|------------------|-------------------------|
| Node.js                      | `>= 22.11.0`     | everything              |
| npm                          | comes with Node  | everything              |
| JDK                          | 17               | Android builds          |
| Android Studio + Android SDK | latest           | Android builds          |
| Xcode + Command Line Tools   | latest           | iOS builds (macOS only) |
| Ruby + Bundler (CocoaPods)   | Ruby `>= 2.6.10` | iOS builds (macOS only) |

Which platforms you can build on each host OS:

| Host OS | Android | iOS         | Web |
|---------|---------|-------------|-----|
| macOS   | ✅      | ✅          | ✅  |
| Windows | ✅      | ☁️ EAS only | ✅  |
| Linux   | ✅      | ☁️ EAS only | ✅  |

Install the dependencies first:

```sh
npm install
```

## Quick start (Expo Go)

The fastest way to try the app without native tooling:

```sh
npm start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS). The phone
and the computer need to be on the same network. Add `--tunnel` if they are
not: `npx expo start --tunnel`.

---

## Android

### Debug build on a device or emulator

1. Install Android Studio, the Android SDK and JDK 17.
2. Set the environment variables:

   **macOS / Linux** (`~/.zshrc` or `~/.bashrc`):

   ```sh
   export ANDROID_HOME=$HOME/Library/Android/sdk   # Linux: $HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
   ```

   **Windows** (PowerShell):

   ```powershell
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
   ```

3. Start an emulator or connect a phone with USB debugging enabled (check with `adb devices`).
4. Build and run:

   ```sh
   npm run android
   ```

   This runs `expo run:android`, which generates the `android/` folder on the
   first run (`expo prebuild`) and installs a debug build.

### Release APK / AAB

1. Generate the native project if it does not exist yet:

   ```sh
   npx expo prebuild --platform android
   ```

2. Create a signing key (keep it safe and **do not commit it**):

   ```sh
   keytool -genkeypair -v -storetype PKCS12 -keystore android/app/release.keystore \
     -alias lingua -keyalg RSA -keysize 2048 -validity 10000
   ```

3. Configure `signingConfigs.release` in `android/app/build.gradle` to use that
   keystore (see the
   [React Native signing guide](https://reactnative.dev/docs/signed-apk-android)).
4. Build:

   ```sh
   cd android
   ./gradlew assembleRelease   # APK  -> app/build/outputs/apk/release/
   ./gradlew bundleRelease     # AAB  -> app/build/outputs/bundle/release/ (Google Play)
   ```

   On Windows use `gradlew.bat` instead of `./gradlew`.

5. Install the APK on a connected device:

   ```sh
   adb install app/build/outputs/apk/release/app-release.apk
   ```

Or test the release variant directly: `npx expo run:android --variant release`.

> Using a local model over plain `http://`? Android release builds block
> cleartext traffic by default. Use HTTPS, or allow cleartext with the
> `expo-build-properties` plugin (`android.usesCleartextTraffic: true`).

## iOS (macOS only)

1. Install Xcode from the App Store, then the command line tools:

   ```sh
   xcode-select --install
   ```

2. Install CocoaPods through the bundled `Gemfile`:

   ```sh
   bundle install
   ```

3. Build and run on the simulator:

   ```sh
   npm run ios
   ```

   This runs `expo run:ios`, which generates the `ios/` folder and installs the
   pods on the first run. If the pods need reinstalling:

   ```sh
   cd ios && bundle exec pod install && cd ..
   ```

4. **Physical device:** run `npx expo run:ios --device`, or open
   `ios/*.xcworkspace` in Xcode, choose your Apple ID team under *Signing & Capabilities*, select the device and press
   Run.
5. **Release / archive:** `npx expo run:ios --configuration Release`, or in Xcode
   use *Product → Archive* to export an `.ipa` or upload it to TestFlight (needs an Apple Developer account).

## Web

```sh
npx expo start --web            # development server
npx expo export --platform web  # static production build in dist/
```

Serve `dist/` with any static host (Nginx, GitHub Pages, Netlify, Vercel, ...).
To preview it locally: `npx serve dist`.

> Your provider has to allow CORS requests from the browser. Some providers do
> not, in which case use the native app. Remember that the API key is kept in
> `localStorage` on the web.

## Cloud builds with EAS (any OS)

[EAS Build](https://docs.expo.dev/build/introduction/) builds Android and iOS
binaries in the cloud, so you can produce an iOS build from Windows or Linux.

```sh
npm install -g eas-cli
eas login
eas build:configure                                   # creates eas.json
eas build --platform android --profile preview        # installable APK
eas build --platform ios                              # needs an Apple Developer account
```

---

## First run

1. Open **Settings**.
2. Enter the base URL (default `https://api.openai.com/v1`) and your API key.
3. Tap **Test connection** or **Load models**, then pick a model.
4. Optionally choose the response language and add an extra instruction.
5. Go to the main tab, fill in the task, your answer and the correct answer, and
   ask for an explanation.

## Development

```sh
npm start      # Expo dev server
npm run lint   # ESLint
npm test       # Jest
```

Project structure:

```
app/            Expo Router routes (tabs: explain, history, prompts, system prompt, settings)
src/api/        OpenAI-compatible API client
src/components/ shared UI components
src/constants/  default prompts and supported languages
src/i18n/       UI strings
src/lib/        prompt builder and helpers
src/screens/    screen implementations
src/store/      Zustand stores (settings, history, prompts)
```
