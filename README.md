# Plant Identifier

A modern web application that helps users identify plants through image recognition technology. Built with Next.js 14, TypeScript, and the Groq API Endpoint.

## Features

- Upload plant images for identification
- Get detailed plant information with confidence scores
- Modern, responsive UI
- Server-side image processing
- Secure API handling

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Groq
- **Deployment**: Netlify

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd plant-identifier
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Groq API key:
```env
GROQ_API_KEY=your-api-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key

## Deployment

The app is configured for deployment on Netlify. The live version can be found at:
[https://plant-identification-app.netlify.app](https://plant-identification-app.netlify.app)

## License

MIT
