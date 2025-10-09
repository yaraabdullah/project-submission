// Professional AI Association Project Gallery
class AIProjectGallery {
    constructor() {
        console.log('Initializing AI Project Gallery...');
        
        // Initialize data
        this.projects = JSON.parse(localStorage.getItem('aiAssociationProjects')) || [];
        this.currentLanguage = localStorage.getItem('aiAssociationLanguage') || 'en';
        this.currentTheme = localStorage.getItem('aiAssociationTheme') || 'light';
        this.currentMember = JSON.parse(localStorage.getItem('aiAssociationMember')) || null;
        
        // Membership database removed - using placeholder verification
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        this.renderProjects();
        this.checkCurrentPage();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Language toggle
        document.getElementById('languageToggle').addEventListener('click', () => this.toggleLanguage());
        
        // Navigation
        document.querySelectorAll('.nav-link, .add-project-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Membership form
        document.getElementById('membershipForm').addEventListener('submit', (e) => this.handleMembershipVerification(e));
        
        // Project submission form - SIMPLE APPROACH
        const submissionForm = document.getElementById('submissionForm');
        console.log('Submission form element:', submissionForm);
        if (submissionForm) {
            submissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('FORM SUBMITTED!');
                
                // Get form data
                const name = document.getElementById('projectName').value.trim();
                const creator = document.getElementById('creatorName').value.trim();
                const link = document.getElementById('projectLink').value.trim();
                const description = document.getElementById('projectDescription').value.trim();
                
                console.log('Form data:', { name, creator, link, description });
                
                if (!name || !creator || !link || !description) {
                    alert('Please fill in all fields!');
                    return;
                }
                
                if (!this.currentMember) {
                    alert('Please verify your membership first!');
                    return;
                }
                
                // Create project
                const project = {
                    id: Date.now().toString(),
                    name: name,
                    creator: creator,
                    link: link,
                    description: description,
                    submittedAt: new Date().toISOString(),
                    memberEmail: this.currentMember.email
                };
                
                console.log('Adding project:', project);
                
                // Add to projects array
                this.projects.unshift(project);
                localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
                
                // Update displays
                this.renderProjects();
                this.renderMyProjects();
                
                // Clear form
                submissionForm.reset();
                
                // Show success message
                alert('Project submitted successfully!');
                
                console.log('Project added successfully!');
            });
        } else {
            console.error('Submission form not found!');
        }
        
        // Event delegation for project actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const button = e.target.closest('.action-btn');
                const action = button.getAttribute('data-action');
                const projectId = button.getAttribute('data-project-id');
                
