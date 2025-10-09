// JavaScript for Project Submission Page

class ProjectSubmissionApp {
    constructor() {
        console.log('Initializing ProjectSubmissionApp...');
        this.projects = JSON.parse(localStorage.getItem('aiAssociationProjects')) || [];
        console.log('Loaded projects from localStorage:', this.projects);
        
        // Clear any sample projects that might have been added
        this.projects = this.projects.filter(project => 
            !['1', '2'].includes(project.id) // Remove sample projects
        );
        
        // Save the cleaned projects back to localStorage
        localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
        console.log('Projects after removing samples:', this.projects);
        
        this.currentLanguage = localStorage.getItem('aiAssociationLanguage') || 'en';
        this.currentTheme = localStorage.getItem('aiAssociationTheme') || 'light';
        this.githubUser = JSON.parse(localStorage.getItem('aiAssociationGitHubUser')) || null;
        this.githubRepos = JSON.parse(localStorage.getItem('aiAssociationGitHubRepos')) || [];
        
        // GitHub OAuth configuration
        this.githubClientId = 'Ov23liBq2fXk8p8W4H8N'; // Your GitHub OAuth App Client ID
        this.githubRedirectUri = window.location.origin + window.location.pathname;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        this.checkGitHubAuth();
        this.renderProjects();
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

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Event delegation for My Projects page buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const button = e.target.closest('.action-btn');
                const action = button.getAttribute('data-action');
                const projectId = button.getAttribute('data-project-id');
                
                console.log('Button clicked:', action, 'for project:', projectId);
                
                if (action === 'edit') {
                    this.editProject(projectId);
                } else if (action === 'delete') {
                    this.deleteProject(projectId);
                }
            }
        });

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
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Processing GitHub authentication...' 
                    : 'جاري معالجة تسجيل الدخول إلى GitHub...'
            );
            
            // Try to use backend proxy first, fallback to direct API
            let authData;
            
            try {
                // Use backend proxy for secure token exchange
                const proxyResponse = await fetch('http://localhost:3001/api/github/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code })
                });
                
                if (proxyResponse.ok) {
                    authData = await proxyResponse.json();
                } else {
                    throw new Error('Proxy server not available');
                }
            } catch (proxyError) {
                console.log('Using direct GitHub API (less secure)');
                
                // Fallback to direct API (less secure, for demo purposes)
                const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        client_id: this.githubClientId,
                        client_secret: '', // Empty for demo
                        code: code
                    })
                });
                
                if (!tokenResponse.ok) {
                    throw new Error('Failed to exchange code for token');
                }
                
                const tokenData = await tokenResponse.json();
                
                if (tokenData.error) {
                    throw new Error(tokenData.error_description || 'Authentication failed');
                }
                
                // Get user data from GitHub API
                const userResponse = await fetch('https://api.github.com/user', {
                    headers: {
                        'Authorization': `token ${tokenData.access_token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                
                const userData = await userResponse.json();
                
                authData = {
                    accessToken: tokenData.access_token,
                    user: userData
                };
            }
            
            this.githubUser = {
                ...authData.user,
                accessToken: authData.accessToken
            };
            
            localStorage.setItem('aiAssociationGitHubUser', JSON.stringify(this.githubUser));
            this.updateGitHubUI();
            
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? `Welcome, ${authData.user.name || authData.user.login}!` 
                    : `مرحباً، ${authData.user.name || authData.user.login}!`
            );
            
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
        if (!this.githubUser || !this.githubUser.accessToken) return;
        
        const fetchRepoBtn = document.getElementById('fetchRepoBtn');
        const originalText = fetchRepoBtn.textContent;
        
        try {
            fetchRepoBtn.disabled = true;
            fetchRepoBtn.textContent = this.currentLanguage === 'en' ? 'Loading...' : 'جاري التحميل...';
            
            // Fetch real repositories from GitHub API
            const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
                headers: {
                    'Authorization': `token ${this.githubUser.accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!reposResponse.ok) {
                throw new Error('Failed to fetch repositories');
            }
            
            const repos = await reposResponse.json();
            
            // Filter out forked repositories and sort by stars
            const filteredRepos = repos
                .filter(repo => !repo.fork)
                .sort((a, b) => b.stargazers_count - a.stargazers_count);
            
            this.githubRepos = filteredRepos;
            localStorage.setItem('aiAssociationGitHubRepos', JSON.stringify(this.githubRepos));
            
            this.populateRepositorySelector();
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? `Found ${filteredRepos.length} repositories!` 
                    : `تم العثور على ${filteredRepos.length} مستودع!`
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
        const editingProjectId = e.target.dataset.editingProjectId;
        
        const projectData = {
            id: editingProjectId || Date.now().toString(),
            name: formData.get('projectName'),
            creator: formData.get('creatorName'),
            link: formData.get('projectLink'),
            description: formData.get('projectDescription'),
            image: null,
            submittedAt: editingProjectId ? 
                this.projects.find(p => p.id === editingProjectId)?.submittedAt || new Date().toISOString() :
                new Date().toISOString()
        };

        // Handle image upload
        const imageFile = formData.get('projectImage');
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                projectData.image = e.target.result;
                this.processProjectSubmission(projectData, editingProjectId);
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.processProjectSubmission(projectData, editingProjectId);
        }
    }

    processProjectSubmission(projectData, editingProjectId) {
        if (editingProjectId) {
            this.updateProject(projectData);
        } else {
            this.addProject(projectData);
        }
    }

    updateProject(projectData) {
        const projectIndex = this.projects.findIndex(p => p.id === projectData.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = projectData;
            localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
            this.renderProjects();
            this.resetForm();
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Project updated successfully!' 
                    : 'تم تحديث المشروع بنجاح!'
            );
        }
    }

    addProject(projectData) {
        console.log('Adding new project:', projectData);
        this.projects.unshift(projectData); // Add to beginning
        console.log('Projects array after adding:', this.projects);
        localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
        
        // Verify localStorage
        const saved = localStorage.getItem('aiAssociationProjects');
        console.log('Saved to localStorage:', saved);
        
        this.renderProjects();
        this.resetForm();
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project submitted successfully!' 
                : 'تم تقديم المشروع بنجاح!'
        );
    }

    // Navigation Methods
    handleNavigation(e) {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        this.navigateToPage(page);
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page);
        const submitPage = document.querySelector('.main:not(.my-projects-page)');
        const myProjectsPage = document.getElementById('myProjectsPage');
        const navLinks = document.querySelectorAll('.nav-link');

        console.log('Submit page element:', submitPage);
        console.log('My projects page element:', myProjectsPage);

        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Show/hide pages
        if (page === 'my-projects') {
            submitPage.style.display = 'none';
            myProjectsPage.style.display = 'block';
            console.log('About to render my projects. Current projects:', this.projects);
            console.log('My projects grid element:', document.getElementById('myProjectsGrid'));
            this.renderMyProjects();
        } else {
            submitPage.style.display = 'block';
            myProjectsPage.style.display = 'none';
        }
    }

    // My Projects Methods
    renderMyProjects() {
        console.log('Rendering my projects. Total projects:', this.projects.length);
        console.log('Projects:', this.projects);
        
        const myProjectsGrid = document.getElementById('myProjectsGrid');
        const noProjectsMessage = document.getElementById('noProjectsMessage');
        const totalProjectsEl = document.getElementById('totalProjects');
        const githubProjectsEl = document.getElementById('githubProjects');

        // Calculate stats
        const totalProjects = this.projects.length;
        const githubProjects = this.projects.filter(project => 
            project.link && project.link.includes('github.com')
        ).length;

        totalProjectsEl.textContent = totalProjects;
        githubProjectsEl.textContent = githubProjects;

        // Clear grid
        myProjectsGrid.innerHTML = '';

        if (totalProjects === 0) {
            noProjectsMessage.style.display = 'block';
            myProjectsGrid.style.display = 'none';
        } else {
            noProjectsMessage.style.display = 'none';
            myProjectsGrid.style.display = 'grid';

            this.projects.forEach(project => {
                console.log('Creating card for project:', project);
                const projectCard = this.createMyProjectCard(project);
                myProjectsGrid.appendChild(projectCard);
            });
        }
    }

    createMyProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'my-project-card';
        
        const isGitHubProject = project.link && project.link.includes('github.com');
        const githubBadge = isGitHubProject ? '<span class="github-badge-small">🐙 GitHub</span>' : '';
        
        const submittedDate = new Date(project.submittedAt).toLocaleDateString(
            this.currentLanguage === 'en' ? 'en-US' : 'ar-SA'
        );

        card.innerHTML = `
            <div class="project-header">
                <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                <div class="project-actions">
                    <button class="action-btn edit-btn" data-action="edit" data-project-id="${project.id}" title="${this.currentLanguage === 'en' ? 'Edit Project' : 'تحرير المشروع'}">
                        ✏️
                    </button>
                    <button class="action-btn delete-btn" data-action="delete" data-project-id="${project.id}" title="${this.currentLanguage === 'en' ? 'Delete Project' : 'حذف المشروع'}">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="project-info">
                <p class="project-creator">${this.currentLanguage === 'en' ? 'By' : 'بواسطة'} ${this.escapeHtml(project.creator)}</p>
                <p class="project-description">${this.escapeHtml(project.description)}</p>
            </div>
            <div class="project-meta">
                <div class="project-date">
                    📅 ${submittedDate}
                </div>
                ${githubBadge}
            </div>
        `;

        return card;
    }

    editProject(projectId) {
        console.log('Edit project called with ID:', projectId);
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            console.error('Project not found with ID:', projectId);
            return;
        }

        console.log('Found project:', project);

        // Fill form with project data
        document.getElementById('projectName').value = project.name;
        document.getElementById('creatorName').value = project.creator;
        document.getElementById('projectLink').value = project.link;
        document.getElementById('projectDescription').value = project.description;
        
        // Store project ID for update
        document.getElementById('submissionForm').dataset.editingProjectId = projectId;
        
        // Change submit button text
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = this.currentLanguage === 'en' ? 'Update Project' : 'تحديث المشروع';
        
        // Scroll to form
        document.getElementById('submissionForm').scrollIntoView({ behavior: 'smooth' });
        
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project loaded for editing' 
                : 'تم تحميل المشروع للتحرير'
        );
    }

    deleteProject(projectId) {
        console.log('Delete project called with ID:', projectId);
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            console.error('Project not found with ID:', projectId);
            return;
        }

        console.log('Found project to delete:', project);

        const confirmMessage = this.currentLanguage === 'en' 
            ? `Are you sure you want to delete "${project.name}"?` 
            : `هل أنت متأكد من حذف "${project.name}"؟`;
            
        if (confirm(confirmMessage)) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
            this.renderMyProjects();
            this.renderProjects();
            
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Project deleted successfully' 
                    : 'تم حذف المشروع بنجاح'
            );
        }
    }

    resetForm() {
        const form = document.getElementById('submissionForm');
        form.reset();
        delete form.dataset.editingProjectId;
        
        // Reset submit button text
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = this.currentLanguage === 'en' ? 'Submit Project' : 'تقديم المشروع';
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
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ProjectSubmissionApp();
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
