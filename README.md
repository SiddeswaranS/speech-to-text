# VoiceScript - Professional Speech to Text Application

A modern, responsive web-based speech-to-text application built with vanilla HTML, CSS, and JavaScript. VoiceScript leverages the Web Speech API to provide real-time speech recognition and transcription with a professional UI.

![VoiceScript](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Browser Support](https://img.shields.io/badge/browser-Chrome%20%7C%20Edge%20%7C%20Safari-brightgreen)

## Features

### Core Functionality
- **Real-time Speech Recognition**: Instant transcription using Web Speech API
- **Multi-language Support**: 15 languages including English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Russian, and Arabic
- **Continuous Recording Mode**: Keep recording until manually stopped
- **Editable Output**: Edit transcribed text with auto-save functionality

### User Interface
- **Modern Design**: Clean, professional interface with glassmorphism effects
- **Dark/Light Theme**: Toggle between light and dark modes
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **2-Column Layout**: 75% for controls, 25% for recording section

### Advanced Features
- **Export Options**: Download as TXT, DOC, or share via email
- **Text Formatting**: Auto-capitalize sentences and proper formatting
- **Text-to-Speech**: Listen to transcribed text
- **Undo/Redo**: Full history management
- **Auto-save**: Automatically saves transcriptions to browser storage
- **Keyboard Shortcuts**: Power user shortcuts for all major functions
- **Character & Word Count**: Real-time statistics
- **Adjustable Font Size**: Customize text size for better readability

## Quick Start

### Prerequisites
- Modern web browser (Chrome, Edge, or Safari recommended)
- Node.js (optional, for local server)
- Microphone access permission

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/speech-to-text.git
cd speech-to-text
```

2. Install dependencies (optional, for testing):
```bash
npm install
```

### Running the Application

#### Option 1: Direct Browser Opening
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

#### Option 2: Using Node.js Server
```bash
npm start
# Navigate to http://localhost:7001
```

#### Option 3: Using Python Server
```bash
python -m http.server 8000
# Navigate to http://localhost:8000
```

## Usage

1. **Grant Microphone Permission**: Allow browser access to your microphone when prompted
2. **Select Language**: Choose your preferred language from the dropdown
3. **Start Recording**: Click the microphone button or press `Space`/`Ctrl+Enter`
4. **Stop Recording**: Click the microphone button again to stop
5. **Edit Text**: Click in the text area to make manual edits
6. **Export**: Use the Export button to save or share your transcription

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` / `Ctrl+Enter` | Start/stop recording |
| `Ctrl+C` | Copy text |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Ctrl+Delete` | Clear text |
| `Ctrl+D` | Toggle theme |

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Edge | ✅ Full support |
| Safari | ✅ Full support |
| Firefox | ❌ Not supported (no Web Speech API) |

## Testing

The project includes comprehensive Playwright tests for UI functionality.

### Run Tests
```bash
# Run all tests
npm run test:playwright

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

### Test Coverage
- UI layout and responsiveness
- Recording functionality
- Settings management
- Theme switching
- Export features
- Keyboard shortcuts
- Language selection
- LocalStorage persistence
- Auto-save functionality

## Project Structure

```
speech-to-text/
├── index.html              # Main application file
├── server.cjs              # Node.js server
├── package.json            # Project dependencies
├── playwright.config.js    # Playwright configuration
├── tests/                  # Test files
│   ├── voicescript.spec.js # UI tests
│   └── test-runner.js      # Test runner script
├── CLAUDE.md              # Development guidelines
└── README.md              # This file
```

## Configuration

### Settings Available
- **Language**: 15 language options with regional variants
- **Font Size**: Adjustable from 14px to 24px
- **Continuous Recording**: Toggle continuous recording mode
- **Auto-save**: Enable/disable automatic saving
- **Timestamps**: Include time markers in transcription
- **Theme**: Switch between light and dark modes

### LocalStorage Keys
- `voiceScriptSettings`: User preferences
- `voiceScriptHistory`: Undo/redo history
- `voiceScriptAutoSave`: Auto-saved transcription

## Development

### Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **API**: Web Speech API
- **Testing**: Playwright
- **Server**: Node.js (optional)

### Design Principles
- Single-file architecture for simplicity
- No external dependencies for core functionality
- Progressive enhancement
- Accessibility-first approach
- Mobile-responsive design

## Troubleshooting

### Microphone Not Working
1. Check browser permissions
2. Ensure HTTPS connection (or localhost)
3. Try a different browser (Chrome recommended)

### Speech Recognition Not Starting
1. Verify browser compatibility
2. Check internet connection (required for Web Speech API)
3. Clear browser cache and reload

### Text Not Saving
1. Check browser's localStorage is enabled
2. Ensure sufficient storage space
3. Try clearing site data and refreshing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Web Speech API for speech recognition capabilities
- Font Awesome for icons
- Google Fonts (Inter) for typography
- Playwright for testing framework

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the maintainers.

---

Made with ❤️ by [Your Name]