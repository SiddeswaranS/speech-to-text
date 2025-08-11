# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a standalone web-based Speech-to-Text application built with vanilla HTML, CSS, and JavaScript. The application uses the Web Speech API for real-time speech recognition and transcription.

## Key Features & Architecture

- **Single-file architecture**: All functionality contained in `simple_speech_to_text.html`
- **Web Speech API**: Uses browser's native `SpeechRecognition` API (webkitSpeechRecognition for webkit browsers)
- **Real-time transcription**: Displays both interim and final transcription results
- **Multi-language support**: Supports 10 languages including English, Spanish, French, German, Chinese, Japanese, and Korean
- **Editable output**: Users can manually edit the transcribed text

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
start simple_speech_to_text.html  # Windows
open simple_speech_to_text.html   # macOS
xdg-open simple_speech_to_text.html  # Linux

# Or serve locally with any static server
python -m http.server 8000
# Then navigate to http://localhost:8000/simple_speech_to_text.html
```

## Code Structure

The application follows an object-oriented approach with a single `SpeechToTextApp` class that manages:
- Speech recognition initialization and configuration
- UI state management
- Event handling for recording, clearing, copying, and language selection
- Error handling for various speech recognition errors
- Real-time UI updates based on recognition state

## Important Implementation Details

- **Continuous recognition**: `recognition.continuous = true` allows ongoing transcription
- **Interim results**: `recognition.interimResults = true` provides real-time feedback
- **Error handling**: Comprehensive error messages for common issues (no-speech, audio-capture, not-allowed, network)
- **Responsive design**: Mobile-friendly with media queries for screens < 600px
- **Visual feedback**: Recording button changes appearance and animates when active

## Testing Considerations

When testing speech recognition:
1. Ensure microphone permissions are granted
2. Test in a supported browser (Chrome preferred)
3. Verify language switching functionality
4. Test error scenarios (deny microphone access, no speech input)
5. Check mobile responsiveness