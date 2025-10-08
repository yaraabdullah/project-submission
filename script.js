// JavaScript for Project Submission Page

class ProjectSubmissionApp {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('aiAssociationProjects')) || [];
        this.currentLanguage = localStorage.getItem('aiAssociationLanguage') || 'en';
        this.currentTheme = localStorage.getItem('aiAssociationTheme') || 'light';
        this.githubUser = JSON.parse(localStorage.getItem('aiAssociationGitHubUser')) || null;
        this.githubRepos = JSON.parse(localStorage.getItem('aiAssociationGitHubRepos')) || [];
        
        // GitHub OAuth configuration
        this.githubClientId = 'YOUR_GITHUB_CLIENT_ID'; // Replace with your GitHub OAuth App Client ID
        this.githubRedirectUri = 'https://yaraabdullah.github.io/project-submission/';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        this.checkGitHubAuth();
        this.renderProjects();
        this.addSampleProjects();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Language toggle
        const languageToggle = document.getElementById('languageToggle');
        languageToggle.addEventListener('click', () => this.toggleLanguage());

        // GitHub login/logout
        const githubLoginBtn = document.getElementById('githubLoginBtn');
        const githubLogoutBtn = document.getElementById('githubLogoutBtn');
        githubLoginBtn.addEventListener('click', () => this.loginWithGitHub());
        githubLogoutBtn.addEventListener('click', () => this.logoutFromGitHub());

        // Fetch repositories button
        const fetchRepoBtn = document.getElementById('fetchRepoBtn');
        fetchRepoBtn.addEventListener('click', () => this.fetchUserRepositories());

        // Repository selector
        const repoSelect = document.getElementById('repoSelect');
        repoSelect.addEventListener('change', (e) => this.selectRepository(e.target.value));

        // Form submission
        const form = document.getElementById('submissionForm');
        form.addEventListener('submit', (e) => this.handleFormSubmission(e));
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('aiAssociationTheme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        localStorage.setItem('aiAssociationLanguage', this.currentLanguage);
        this.applyLanguage();
    }

    applyLanguage() {
        document.documentElement.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', this.currentLanguage);
        
        // Update all elements with data attributes
        const elements = document.querySelectorAll('[data-en][data-ar]');
        elements.forEach(element => {
            element.textContent = element.getAttribute(`data-${this.currentLanguage}`);
        });

        // Update language toggle button
        const langToggle = document.getElementById('languageToggle');
        langToggle.querySelector('.lang-text').textContent = this.currentLanguage === 'en' ? 'العربية' : 'English';
    }

    // GitHub Authentication Methods
    checkGitHubAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            this.handleGitHubCallback(code);
        } else if (this.githubUser) {
            this.updateGitHubUI();
        }
    }

    loginWithGitHub() {
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${this.githubClientId}&redirect_uri=${encodeURIComponent(this.githubRedirectUri)}&scope=user:email,repo`;
        window.location.href = githubAuthUrl;
    }

    async handleGitHubCallback(code) {
        try {
            // In a real application, you would exchange the code for an access token on your backend
            // For demo purposes, we'll simulate this process
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'GitHub authentication successful!' 
                    : 'تم تسجيل الدخول إلى GitHub بنجاح!'
            );
            
            // Simulate getting user data (in real app, this would come from your backend)
            const mockUser = {
                login: 'demo-user',
                name: 'Demo User',
                avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
                email: 'demo@example.com'
            };
            
            this.githubUser = mockUser;
            localStorage.setItem('aiAssociationGitHubUser', JSON.stringify(this.githubUser));
            this.updateGitHubUI();
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
        } catch (error) {
            console.error('GitHub authentication error:', error);
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'GitHub authentication failed. Please try again.' 
                    : 'فشل تسجيل الدخول إلى GitHub. يرجى المحاولة مرة أخرى.'
            );
        }
    }

    logoutFromGitHub() {
        this.githubUser = null;
        this.githubRepos = [];
        localStorage.removeItem('aiAssociationGitHubUser');
        localStorage.removeItem('aiAssociationGitHubRepos');
        this.updateGitHubUI();
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Logged out from GitHub' 
                : 'تم تسجيل الخروج من GitHub'
        );
    }

    updateGitHubUI() {
        const githubLogin = document.getElementById('githubLogin');
        const githubProfile = document.getElementById('githubProfile');
        const fetchRepoBtn = document.getElementById('fetchRepoBtn');
        
        if (this.githubUser) {
            githubLogin.style.display = 'none';
            githubProfile.style.display = 'flex';
            
            document.getElementById('githubAvatar').src = this.githubUser.avatar_url;
            document.getElementById('githubName').textContent = this.githubUser.name || this.githubUser.login;
            document.getElementById('githubUsername').textContent = `@${this.githubUser.login}`;
            
            fetchRepoBtn.disabled = false;
        } else {
            githubLogin.style.display = 'block';
            githubProfile.style.display = 'none';
            fetchRepoBtn.disabled = true;
        }
    }

    async fetchUserRepositories() {
        if (!this.githubUser) return;
        
        const fetchRepoBtn = document.getElementById('fetchRepoBtn');
        const originalText = fetchRepoBtn.textContent;
        
        try {
            fetchRepoBtn.disabled = true;
            fetchRepoBtn.textContent = this.currentLanguage === 'en' ? 'Loading...' : 'جاري التحميل...';
            
            // In a real application, you would fetch from your backend with the user's access token
            // For demo purposes, we'll use mock data
            const mockRepos = [
                {
                    id: 1,
                    name: 'ai-image-recognition',
                    full_name: `${this.githubUser.login}/ai-image-recognition`,
                    description: 'An advanced machine learning model for image recognition',
                    html_url: `https://github.com/${this.githubUser.login}/ai-image-recognition`,
                    language: 'Python',
                    stargazers_count: 42,
                    updated_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'smart-chatbot',
                    full_name: `${this.githubUser.login}/smart-chatbot`,
                    description: 'A conversational AI assistant built with modern NLP techniques',
                    html_url: `https://github.com/${this.githubUser.login}/smart-chatbot`,
                    language: 'JavaScript',
                    stargazers_count: 28,
                    updated_at: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 3,
                    name: 'predictive-analytics',
                    full_name: `${this.githubUser.login}/predictive-analytics`,
                    description: 'Machine learning dashboard for business intelligence',
                    html_url: `https://github.com/${this.githubUser.login}/predictive-analytics`,
                    language: 'Python',
                    stargazers_count: 15,
                    updated_at: new Date(Date.now() - 172800000).toISOString()
                }
            ];
            
            this.githubRepos = mockRepos;
            localStorage.setItem('aiAssociationGitHubRepos', JSON.stringify(this.githubRepos));
            
            this.populateRepositorySelector();
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? `Found ${mockRepos.length} repositories!` 
                    : `تم العثور على ${mockRepos.length} مستودع!`
            );
            
        } catch (error) {
            console.error('Error fetching repositories:', error);
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Failed to fetch repositories. Please try again.' 
                    : 'فشل في جلب المستودعات. يرجى المحاولة مرة أخرى.'
            );
        } finally {
            fetchRepoBtn.disabled = false;
            fetchRepoBtn.textContent = originalText;
        }
    }

    populateRepositorySelector() {
        const repoSelect = document.getElementById('repoSelect');
        const repoSelector = document.getElementById('repoSelector');
        
        // Clear existing options
        repoSelect.innerHTML = '<option value="" data-en="Choose a repository..." data-ar="اختر مستودعاً...">Choose a repository...</option>';
        
        // Add repository options
        this.githubRepos.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.id;
            option.textContent = `${repo.name} (${repo.language})`;
            option.dataset.repo = JSON.stringify(repo);
            repoSelect.appendChild(option);
        });
        
        // Show the selector
        repoSelector.style.display = 'block';
    }

    selectRepository(repoId) {
        if (!repoId) return;
        
        const repoSelect = document.getElementById('repoSelect');
        const selectedOption = repoSelect.querySelector(`option[value="${repoId}"]`);
        
        if (selectedOption) {
            const repo = JSON.parse(selectedOption.dataset.repo);
            
            // Auto-populate form fields
            document.getElementById('projectName').value = repo.name;
            document.getElementById('projectLink').value = repo.html_url;
            document.getElementById('projectDescription').value = repo.description || '';
            
            // Update creator name if not already set
            const creatorField = document.getElementById('creatorName');
            if (!creatorField.value && this.githubUser) {
                creatorField.value = this.githubUser.name || this.githubUser.login;
            }
            
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Repository information loaded!' 
                    : 'تم تحميل معلومات المستودع!'
            );
        }
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = {
            id: Date.now().toString(),
            name: formData.get('projectName'),
            creator: formData.get('creatorName'),
            link: formData.get('projectLink'),
            description: formData.get('projectDescription'),
            image: null,
            submittedAt: new Date().toISOString()
        };

        // Handle image upload
        const imageFile = formData.get('projectImage');
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                projectData.image = e.target.result;
                this.addProject(projectData);
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.addProject(projectData);
        }
    }

    addProject(projectData) {
        this.projects.unshift(projectData); // Add to beginning
        localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
        this.renderProjects();
        this.resetForm();
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project submitted successfully!' 
                : 'تم تقديم المشروع بنجاح!'
        );
    }

    resetForm() {
        document.getElementById('submissionForm').reset();
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '';

        if (this.projects.length === 0) {
            grid.innerHTML = `
                <div class="no-projects" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📁</div>
                    <p>${this.currentLanguage === 'en' 
                        ? 'No projects submitted yet. Be the first to share your AI innovation!' 
                        : 'لم يتم تقديم أي مشاريع بعد. كن أول من يشارك ابتكاره في الذكاء الاصطناعي!'}</p>
                </div>
            `;
            return;
        }

        this.projects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            grid.appendChild(projectCard);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const imageHtml = project.image 
            ? `<img src="${project.image}" alt="${project.name}" />`
            : `<div class="default-icon">🤖</div>`;

        // Check if it's a GitHub project
        const isGitHubProject = project.link && project.link.includes('github.com');
        const githubIcon = isGitHubProject ? '<span class="github-badge">🐙</span>' : '';

        card.innerHTML = `
            <div class="project-image">
                ${imageHtml}
                ${githubIcon}
            </div>
            <div class="project-content">
                <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                <p class="project-creator">${this.currentLanguage === 'en' ? 'By' : 'بواسطة'} ${this.escapeHtml(project.creator)}</p>
                <p class="project-description">${this.escapeHtml(project.description)}</p>
                <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link">
                    ${this.currentLanguage === 'en' ? 'View Project' : 'عرض المشروع'}
                </a>
            </div>
        `;

        return card;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addSampleProjects() {
        // Add sample projects if none exist
        if (this.projects.length === 0) {
            const sampleProjects = [
                {
                    id: '1',
                    name: 'AI-Powered Image Recognition',
                    creator: 'Sarah Ahmed',
                    link: 'https://github.com/sarah-ahmed/ai-image-recognition',
                    description: 'An advanced machine learning model that can identify and classify objects in images with 95% accuracy. Built using TensorFlow and Python.',
                    image: null,
                    submittedAt: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: '2',
                    name: 'Smart Chatbot Assistant',
                    creator: 'Mohammed Al-Rashid',
                    link: 'https://github.com/mohammed-rashid/smart-chatbot',
                    description: 'A conversational AI assistant that can help users with various tasks including scheduling, information retrieval, and customer support.',
                    image: null,
                    submittedAt: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: '3',
                    name: 'Predictive Analytics Dashboard',
                    creator: 'Fatima Hassan',
                    link: 'https://github.com/fatima-hassan/predictive-dashboard',
                    description: 'A comprehensive dashboard that uses machine learning to predict market trends and provide actionable insights for business decisions.',
                    image: null,
                    submittedAt: new Date(Date.now() - 259200000).toISOString()
                }
            ];

            this.projects = sampleProjects;
            localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
            this.renderProjects();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProjectSubmissionApp();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading state to form submission
    const form = document.getElementById('submissionForm');
    if (form) {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.style.opacity = '0.6';
            submitBtn.style.pointerEvents = 'none';
            
            setTimeout(() => {
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
            }, 2000);
        });
    }
});
