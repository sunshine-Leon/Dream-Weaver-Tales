# DreamWeaver Tales 🌙✨

A magical bedtime story generator that uses AI to weave unique tales, create illustrations, and narrate stories for children.

## Features

- 🎲 **Random Selection**: Choose from randomly generated animals, scenes, items, and styles.
- 📝 **AI Storytelling**: Generates 100-300 word stories suitable for children (US elementary level English).
- 🎨 **AI Illustrations**: Creates a unique illustration for every story.
- 🗣️ **AI Narration**: Reads the story aloud with a friendly voice.
- 📱 **Responsive Design**: Works great on desktop and mobile.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (Models: `gemini-2.5-flash`, `gemini-2.5-flash-image`, `gemini-2.5-flash-preview-tts`)
- **Animation**: Framer Motion, Canvas Confetti
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup & Run

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd dreamweaver-tales
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    - Copy `.env.example` to `.env`
    - Add your Google Gemini API key:
      ```env
      GEMINI_API_KEY=your_api_key_here
      ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Build for production**
    ```bash
    npm run build
    ```

## License

Apache-2.0
