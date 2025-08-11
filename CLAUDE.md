# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a professional web-based Speech-to-Text application called "VoiceScript" built with vanilla HTML, CSS, and JavaScript. The application uses the Web Speech API for real-time speech recognition and transcription with a modern, responsive UI.

## Key Features & Architecture

- **Single-file architecture**: All functionality contained in `index.html`
- **Web Speech API**: Uses browser's native `SpeechRecognition` API (webkitSpeechRecognition for webkit browsers)
- **Real-time transcription**: Displays both interim and final transcription results with visual feedback
- **Multi-language support**: Supports 15 languages including English (US/UK), Spanish (Spain/Mexico), French, German, Italian, Portuguese (Brazil/Portugal), Chinese (Simplified/Traditional), Japanese, Korean, Russian, and Arabic
- **Editable output**: Users can manually edit the transcribed text with auto-save functionality
- **Theme support**: Light and dark theme with smooth transitions
- **Advanced UI**: Professional design with glassmorphism effects, animations, and responsive layout

## Browser Compatibility

The application requires browsers that support the Web Speech API:

- Chrome (recommended)
- Edge
- Safari
- Does NOT work in Firefox

## Development Commands

Since this is a static HTML file, no build process is required:

```bash
# Open directly in browser
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux

# Or serve locally with any static server
python -m http.server 8000
# Then navigate to http://localhost:8000/

# Or use the included Node.js server
npm start
# Then navigate to http://localhost:7001/
```

## Code Structure

The application follows an object-oriented approach with a single `VoiceScriptApp` class that manages:

- Speech recognition initialization and configuration
- UI state management and theme switching
- Event handling for all controls (recording, editing, formatting, exporting)
- Error handling for various speech recognition errors
- Real-time UI updates based on recognition state
- History management with undo/redo functionality
- Settings persistence in localStorage
- Auto-save and session restoration
- Keyboard shortcuts for power users
- Toast notifications for user feedback

## Important Implementation Details

- **Continuous recognition**: `recognition.continuous = true` allows ongoing transcription
- **Interim results**: `recognition.interimResults = true` provides real-time feedback
- **Error handling**: Comprehensive error messages for common issues (no-speech, audio-capture, not-allowed, network, service-not-allowed)
- **Responsive design**: Mobile-friendly with media queries for screens < 1024px, < 768px, and < 480px
- **Visual feedback**: Recording button with animated waveform rings and status indicators
- **Storage**: Uses localStorage for settings, history, and auto-save functionality
- **Export options**: Support for TXT, DOC, and email sharing
- **Accessibility**: ARIA labels, focus styles, keyboard navigation, high contrast mode support
- **Performance**: Reduced motion support, optimized animations, efficient DOM updates

## Testing Considerations

When testing speech recognition:

1. Ensure microphone permissions are granted
2. Test in a supported browser (Chrome preferred)
3. Verify language switching functionality (15 languages)
4. Test error scenarios (deny microphone access, no speech input)
5. Check mobile responsiveness across different breakpoints
6. Test theme switching (light/dark modes)
7. Verify keyboard shortcuts functionality
8. Test undo/redo functionality
9. Verify auto-save and session restoration
10. Test export functionality (TXT, DOC, email)
11. Check text formatting and text-to-speech features
12. Verify continuous recording mode
13. Test timestamp functionality
14. Check history management
15. Verify toast notifications

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Start/stop recording
- **Space**: Start/stop recording (when not typing)
- **Ctrl/Cmd + C**: Copy text
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y**: Redo
- **Ctrl/Cmd + Shift + Z**: Redo
- **Ctrl/Cmd + Delete**: Clear text
- **Ctrl/Cmd + D**: Toggle theme

## Settings Available

- **Language**: 15 language options with country variants
- **Font Size**: Adjustable from 14px to 24px
- **Continuous Recording**: Keep recording until manually stopped
- **Auto-save**: Automatically save transcriptions to browser storage
- **Timestamps**: Include time markers in transcription
- **Theme**: Light/dark mode toggle