                if (action === 'edit') {
                    this.editProject(projectId);
                } else if (action === 'delete') {
                    this.deleteProject(projectId);
                }
            }
        });
    }

    // Navigation
    handleNavigation(e) {
        e.preventDefault();
        console.log('Navigation clicked, target:', e.target);
        console.log('Target closest:', e.target.closest('[data-page]'));
        
        const link = e.target.closest('[data-page]');
        const page = link ? link.getAttribute('data-page') : null;
        
        console.log('Page to navigate to:', page);
        
        if (page) {
            this.navigateToPage(page);
        } else {
            console.error('No page found for navigation');
        }
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page);
        
        // Hide all pages
        document.getElementById('galleryPage').style.display = 'none';
        document.getElementById('membershipPage').style.display = 'none';
        document.getElementById('memberPortalPage').style.display = 'none';
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
        
        // Show target page
        if (page === 'gallery') {
            document.getElementById('galleryPage').style.display = 'block';
            this.renderProjects();
        } else if (page === 'membership') {
            document.getElementById('membershipPage').style.display = 'block';
            this.clearMembershipForm();
        } else if (page === 'member-portal') {
            if (this.currentMember) {
                document.getElementById('memberPortalPage').style.display = 'block';
                this.renderMyProjects();
            } else {
                this.navigateToPage('membership');
            }
        }
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('aiAssociationTheme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Language Management
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        localStorage.setItem('aiAssociationLanguage', this.currentLanguage);
        this.applyLanguage();
    }

    applyLanguage() {
        document.documentElement.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', this.currentLanguage);
        
        // Update all elements with data attributes
        document.querySelectorAll('[data-en]').forEach(element => {
            const enText = element.getAttribute('data-en');
            const arText = element.getAttribute('data-ar');
            element.textContent = this.currentLanguage === 'en' ? enText : arText;
        });
    }

    // Membership Verification (Placeholder - Not Functional)
    handleMembershipVerification(e) {
        e.preventDefault();
        
        const email = document.getElementById('memberEmail').value.trim();
        const phone = document.getElementById('memberPhone').value.trim();
        
        console.log('Membership verification (placeholder) for:', email, phone);
        
        // For now, just create a placeholder member and proceed
        // In the future, this would connect to a real database
        const placeholderMember = {
            email: email || 'placeholder@ai-association.com',
            phone: phone || '+1234567890',
            name: email ? email.split('@')[0] : 'Member'
        };
        
        this.currentMember = placeholderMember;
        localStorage.setItem('aiAssociationMember', JSON.stringify(placeholderMember));
        
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Welcome to the member portal!' 
                : 'مرحباً بك في بوابة الأعضاء!'
        );
        
        this.navigateToPage('member-portal');
    }

    // Membership error handling removed since verification is placeholder

    clearMembershipForm() {
        document.getElementById('membershipForm').reset();
    }

    // Project Management
    handleProjectSubmission(e) {
        e.preventDefault();
        
        console.log('=== FORM SUBMISSION STARTED ===');
        console.log('Project submission form submitted');
        console.log('Current member:', this.currentMember);
        
        // Prevent multiple submissions
        const submitBtn = document.querySelector('.btn-primary');
        if (submitBtn.disabled) {
            console.log('Form already being submitted, ignoring');
            return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div class="spinner"></div>
            <span>${this.currentLanguage === 'en' ? 'Submitting...' : 'جاري التقديم...'}</span>
        `;
        
        if (!this.currentMember) {
            console.error('No current member found');
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Please verify your membership first!' 
                    : 'يرجى التحقق من العضوية أولاً!'
            );
            this.resetSubmitButton();
            return;
        }
        
        const formData = {
            name: document.getElementById('projectName').value.trim(),
            creator: document.getElementById('creatorName').value.trim(),
            link: document.getElementById('projectLink').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            submittedAt: new Date().toISOString(),
            memberEmail: this.currentMember.email
        };
        
        console.log('Form data:', formData);
        
        // Check if all required fields are filled
        if (!formData.name || !formData.creator || !formData.link || !formData.description) {
            console.error('Missing required fields');
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Please fill in all required fields!' 
                    : 'يرجى ملء جميع الحقول المطلوبة!'
            );
            this.resetSubmitButton();
            return;
        }
        
        // Check for duplicate projects
        const existingProject = this.projects.find(project => 
            project.name.toLowerCase() === formData.name.toLowerCase() && 
            project.creator.toLowerCase() === formData.creator.toLowerCase() &&
            project.memberEmail === formData.memberEmail
        );
        
        if (existingProject) {
            console.error('Duplicate project found');
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'You have already submitted a project with this name!' 
                    : 'لقد قمت بتقديم مشروع بهذا الاسم من قبل!'
            );
            this.resetSubmitButton();
            return;
        }
        
        // Generate unique ID
        formData.id = Date.now().toString();
        
        console.log('Submitting project:', formData);
        
        this.addProject(formData);
        console.log('=== FORM SUBMISSION COMPLETED ===');
    }

    addProject(projectData) {
        console.log('addProject called with:', projectData);
        
        this.projects.unshift(projectData);
        localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
        
        console.log('Projects after adding:', this.projects);
        
        this.renderProjects();
        this.renderMyProjects();
        this.resetForm();
        
        console.log('Showing success notification');
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project submitted successfully!' 
                : 'تم تقديم المشروع بنجاح!'
        );
    }

    updateProject(projectId, updatedData) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...updatedData };
            localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
            
            this.renderProjects();
            this.renderMyProjects();
            this.resetForm();
            
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Project updated successfully!' 
                    : 'تم تحديث المشروع بنجاح!'
            );
        }
    }

    deleteProject(projectId) {
        if (confirm(this.currentLanguage === 'en' 
            ? 'Are you sure you want to delete this project?' 
            : 'هل أنت متأكد من أنك تريد حذف هذا المشروع؟')) {
            
            this.projects = this.projects.filter(p => p.id !== projectId);
            localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
            
            this.renderProjects();
            this.renderMyProjects();
            
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'Project deleted successfully!' 
                    : 'تم حذف المشروع بنجاح!'
            );
        }
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        // Fill form with project data
        document.getElementById('projectName').value = project.name;
        document.getElementById('creatorName').value = project.creator;
        document.getElementById('projectLink').value = project.link;
        document.getElementById('projectDescription').value = project.description;
        
        // Store project ID for update
        document.getElementById('submissionForm').dataset.editingProjectId = projectId;
        
        // Change submit button text
        const submitBtn = document.querySelector('.btn-primary');
        submitBtn.innerHTML = `
            <i class="fas fa-save"></i>
            <span>${this.currentLanguage === 'en' ? 'Update Project' : 'تحديث المشروع'}</span>
        `;
        
        // Scroll to form
        document.getElementById('submissionForm').scrollIntoView({ behavior: 'smooth' });
    }

    resetSubmitButton() {
        const submitBtn = document.querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <i class="fas fa-paper-plane"></i>
                <span>${this.currentLanguage === 'en' ? 'Submit Project' : 'تقديم المشروع'}</span>
            `;
        }
    }

    resetForm() {
        console.log('Resetting form');
        const form = document.getElementById('submissionForm');
        if (form) {
            form.reset();
            delete form.dataset.editingProjectId;
            console.log('Form reset successfully');
        } else {
            console.error('Form not found for reset');
        }
        
        this.resetSubmitButton();
    }

    // Rendering
    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        const noProjectsMessage = document.getElementById('noProjectsMessage');
        
        if (this.projects.length === 0) {
            projectsGrid.style.display = 'none';
            noProjectsMessage.style.display = 'block';
        } else {
            projectsGrid.style.display = 'grid';
            noProjectsMessage.style.display = 'none';
            
            projectsGrid.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');
        }
    }

    createProjectCard(project) {
        const submittedDate = new Date(project.submittedAt).toLocaleDateString(
            this.currentLanguage === 'en' ? 'en-US' : 'ar-SA'
        );
        
        return `
            <div class="project-card fade-in">
                <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                <p class="project-creator">
                    <i class="fas fa-user"></i> ${this.escapeHtml(project.creator)}
                </p>
                <p class="project-description">${this.escapeHtml(project.description)}</p>
                <div class="project-meta">
                    <a href="${project.link}" target="_blank" class="project-link">
                        <i class="fas fa-external-link-alt"></i> 
                        ${this.currentLanguage === 'en' ? 'View Project' : 'عرض المشروع'}
                    </a>
                    <span class="project-date">
                        <i class="fas fa-calendar"></i> ${submittedDate}
                    </span>
                </div>
            </div>
        `;
    }

    renderMyProjects() {
        console.log('Rendering my projects');
        console.log('Current member:', this.currentMember);
        console.log('All projects:', this.projects);
        
        const myProjectsGrid = document.getElementById('myProjectsGrid');
        const noProjectsMessage = document.getElementById('noMyProjectsMessage');
        const totalProjectsEl = document.getElementById('totalProjects');
        
        if (!this.currentMember) {
            console.log('No current member, showing empty state');
            totalProjectsEl.textContent = '0';
            myProjectsGrid.style.display = 'none';
            noProjectsMessage.style.display = 'block';
            return;
        }
        
        // Filter projects for current member
        const memberProjects = this.projects.filter(project => 
            project.memberEmail === this.currentMember.email
        );
        
        console.log('Member projects:', memberProjects);
        
        totalProjectsEl.textContent = memberProjects.length;
        
        if (memberProjects.length === 0) {
            myProjectsGrid.style.display = 'none';
            noProjectsMessage.style.display = 'block';
        } else {
            myProjectsGrid.style.display = 'grid';
            noProjectsMessage.style.display = 'none';
            
            myProjectsGrid.innerHTML = memberProjects.map(project => this.createMyProjectCard(project)).join('');
        }
    }

    createMyProjectCard(project) {
        const submittedDate = new Date(project.submittedAt).toLocaleDateString(
            this.currentLanguage === 'en' ? 'en-US' : 'ar-SA'
        );
        
        return `
            <div class="my-project-card fade-in">
                <div class="project-header">
                    <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                    <div class="project-actions">
                        <button class="action-btn edit-btn" data-action="edit" data-project-id="${project.id}" title="${this.currentLanguage === 'en' ? 'Edit Project' : 'تحرير المشروع'}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-action="delete" data-project-id="${project.id}" title="${this.currentLanguage === 'en' ? 'Delete Project' : 'حذف المشروع'}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="project-info">
                    <p class="project-creator">${this.currentLanguage === 'en' ? 'By' : 'بواسطة'} ${this.escapeHtml(project.creator)}</p>
                    <p class="project-description">${this.escapeHtml(project.description)}</p>
                </div>
                <div class="project-meta">
                    <div class="project-date">
                        <i class="fas fa-calendar"></i> ${submittedDate}
                    </div>
                    <a href="${project.link}" target="_blank" class="project-link">
                        <i class="fas fa-external-link-alt"></i> 
                        ${this.currentLanguage === 'en' ? 'View Project' : 'عرض المشروع'}
                    </a>
                </div>
            </div>
        `;
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
            color: var(--text-white);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    checkCurrentPage() {
        // Check if user is already logged in and on member portal
        if (this.currentMember && window.location.hash === '#member-portal') {
            this.navigateToPage('member-portal');
        }
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AIProjectGallery();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);