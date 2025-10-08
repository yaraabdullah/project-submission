# AI Association Project Submission Page

A modern, responsive project submission page for the AI Association with GitHub integration, bilingual support (Arabic/English), and light/dark mode functionality.

🌐 **Live Demo**: [https://yaraabdullah.github.io/project-submission/](https://yaraabdullah.github.io/project-submission/)

## Features

### 🎯 Core Functionality
- **Project Submission Form**: Users can submit AI projects with details
- **Project Gallery**: Display submitted projects in an attractive grid layout
- **Local Storage**: Projects persist between sessions
- **Sample Projects**: Includes demo projects to showcase functionality

### 🐙 GitHub Integration
- **OAuth Authentication**: Login with GitHub account
- **Repository Fetching**: Automatically fetch user's repositories
- **Auto-population**: Form fields auto-fill with GitHub repository data
- **GitHub Badge**: Visual indicator for GitHub-linked projects

### 🌍 Internationalization
- **Bilingual Support**: Full Arabic and English language support
- **RTL Layout**: Proper right-to-left layout for Arabic
- **Font Support**: Uses Noto Sans Arabic for proper Arabic rendering

### 🎨 Design & Theming
- **Logo Colors**: Uses AI Association brand colors
- **Light/Dark Mode**: Toggle between themes with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with animations

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yaraabdullah/project-submission.git
cd project-submission
```

### 2. Open in Browser
Simply open `index.html` in any modern web browser, or serve it using a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

### 3. GitHub OAuth Setup (Optional)

To enable GitHub integration:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: AI Association Project Submissions
   - **Homepage URL**: `https://yaraabdullah.github.io/project-submission/`
   - **Authorization callback URL**: `https://yaraabdullah.github.io/project-submission/`
4. Copy the **Client ID** from your OAuth app
5. Replace `YOUR_GITHUB_CLIENT_ID` in `script.js` with your actual Client ID

## Deployment

### GitHub Pages (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit: AI Association Project Submission Page"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access Your Site**:
   - Your site will be available at: `https://yaraabdullah.github.io/project-submission/`

### Other Hosting Options

- **Netlify**: Drag and drop the files to Netlify
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase CLI to deploy
- **Any Static Host**: Upload files to any web server

## File Structure

```
project-submission/
├── index.html          # Main HTML structure
├── styles.css          # CSS with theme support
├── script.js           # JavaScript functionality
├── .gitignore          # Git ignore file
└── README.md          # This file
```

## Usage

### For Users
1. **Connect GitHub**: Click "Login with GitHub" to authenticate
2. **Fetch Repositories**: Click "Fetch from GitHub" to load your repos
3. **Select Repository**: Choose a repository to auto-fill the form
4. **Submit Project**: Fill out remaining details and submit
5. **View Projects**: Browse all submitted projects in the gallery

### For Developers
1. **Customize Colors**: Modify CSS variables in `styles.css`
2. **Add Features**: Extend the `ProjectSubmissionApp` class in `script.js`
3. **Backend Integration**: Implement OAuth token exchange
4. **Database Storage**: Replace localStorage with database calls

## Color Scheme

Based on the AI Association logo:
- **Primary Gradient**: `#1A4A7A` → `#2B7EC2` → `#42A9E0`
- **Accent Color**: `#3D7A8C` (teal)
- **Text Colors**: `#333333` (primary), `#555555` (secondary)
- **Background**: `#FFFFFF` (light), `#0F172A` (dark)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m "Add feature"`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please contact the AI Association development team or create an issue in this repository.

## Acknowledgments

- AI Association for the logo and branding
- GitHub for OAuth integration
- Google Fonts for typography support
