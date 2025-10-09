// Professional AI Association Project Gallery - SUPABASE INTEGRATED (FIXED)
class AIProjectGallery {
    constructor() {
        console.log('Initializing AI Project Gallery...');

        // 🛑 IMPORTANT: Replace these with your actual Supabase details
        const SUPABASE_URL = 'https://rjsiyhwuxuiyqbmvabza.supabase.co'; 
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc2l5aHd1eHVpeXFibXZhYnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODk4MjQsImV4cCI6MjA3Mzk2NTgyNH0.GZ5Yt7PgrftNCEXJQBXb5GA_RAtfnpHElUnfyz7qinc';

        // 1. Initialize Supabase Client
        this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Initialize data from Local Storage
        this.projects = JSON.parse(localStorage.getItem('aiAssociationProjects')) || [];
        this.normalizeProjectEmails(); // Keep this for existing data consistency

        this.currentLanguage = localStorage.getItem('aiAssociationLanguage') || 'en';
        this.currentTheme = localStorage.getItem('aiAssociationTheme') || 'light';
        this.currentMember = JSON.parse(localStorage.getItem('aiAssociationMember')) || null;
        
        this.init();
    }
    
    // Ensures all stored project emails are lowercase for filtering
    normalizeProjectEmails() {
        let needsUpdate = false;
        
        this.projects = this.projects.map(project => {
            if (project.memberEmail) {
                const normalizedEmail = project.memberEmail.toLowerCase();
                
                if (project.memberEmail !== normalizedEmail) {
                    project.memberEmail = normalizedEmail;
                    needsUpdate = true;
                }
            }
            return project;
        });

        if (needsUpdate) {
            console.log('Normalized project emails in local storage.');
            localStorage.setItem('aiAssociationProjects', JSON.stringify(this.projects));
        }
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        this.renderProjects();
        this.checkCurrentPage(); 
        // 🛑 NEW: Update portal title on init if a member is already logged in
        this.updateMemberPortalTitle(); 
    }

