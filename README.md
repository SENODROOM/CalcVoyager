# CalcVoyager

A modern, interactive calculator application for mathematical exploration and computation.

## Overview

CalcVoyager is a feature-rich calculator designed to make mathematical computations intuitive and accessible. Whether you're solving simple arithmetic or complex equations, CalcVoyager provides the tools you need for your mathematical journey.

## Features

- **Basic Operations**: Addition, subtraction, multiplication, and division
- **Advanced Functions**: Trigonometric, logarithmic, and exponential calculations
- **User-Friendly Interface**: Clean, intuitive design for seamless calculations
- **Calculation History**: Track and review your previous computations
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Keyboard Support**: Full keyboard navigation for efficient input

## Installation

### Prerequisites

- Node.js (version 14.x or higher)
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/SENODROOM/CalcVoyager.git
cd CalcVoyager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Basic Calculations

1. Enter numbers using the on-screen buttons or your keyboard
2. Select an operation (+, -, ×, ÷)
3. Press equals (=) to see the result

### Advanced Features

- **Scientific Mode**: Access advanced mathematical functions
- **Memory Functions**: Store and recall values (M+, M-, MR, MC)
- **Clear Functions**: AC (All Clear) or C (Clear entry)

### Keyboard Shortcuts

- `0-9`: Number input
- `+, -, *, /`: Basic operations
- `Enter`: Calculate result
- `Escape`: Clear current entry
- `Backspace`: Delete last digit

## Technology Stack

- **Frontend**: React.js / HTML5 / CSS3
- **State Management**: React Hooks / Context API
- **Build Tool**: Webpack / Create React App
- **Testing**: Jest / React Testing Library

## Project Structure

```
CalcVoyager/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Calculator.js
│   │   ├── Display.js
│   │   └── Button.js
│   ├── utils/
│   │   └── calculations.js
│   ├── styles/
│   │   └── App.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

### Code Style

- Follow the existing code formatting
- Write clear, descriptive commit messages
- Add comments for complex logic
- Ensure all tests pass before submitting

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

Run tests with coverage:

```bash
npm test -- --coverage
# or
yarn test --coverage
```

## Building for Production

Create an optimized production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

## Deployment

### Deploy to GitHub Pages

```bash
npm run deploy
```

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Deploy to Vercel

```bash
vercel --prod
```

## Roadmap

- [ ] Add scientific calculator mode
- [ ] Implement calculation history export
- [ ] Add theme customization
- [ ] Support for complex numbers
- [ ] Unit conversion features
- [ ] Graph plotting capabilities

## Known Issues

Please check the [Issues](https://github.com/SENODROOM/CalcVoyager/issues) page for known bugs and feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by classic calculator designs
- Built with modern web technologies
- Thanks to all contributors who have helped improve CalcVoyager

## Contact

- **Author**: SENODROOM
- **Repository**: [github.com/SENODROOM/CalcVoyager](https://github.com/SENODROOM/CalcVoyager)
- **Issues**: [Report a bug or request a feature](https://github.com/SENODROOM/CalcVoyager/issues)

## Screenshots

*(Add screenshots of your application here)*

---

Made with ❤️ by SENODROOM
