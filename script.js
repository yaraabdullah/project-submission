// Professional AI Association Project Gallery
class AIProjectGallery {
    constructor() {
        console.log('Initializing AI Project Gallery...');

        // Initialize data
        this.projects = JSON.parse(localStorage.getItem('aiAssociationProjects')) || [];
        this.currentLanguage = localStorage.getItem('aiAssociationLanguage') || 'en';
        this.currentTheme = localStorage.getItem('aiAssociationTheme') || 'light';
        this.currentMember = JSON.parse(localStorage.getItem('aiAssociationMember')) || null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        this.renderProjects(); // Render gallery projects
        this.checkCurrentPage(); // Determines starting page and renders My Projects if logged in
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
        
        // Project submission form (Handles both new submission and update)
        const submissionForm = document.getElementById('submissionForm');
        if (submissionForm) {
            submissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Use getAttribute for reliable state check
                const editingProjectId = submissionForm.getAttribute('data-editing-project-id'); 

                if (editingProjectId) {
                    this.handleProjectUpdate(editingProjectId);
                } else {
                    this.handleProjectSubmission(e); 
                }
            });
        }
        
        // Event delegation for project actions (Edit/Delete buttons)
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

    // --- Navigation ---
    
    handleNavigation(e) {
        e.preventDefault();
        
        const link = e.target.closest('[data-page]');
        const page = link ? link.getAttribute('data-page') : null;
        
        if (page) {
            this.navigateToPage(page);
        }
    }

    navigateToPage(page) {
        // Hide all pages
        const pages = ['galleryPage', 'membershipPage', 'memberPortalPage'];
        pages.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
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
    
    // --- Theme & Language Management ---

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

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        localStorage.setItem('aiAssociationLanguage', this.currentLanguage);
        this.applyLanguage();
    }

    applyLanguage() {
        document.documentElement.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', this.currentLanguage);
        
        document.querySelectorAll('[data-en]').forEach(element => {
            const enText = element.getAttribute('data-en');
            const arText = element.getAttribute('data-ar');
            element.textContent = this.currentLanguage === 'en' ? enText : arText;
        });
    }

    // --- Membership Verification ---

    handleMembershipVerification(e) {
        e.preventDefault();
        
        const email = document.getElementById('memberEmail').value.trim();
        const phone = document.getElementById('memberPhone').value.trim();
        
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
        
        this.renderMyProjects(); 
        this.navigateToPage('member-portal');
    }

    clearMembershipForm() {
        document.getElementById('membershipForm').reset();
    }

    // --- Project Submission and Update ---

    getFormData() {
        return {
            name: document.getElementById('projectName').value.trim(),
            creator: document.getElementById('creatorName').value.trim(),
            link: document.getElementById('projectLink').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            submittedAt: new Date().toISOString(),
            memberEmail: this.currentMember.email
        };
    }

    handleProjectSubmission(e) {
        const formData = this.getFormData();

        if (!this.currentMember || !this.validateForm(formData)) {
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
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'You have already submitted a project with this name!' 
                    : 'لقد قمت بتقديم مشروع بهذا الاسم من قبل!'
            );
            this.resetSubmitButton();
            return;
        }

        formData.id = Date.now().toString();
        this.addProject(formData);
    }

    handleProjectUpdate(projectId) {
        const updatedData = this.getFormData();
        
        if (!this.validateForm(updatedData)) {
            this.resetSubmitButton();
            return;
        }

        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            this.resetSubmitButton();
            return;
        }
        
        this.projects[projectIndex] = { 
            ...this.projects[projectIndex], 
            ...updatedData, 
            id: projectId
        };
        
        localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
        
        this.renderProjects();
        this.renderMyProjects();
        this.resetForm(); // Clears form and removes data-editing-project-id
        
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project updated successfully!' 
                : 'تم تحديث المشروع بنجاح!'
        );
    }

    validateForm(formData) {
        const submitBtn = document.querySelector('#submissionForm .btn-primary');
        submitBtn.disabled = true;

        if (!this.currentMember) {
            this.showNotification(this.currentLanguage === 'en' ? 'Please verify your membership first!' : 'يرجى التحقق من العضوية أولاً!');
            return false;
        }

        if (!formData.name || !formData.creator || !formData.link || !formData.description) {
            this.showNotification(this.currentLanguage === 'en' ? 'Please fill in all required fields!' : 'يرجى ملء جميع الحقول المطلوبة!');
            return false;
        }

        // Update button text to show activity
        submitBtn.innerHTML = `
            <div class="spinner"></div>
            <span>${this.currentLanguage === 'en' ? 'Processing...' : 'جاري المعالجة...'}</span>
        `;
        return true;
    }

    addProject(projectData) {
        this.projects.unshift(projectData);
        localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
        
        this.renderProjects();
        this.renderMyProjects();
        this.resetForm(); // Call resetForm after successful operations
        
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project submitted successfully! 🎉' 
                : 'تم تقديم المشروع بنجاح! 🎉'
        );
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
                    ? 'Project deleted successfully! 🗑️' 
                    : 'تم حذف المشروع بنجاح! 🗑️'
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
        
        // Use setAttribute for reliable state setting
        document.getElementById('submissionForm').setAttribute('data-editing-project-id', projectId);
        
        // Change submit button text
        const submitBtn = document.querySelector('#submissionForm .btn-primary');
        submitBtn.innerHTML = `
            <i class="fas fa-save"></i>
            <span>${this.currentLanguage === 'en' ? 'Update Project' : 'تحديث المشروع'}</span>
        `;
        
        // Scroll to form
        document.getElementById('submissionForm').scrollIntoView({ behavior: 'smooth' });
    }

    resetSubmitButton() {
        const submitBtn = document.querySelector('#submissionForm .btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            const form = document.getElementById('submissionForm');
            
            // Check for the attribute to determine the button text
            const isEditing = form && form.getAttribute('data-editing-project-id');
            
            if (isEditing) {
                 submitBtn.innerHTML = `
                    <i class="fas fa-save"></i>
                    <span>${this.currentLanguage === 'en' ? 'Update Project' : 'تحديث المشروع'}</span>
                `;
            } else {
                submitBtn.innerHTML = `
                    <i class="fas fa-paper-plane"></i>
                    <span>${this.currentLanguage === 'en' ? 'Submit Project' : 'تقديم المشروع'}</span>
                `;
            }
        }
    }

    resetForm() {
        const form = document.getElementById('submissionForm');
        if (form) {
            form.reset();
            
            // CRITICAL FIX: Use removeAttribute for reliable state clearing
            form.removeAttribute('data-editing-project-id'); 
        }
        
        this.resetSubmitButton(); 
    }

    // --- Rendering ---

    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        const noProjectsMessage = document.getElementById('noProjectsMessage');
        
        if (!projectsGrid || !noProjectsMessage) return; 
        
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
        const myProjectsGrid = document.getElementById('myProjectsGrid');
        const noProjectsMessage = document.getElementById('noMyProjectsMessage');
        const totalProjectsEl = document.getElementById('totalProjects');
        
        if (!myProjectsGrid || !noProjectsMessage || !totalProjectsEl) return; 

        if (!this.currentMember) {
            totalProjectsEl.textContent = '0';
            myProjectsGrid.style.display = 'none';
            noProjectsMessage.style.display = 'block';
            return;
        }
        
        const memberProjects = this.projects.filter(project => 
            project.memberEmail === this.currentMember.email
        );
        
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
        
        // Includes Edit and Delete buttons with data-project-id
        return `
            <div class="my-project-card fade-in" data-project-id="${project.id}">
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

    // --- Utility Functions ---
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
            ${this.currentLanguage === 'en' ? 'right: 20px;' : 'left: 20px;'}
            background: linear-gradient(135deg, #4CAF50, #8BC34A); 
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = this.currentLanguage === 'en' ? 'slideOutRight 0.3s ease-in' : 'slideOutLeft 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    checkCurrentPage() {
        if (this.currentMember && window.location.hash === '#member-portal') {
            this.navigateToPage('member-portal');
        } else {
             this.navigateToPage('gallery');
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
    /* Spinner for submission button */
    .spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 4px solid white;
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-inline-end: 8px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Notification animations */
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
`;
document.head.appendChild(style);