    setupEventListeners() {
        // ... (existing event listeners) ...
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('languageToggle').addEventListener('click', () => this.toggleLanguage());
        document.querySelectorAll('.nav-link, .add-project-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        document.getElementById('membershipForm').addEventListener('submit', (e) => this.handleMembershipVerification(e));
        
        const submissionForm = document.getElementById('submissionForm');
        if (submissionForm) {
            submissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!this.validateForm()) {
                    this.resetSubmitButton(); 
                    return;
                }
                
                const editingProjectId = submissionForm.getAttribute('data-editing-project-id'); 

                if (editingProjectId) {
                    this.handleProjectUpdate(editingProjectId);
                } else {
                    this.handleProjectSubmission(); 
                }
            });
        }
        
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

    handleNavigation(e) {
        e.preventDefault();
        
        const link = e.target.closest('[data-page]');
        const page = link ? link.getAttribute('data-page') : null;
        
        if (page) {
            this.navigateToPage(page);
        }
    }

    navigateToPage(page) {
        const pages = ['galleryPage', 'membershipPage', 'memberPortalPage'];
        pages.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
        
        if (page === 'gallery') {
            const galleryPage = document.getElementById('galleryPage');
            if (galleryPage) galleryPage.style.display = 'block';
            this.renderProjects();
        } else if (page === 'membership') {
            const membershipPage = document.getElementById('membershipPage');
            if (membershipPage) membershipPage.style.display = 'block';
            this.clearMembershipForm();
        } else if (page === 'member-portal') {
            const portalPage = document.getElementById('memberPortalPage');
            if (this.currentMember && portalPage) {
                portalPage.style.display = 'block';
                this.renderMyProjects();
                this.updateMemberPortalTitle(); // 🛑 Ensure title updates on navigation too
            } else {
                this.navigateToPage('membership');
            }
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('aiAssociationTheme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
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
            if (enText && arText) {
                element.textContent = this.currentLanguage === 'en' ? enText : arText;
            }
        });
        // 🛑 NEW: Re-update portal title after language change
        this.updateMemberPortalTitle(); 
    }

    // --- Membership Verification - Supabase Logic ---

    async handleMembershipVerification(e) {
        e.preventDefault();

        const email = document.getElementById('memberEmail').value.trim().toLowerCase();
        const phone = document.getElementById('memberPhone').value.trim();
        
        const form = document.getElementById('membershipForm');
        const verifyBtn = form ? form.querySelector('.btn-primary') : null;

        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = this.currentLanguage === 'en' ? 'Verifying...' : 'جاري التحقق...';
        }

        const query = this.supabase
            .from('members')
            .select('email, phone, full_name, payment_status') 
            .or(`email.eq.${email},phone.eq.${phone}`)
            .eq('payment_status', 'completed') 
            .limit(1);

        const { data, error } = await query;
        
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = this.currentLanguage === 'en' ? 'Verify Membership' : 'التحقق من العضوية';
        }

        if (error) {
            console.error('Supabase Error:', error);
            this.showNotification(
                this.currentLanguage === 'en' ? 'Database connection error. Try again.' : 'خطأ في الاتصال بقاعدة البيانات. حاول مرة أخرى.',
                false // Indicate failure for color
            );
            return;
        }

        const verifiedMember = data.length > 0 ? data[0] : null;

        if (verifiedMember) {
            this.currentMember = {
                email: verifiedMember.email.toLowerCase(), 
                name: verifiedMember.full_name, // Assumes 'full_name' is the column name for the user's name
                phone: verifiedMember.phone
            };
            localStorage.setItem('aiAssociationMember', JSON.stringify(this.currentMember));
            
            this.showNotification(
                this.currentLanguage === 'en' 
                ? `Welcome back, ${verifiedMember.full_name}! You are verified.` 
                : `مرحباً بعودتك، ${verifiedMember.full_name}! تم التحقق.`,
                true // Indicate success for color
            );
            
            this.renderMyProjects(); 
            this.navigateToPage('member-portal');
            this.updateMemberPortalTitle(); // 🛑 Update title after successful login
        } else {
            this.currentMember = null;
            localStorage.removeItem('aiAssociationMember');

            this.showNotification(
                this.currentLanguage === 'en' 
                ? 'Verification failed. Membership details not found or payment incomplete.' 
                : 'فشل التحقق. لم يتم العثور على التفاصيل أو الدفع غير مكتمل.',
                false // Indicate failure for color
            );
             this.updateMemberPortalTitle(); // 🛑 Reset title if login fails
        }
    }

    clearMembershipForm() {
        const form = document.getElementById('membershipForm');
        if (form) form.reset();
    }

    getFormData() {
        return {
            name: document.getElementById('projectName').value.trim(),
            creator: document.getElementById('creatorName').value.trim(),
            link: document.getElementById('projectLink').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            submittedAt: new Date().toISOString(),
            memberEmail: this.currentMember ? this.currentMember.email.toLowerCase() : '' 
        };
    }

    handleProjectSubmission() {
        const formData = this.getFormData();

        if (!this.currentMember || !formData.name) { 
            this.resetSubmitButton();
            return;
        }

        const existingProject = this.projects.find(project => 
            project.name.toLowerCase() === formData.name.toLowerCase() && 
            project.creator.toLowerCase() === formData.creator.toLowerCase() &&
            project.memberEmail === formData.memberEmail 
        );
        
        if (existingProject) {
            this.showNotification(
                this.currentLanguage === 'en' 
                    ? 'You have already submitted a project with this name!' 
                    : 'لقد قمت بتقديم مشروع بهذا الاسم من قبل!',
                false // Indicate failure for color
            );
            this.resetSubmitButton();
            return;
        }

        formData.id = Date.now().toString();
        this.addProject(formData);
    }

    handleProjectUpdate(projectId) {
        const updatedData = this.getFormData();
        
        if (!updatedData.name) {
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
        this.resetForm(); 
        
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project updated successfully!' 
                : 'تم تحديث المشروع بنجاح!',
            true // Indicate success for color
        );
    }

    validateForm() {
        const formData = this.getFormData();
        const submitBtn = document.querySelector('#submissionForm .btn-primary');
        if (!submitBtn) return false;
        
        if (!this.currentMember) {
            this.showNotification(this.currentLanguage === 'en' ? 'Please verify your membership first!' : 'يرجى التحقق من العضوية أولاً!', false);
            this.resetSubmitButton();
            return false;
        }

        if (!formData.name || !formData.creator || !formData.link || !formData.description) {
            this.showNotification(this.currentLanguage === 'en' ? 'Please fill in all required fields!' : 'يرجى ملء جميع الحقول المطلوبة!', false);
            this.resetSubmitButton();
            return false;
        }

        submitBtn.disabled = true; 
        
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
        this.resetForm(); 
        
        this.showNotification(
            this.currentLanguage === 'en' 
                ? 'Project submitted successfully! 🎉' 
                : 'تم تقديم المشروع بنجاح! 🎉',
            true // Indicate success for color
        );
    }

    deleteProject(projectId) {
        // IMPORTANT: Replace confirm() with a custom modal if possible in a real app
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
                    : 'تم حذف المشروع بنجاح! 🗑️',
                true // Indicate success for color
            );
        }
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        document.getElementById('projectName').value = project.name;
        document.getElementById('creatorName').value = project.creator;
        document.getElementById('projectLink').value = project.link;
        document.getElementById('projectDescription').value = project.description;
        
        const submissionForm = document.getElementById('submissionForm');
        if (submissionForm) submissionForm.setAttribute('data-editing-project-id', projectId);
        
        this.resetSubmitButton(); 
        
        if (submissionForm) submissionForm.scrollIntoView({ behavior: 'smooth' });
    }

    resetSubmitButton() {
        const submitBtn = document.querySelector('#submissionForm .btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            const form = document.getElementById('submissionForm');
            
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
            
            form.removeAttribute('data-editing-project-id'); 
        }
        
        this.resetSubmitButton();
    }

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

        if (!this.currentMember || !this.currentMember.email) {
            totalProjectsEl.textContent = '0';
            myProjectsGrid.style.display = 'none';
            noProjectsMessage.style.display = 'block';
            return;
        }

        const memberEmail = this.currentMember.email.toLowerCase();
        
        const memberProjects = this.projects.filter(project => 
            project.memberEmail && project.memberEmail.toLowerCase() === memberEmail
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

    // 🛑 UPDATED: Function to update the Member Portal title
    updateMemberPortalTitle() {
        const memberPortalTitleEl = document.getElementById('memberPortalTitle'); // Targets the H2 element
        if (memberPortalTitleEl) {
            if (this.currentMember && this.currentMember.name) {
                memberPortalTitleEl.textContent = this.currentLanguage === 'en' 
                    ? `Welcome, ${this.currentMember.name}!` 
                    : `مرحباً، ${this.currentMember.name}!`;
            } else {
                memberPortalTitleEl.textContent = this.currentLanguage === 'en' 
                    ? 'Member Portal' 
                    : 'بوابة الأعضاء';
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 🛑 UPDATED: showNotification now accepts a success flag to change the color
    showNotification(message, success = true) {
        const notification = document.createElement('div');
        const bgColor = success 
            ? 'linear-gradient(135deg, #2196F3, #03A9F4)' // Blue gradient for success/general
            : 'linear-gradient(135deg, #f44336, #ff9800)'; // Red/Orange gradient for failure/error
            
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            ${this.currentLanguage === 'en' ? 'right: 20px;' : 'left: 20px;'}
            background: ${bgColor}; 
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            max-width: 80%;
            text-align: center;
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
    // Check if the Supabase client library is available
    if (typeof supabase === 'undefined') {
        console.error("Supabase library not loaded. Please ensure the script tag is included.");
        return;
    }
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
