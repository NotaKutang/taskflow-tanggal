// Render halaman Tasks (parent page)
function renderTasksPage(container) {
    container.innerHTML = `
        <div class="tasks-tabs">
            <button class="tab-btn active" data-tab="logbook">Logbook</button>
            <button class="tab-btn" data-tab="weekly-tasks">Weekly Tasks</button>
        </div>
        
        <div class="tab-content active" id="logbook-tab">
            <!-- Konten logbook akan diisi oleh fungsi renderLogbookPage -->
        </div>
        
        <div class="tab-content" id="weekly-tasks-tab">
            <!-- Konten weekly tasks akan diisi oleh fungsi renderWeeklyTasksPage -->
        </div>
    `;
    
    // Render konten tab awal
    renderLogbookPage(document.getElementById('logbook-tab'));
    
    // Setup tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Update tab aktif
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update konten tab
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`${tab}-tab`).classList.add('active');
            
            // Render konten tab yang dipilih
            if (tab === 'logbook') {
                renderLogbookPage(document.getElementById('logbook-tab'));
            } else if (tab === 'weekly-tasks') {
                renderWeeklyTasksPage(document.getElementById('weekly-tasks-tab'));
            }
        });
    });
}

// Render halaman Logbook
function renderLogbookPage(container) {
    // Tambahkan deskripsi logbook
    const logbookDescription = document.createElement('div');
    logbookDescription.className = 'logbook-description';
    
    // Buat grid logbook
    const logbookGrid = document.createElement('div');
    logbookGrid.className = 'logbook-grid';
    
    // Kosongkan container terlebih dahulu
    container.innerHTML = '';
    container.appendChild(logbookDescription);
    container.appendChild(logbookGrid);
    
    // Render setiap logbook card
    appData.tasks.logbooks.forEach(logbook => {
        const isLocked = logbook.locked;
        
        const logbookCard = document.createElement('div');
        logbookCard.className = `logbook-card ${isLocked ? 'locked' : ''}`;
        logbookCard.setAttribute('data-id', logbook.id);
        logbookCard.setAttribute('data-type', 'logbook');
        
        logbookCard.innerHTML = `
            <h4>${logbook.title}</h4>
            <p>Deadline: ${formatDate(logbook.deadline)}</p>
            <div class="logbook-meta">
                <div class="task-status status-${isLocked ? 'locked' : logbook.status}">
                    ${isLocked ? 'Locked' : 
                      logbook.status === 'completed' ? 'Completed' : 
                      logbook.status === 'overdue' ? 'Overdue' : 'Open'}
                </div>
                ${!isLocked ? 
                    (logbook.status === 'completed' ? 
                        `<button class="btn btn-outline btn-view" data-id="${logbook.id}" data-type="logbook">View</button>` : 
                        `<button class="btn btn-primary btn-upload" data-id="${logbook.id}" data-type="logbook">Upload Task</button>`
                    ) : 
                    `<button class="btn btn-outline" disabled>Locked</button>`
                }
            </div>
        `;
        
        logbookGrid.appendChild(logbookCard);
    });
    
    // Setup event listeners
    setupTaskEventListeners(container);
}

// Render halaman Weekly Tasks - MENTOR COMMENT FULL WIDTH
function renderWeeklyTasksPage(container) {
    // Buat container untuk weekly tasks
    const weeklyTasksList = document.createElement('div');
    weeklyTasksList.className = 'weekly-tasks-list';
    
    // Kosongkan container terlebih dahulu
    container.innerHTML = '';
    container.appendChild(weeklyTasksList);
    
    // Render setiap weekly task card
    appData.tasks.weeklyTasks.forEach(task => {
        // Tentukan status task
        const status = getWeeklyTaskStatus(task);
        const isLocked = task.locked;
        const commentCount = task.commentThread ? task.commentThread.length : 0;
        
        // Potong teks komentar jika terlalu panjang
        const mentorComment = task.comments && status === 'graded' ? 
            (task.comments.length > 50 ? task.comments.substring(0, 50) + '...' : task.comments) : '';
        
        const taskCard = document.createElement('div');
        taskCard.className = `weekly-task-card ${isLocked ? 'locked' : ''}`;
        taskCard.setAttribute('data-id', task.id);
        taskCard.setAttribute('data-type', 'weekly');
        
        taskCard.innerHTML = `
            <!-- KONTEN KIRI: Task Info -->
            <div class="weekly-task-left">
                <div class="weekly-task-info">
                    <h4>${task.title}</h4>
                    <div class="weekly-task-meta">
                        <span><i class="ri-calendar-line"></i> Deadline: ${formatDate(task.deadline)}</span>
                    </div>
                    <div class="weekly-task-status-container">
                        <div class="task-status status-${status}">
                            ${status === 'locked' ? 'Locked' : 
                              status === 'in-progress' ? 'In Progress' : 
                              status === 'submitted' ? 'Submitted' : 
                              status === 'graded' ? 'Graded' : 'Overdue'}
                        </div>
                        ${task.grade ? `<div class="weekly-task-grade">Grade: ${task.grade}</div>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- KONTEN KANAN: Comment Count dan Tombol Action -->
            <div class="weekly-task-right">
                <!-- Bagian komentar count -->
                ${commentCount > 0 ? `
                    <div class="comment-count-section">
                        <span class="comment-count-text">
                            <i class="ri-chat-3-line"></i>
                            ${commentCount} comments
                        </span>
                    </div>
                ` : ''}
                
                <!-- Tombol action -->
                <div class="task-actions">
                    ${!isLocked ? 
                        (status === 'graded' || status === 'submitted' ? 
                            `<button class="btn btn-outline btn-view" data-id="${task.id}" data-type="weekly">View</button>` : 
                            `<button class="btn btn-primary btn-upload" data-id="${task.id}" data-type="weekly">Upload Task</button>`
                        ) : 
                        `<button class="btn btn-outline" disabled>Locked</button>`
                    }
                </div>
            </div>
            
            <!-- MENTOR COMMENT FULL WIDTH - DI BAWAH KEDUA KOLOM -->
            ${task.comments && status === 'graded' ? `
                <div class="mentor-comment-full-width">
                    <div class="mentor-comment-header-inline">
                        <i class="ri-user-voice-line"></i>
                        <strong>Mentor Comment:</strong>
                        <span class="mentor-comment-text">${mentorComment}</span>
                    </div>
                </div>
            ` : ''}
        `;
        
        weeklyTasksList.appendChild(taskCard);
    });
    
    // Setup event listeners
    setupTaskEventListeners(container);
}

// Setup event listeners untuk task cards
function setupTaskEventListeners(container) {
    // Setup event listener untuk upload task
    container.querySelectorAll('.btn-upload').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const taskId = this.getAttribute('data-id');
            const taskType = this.getAttribute('data-type');
            window.location.hash = `task-detail/${taskType}/${taskId}`;
        });
    });
    
    // Setup event listener untuk view task
    container.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const taskId = this.getAttribute('data-id');
            const taskType = this.getAttribute('data-type');
            window.location.hash = `task-view/${taskType}/${taskId}`;
        });
    });
    
    // Setup event listener untuk card logbook
    container.querySelectorAll('.logbook-card:not(.locked)').forEach(card => {
        card.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            const taskType = this.getAttribute('data-type');
            
            // Tentukan apakah ke halaman upload atau view
            const task = appData.tasks.logbooks.find(t => t.id === parseInt(taskId));
            
            if (task.status === 'completed') {
                window.location.hash = `task-view/${taskType}/${taskId}`;
            } else {
                window.location.hash = `task-detail/${taskType}/${taskId}`;
            }
        });
    });
    
    // Setup event listener untuk card weekly task
    container.querySelectorAll('.weekly-task-card:not(.locked)').forEach(card => {
        card.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            const taskType = this.getAttribute('data-type');
            
            // Tentukan apakah ke halaman upload atau view
            const task = appData.tasks.weeklyTasks.find(t => t.id === parseInt(taskId));
            const status = getWeeklyTaskStatus(task);
            
            if (status === 'submitted' || status === 'graded') {
                window.location.hash = `task-view/${taskType}/${taskId}`;
            } else {
                window.location.hash = `task-detail/${taskType}/${taskId}`;
            }
        });
    });
}

// Render halaman Detail Tugas (Upload) - DIPERBAIKI
function renderTaskDetailPage(container, taskPath) {
    console.log('renderTaskDetailPage called with:', taskPath);
    
    if (!taskPath) {
        container.innerHTML = '<p>Task not found - no task path provided</p>';
        return;
    }
    
    const parts = taskPath.split('/');
    const taskType = parts[0];
    const taskId = parseInt(parts[1]);
    
    let task;
    if (taskType === 'logbook') {
        task = appData.tasks.logbooks.find(t => t.id === taskId);
    } else if (taskType === 'weekly') {
        task = appData.tasks.weeklyTasks.find(t => t.id === taskId);
    }
    
    if (!task) {
        container.innerHTML = `<p>Task not found - Type: ${taskType}, ID: ${taskId}</p>`;
        return;
    }
    
    // Tentukan apakah deadline sudah lewat
    const isOverdue = new Date(task.deadline) < new Date();
    
    container.innerHTML = `
        <div class="task-detail">
            <div class="task-detail-header">
                <div class="task-detail-info">
                    <h2>${task.title}</h2>
                    <div class="task-detail-meta">
                        <span><i class="ri-calendar-line"></i> Deadline: ${formatDate(task.deadline)}</span>
                        <span class="task-status status-${isOverdue ? 'overdue' : 'in-progress'}">${isOverdue ? 'Overdue' : 'In Progress'}</span>
                    </div>
                </div>
            </div>
            
            <div class="task-description">
                <h3>Description</h3>
                <p>${task.description}</p>
            </div>
            
            <div class="upload-section" id="upload-area">
                <i class="ri-upload-cloud-2-line"></i>
                <h3>Upload Your Work</h3>
                <p>Click to upload or drag and drop your file here</p>
                <p>${taskType === 'logbook' ? 'PDF, JPG, PNG, DOCX' : 'PDF, PPT'} (Max. 10MB)</p>
                <input type="file" id="file-input" class="file-input" accept="${taskType === 'logbook' ? '.pdf,.jpg,.jpeg,.png,.docx' : '.pdf,.ppt,.pptx'}">
            </div>
            
            ${taskType === 'weekly' ? `
                <div class="notes-section">
                    <h3>Notes (Optional)</h3>
                    <textarea class="notes-input" id="task-notes" placeholder="Add any notes about your submission...">${task.notes || ''}</textarea>
                </div>
            ` : ''}
            
            ${task.submittedFiles && task.submittedFiles.length > 0 ? `
                <div class="uploaded-files">
                    <h3>Uploaded Files</h3>
                    ${task.submittedFiles.map(file => `
                        <div class="file-item">
                            <div class="file-info">
                                <i class="ri-file-text-line file-icon"></i>
                                <span>${file}</span>
                            </div>
                            <span>Uploaded: ${task.submittedDate ? formatDate(task.submittedDate) : 'Not submitted'}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="task-actions">
                <button class="btn btn-outline" onclick="window.history.back()">Back</button>
                <button class="btn btn-primary" id="submit-task" ${task.submittedFiles && task.submittedFiles.length > 0 ? '' : 'disabled'}>${taskType === 'logbook' ? 'Submit Logbook' : 'Submit Task'}</button>
            </div>
        </div>
    `;
    
    // Setup file upload
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const submitBtn = document.getElementById('submit-task');
    
    // Pastikan elemen ditemukan sebelum menambahkan event listener
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.backgroundColor = 'var(--primary-light)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--gray-light)';
            uploadArea.style.backgroundColor = 'transparent';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--gray-light)';
            uploadArea.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileUpload(task, fileInput.files[0], taskType);
            }
        });
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                handleFileUpload(task, fileInput.files[0], taskType);
            }
        });
    }
    
    // Setup submit task - DIPERBAIKI untuk weekly tasks
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (!task.submittedFiles || task.submittedFiles.length === 0) {
                alert('Please upload a file before submitting.');
                return;
            }
            
            // Update status task - DIPERBAIKI: Untuk weekly task, status menjadi 'submitted'
            if (taskType === 'logbook') {
                task.status = 'completed';
            } else {
                task.status = 'submitted'; // Weekly task status menjadi 'submitted' setelah upload
            }
            
            task.submittedDate = new Date().toISOString();
            
            // Simpan notes untuk weekly task
            if (taskType === 'weekly') {
                const notesInput = document.getElementById('task-notes');
                if (notesInput) {
                    task.notes = notesInput.value;
                }
            }
            
            // Simpan perubahan
            localStorage.setItem('app_tasks', JSON.stringify(appData.tasks));
            
            // Hitung ulang statistik
            calculateTaskStats();
            
            alert(`${taskType === 'logbook' ? 'Logbook' : 'Task'} submitted successfully!`);
            
            // Redirect berdasarkan task type - DIPERBAIKI
            if (taskType === 'logbook') {
                window.location.hash = 'logbook';
            } else {
                window.location.hash = 'weekly-tasks';
            }
        });
    }
    
    // Fungsi untuk menangani upload file
    function handleFileUpload(task, file, type) {
        // Validasi file
        const validTypes = type === 'logbook' 
            ? ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            : ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            alert(`Please upload a ${type === 'logbook' ? 'PDF, JPG, PNG, or DOCX' : 'PDF or PPT'} file.`);
            return;
        }
        
        if (file.size > maxSize) {
            alert('File size exceeds 10MB limit.');
            return;
        }
        
        // Simpan file (dalam aplikasi nyata, ini akan diupload ke server)
        task.submittedFiles = [file.name];
        
        // Update UI
        if (uploadArea) {
            uploadArea.innerHTML = `
                <i class="ri-checkbox-circle-line" style="color: var(--success); font-size: 40px;"></i>
                <h3>File Uploaded Successfully</h3>
                <p>${file.name}</p>
                <p>Uploaded: ${new Date().toLocaleDateString()}</p>
                <button class="btn btn-outline" id="change-file">Change File</button>
            `;
            
            // Aktifkan tombol submit
            if (submitBtn) {
                submitBtn.disabled = false;
            }
            
            // Setup event listener untuk change file
            const changeFileBtn = document.getElementById('change-file');
            if (changeFileBtn) {
                changeFileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Reset upload area
                    uploadArea.innerHTML = `
                        <i class="ri-upload-cloud-2-line"></i>
                        <h3>Upload Your Work</h3>
                        <p>Click to upload or drag and drop your file here</p>
                        <p>${type === 'logbook' ? 'PDF, JPG, PNG, DOCX' : 'PDF, PPT'} (Max. 10MB)</p>
                        <input type="file" id="file-input" class="file-input" accept="${type === 'logbook' ? '.pdf,.jpg,.jpeg,.png,.docx' : '.pdf,.ppt,.pptx'}">
                    `;
                    
                    // Setup ulang event listeners
                    const newFileInput = document.getElementById('file-input');
                    if (newFileInput) {
                        uploadArea.addEventListener('click', () => newFileInput.click());
                        newFileInput.addEventListener('change', () => {
                            if (newFileInput.files.length) {
                                handleFileUpload(task, newFileInput.files[0], type);
                            }
                        });
                    }
                    
                    // Nonaktifkan tombol submit
                    if (submitBtn) {
                        submitBtn.disabled = true;
                    }
                });
            }
        }
    }
}

// Render halaman View Tugas dengan komentar - DIPERBAIKI
function renderTaskViewPage(container, taskPath) {
    if (!taskPath) {
        container.innerHTML = '<p>Task not found</p>';
        return;
    }
    
    const parts = taskPath.split('/');
    const taskType = parts[0];
    const taskId = parseInt(parts[1]);
    
    let task;
    if (taskType === 'logbook') {
        task = appData.tasks.logbooks.find(t => t.id === taskId);
    } else if (taskType === 'weekly') {
        task = appData.tasks.weeklyTasks.find(t => t.id === taskId);
    }
    
    if (!task) {
        container.innerHTML = '<p>Task not found. Please check the task ID and type.</p>';
        return;
    }
    
    // Tentukan apakah deadline sudah lewat
    const currentDate = window.dateManager ? window.dateManager.getCurrentDate() : new Date();
    const deadline = new Date(task.deadline);
    const isOverdue = deadline < currentDate;
    
    // DIPERBAIKI: Tentukan apakah task bisa diedit
    // Logbook: bisa edit jika belum lewat deadline
    // Weekly Task: bisa edit jika status 'submitted' dan belum lewat deadline
    let canEdit = false;
    
    if (taskType === 'logbook') {
        canEdit = !isOverdue && task.status === 'completed';
    } else if (taskType === 'weekly') {
        canEdit = !isOverdue && (task.status === 'submitted' || task.status === 'completed');
    }
    
    container.innerHTML = `
        <div class="file-viewer">
            <div class="file-viewer-header">
                <h2>${task.title}</h2>
                <div>
                    ${canEdit ? `<button class="btn btn-outline" id="edit-task">Edit Submission</button>` : ''}
                    <button class="btn btn-outline" onclick="window.history.back()">Back</button>
                </div>
            </div>
            
            <div class="file-preview">
                ${getFilePreview(task.submittedFiles[0])}
            </div>
            
            <div class="file-meta">
                <div class="file-meta-item">
                    <span class="file-meta-label">Submitted Date:</span>
                    <span>${formatDate(task.submittedDate)}</span>
                </div>
                
                ${taskType === 'weekly' && task.notes ? `
                    <div class="file-meta-item">
                        <span class="file-meta-label">Your Notes:</span>
                        <span>${task.notes}</span>
                    </div>
                ` : ''}
                
                ${taskType === 'weekly' && task.grade ? `
                    <div class="file-meta-item">
                        <span class="file-meta-label">Grade:</span>
                        <span class="grade-value">${task.grade}</span>
                    </div>
                ` : ''}
                

            ${taskType === 'weekly' && task.comments ? `
                <div class="mentor-comment-special" style="margin-bottom: 20px;">
                    <div class="mentor-comment-header">
                        <i class="ri-user-voice-line"></i>
                        <strong>Mentor Comment:</strong>
                    </div>
                    <div class="mentor-comment-content">
                        ${task.comments}
                    </div>
                </div>
            ` : ''}
            
            ${taskType === 'weekly' && task.status === 'submitted' && !task.grade ? `
                <div class="review-message">
                    <p>Your submission is being reviewed by the mentor. Feedback will be available soon.</p>
                </div>
            ` : ''}
            
            <!-- BAGIAN KOMENTAR UNTUK WEEKLY TASKS YANG SUDAH DINILAI -->
            ${taskType === 'weekly' && task.grade ? `
                <div class="comments-section">
                    <h3>Discussion Thread</h3>
                    <div class="comment-list" id="comment-list">
                        ${task.commentThread && task.commentThread.length > 0 ? 
                            task.commentThread.map(comment => `
                                <div class="comment-item ${comment.sender === 'mentor' ? 'comment-mentor' : 'comment-user'}">
                                    <div class="comment-header">
                                        <span class="comment-sender">${comment.senderName}</span>
                                        <span class="comment-time">${formatDateTime(comment.timestamp)}</span>
                                    </div>
                                    <div class="comment-message">${comment.message}</div>
                                </div>
                            `).join('') 
                            : '<p>No comments yet. Start the discussion!</p>'
                        }
                    </div>
                    
                    <div class="comment-form">
                        <h4>Add Your Comment</h4>
                        <textarea class="comment-input" id="comment-input" placeholder="Type your message to the mentor..."></textarea>
                        <div class="comment-actions">
                            <button class="btn btn-outline" id="cancel-comment">Cancel</button>
                            <button class="btn btn-primary" id="submit-comment">Send Comment</button>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Setup event listener untuk edit task - DIPERBAIKI
    if (canEdit) {
        document.getElementById('edit-task').addEventListener('click', function() {
            window.location.hash = `task-detail/${taskType}/${taskId}`;
        });
    }
    
    // Setup event listener untuk komentar (weekly tasks yang sudah dinilai)
    if (taskType === 'weekly' && task.grade) {
        setupCommentFunctionality(task, taskType, taskId);
    }
}

// Fungsi untuk setup komentar
function setupCommentFunctionality(task, taskType, taskId) {
    const commentInput = document.getElementById('comment-input');
    const submitCommentBtn = document.getElementById('submit-comment');
    const cancelCommentBtn = document.getElementById('cancel-comment');
    const commentList = document.getElementById('comment-list');
    
    // Pastikan commentThread ada
    if (!task.commentThread) {
        task.commentThread = [];
    }
    
    // Submit komentar
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', function() {
            const message = commentInput.value.trim();
            
            if (!message) {
                alert('Please enter a comment before sending.');
                return;
            }
            
            // Buat komentar baru
            const newComment = {
                id: task.commentThread.length + 1,
                sender: "user",
                senderName: "You",
                message: message,
                timestamp: new Date().toISOString()
            };
            
            // Tambahkan ke thread komentar
            task.commentThread.push(newComment);
            
            // Simpan perubahan
            localStorage.setItem('app_tasks', JSON.stringify(appData.tasks));
            
            // Update tampilan
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item comment-user';
            commentItem.innerHTML = `
                <div class="comment-header">
                    <span class="comment-sender">You</span>
                    <span class="comment-time">${formatDateTime(newComment.timestamp)}</span>
                </div>
                <div class="comment-message">${newComment.message}</div>
            `;
            
            commentList.appendChild(commentItem);
            
            // Reset input
            commentInput.value = '';
            
            // Scroll ke komentar terbaru
            commentItem.scrollIntoView({ behavior: 'smooth' });
            
            // Tampilkan konfirmasi
            alert('Your comment has been sent to the mentor!');
        });
    }
    
    // Cancel komentar
    if (cancelCommentBtn) {
        cancelCommentBtn.addEventListener('click', function() {
            commentInput.value = '';
        });
    }
    
    // Auto-resize textarea
    if (commentInput) {
        commentInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

// Helper function untuk preview file
function getFilePreview(filename) {
    if (!filename) return '<p>No file uploaded</p>';
    
    if (filename.endsWith('.pdf')) {
        return `
            <div class="pdf-placeholder">
                <i class="ri-file-pdf-line"></i>
            </div>
            <p>PDF File: ${filename}</p>
            <button class="btn btn-primary" onclick="viewFile('${filename}')">View File</button>
        `;
    } else if (filename.match(/\.(jpg|jpeg|png)$/i)) {
        return `
            <div class="pdf-placeholder">
                <i class="ri-image-line"></i>
            </div>
            <p>Image File: ${filename}</p>
            <button class="btn btn-primary" onclick="viewFile('${filename}')">View File</button>
        `;
    } else if (filename.endsWith('.docx')) {
        return `
            <div class="pdf-placeholder">
                <i class="ri-file-word-line"></i>
            </div>
            <p>Document File: ${filename}</p>
            <button class="btn btn-primary" onclick="viewFile('${filename}')">View File</button>
        `;
    } else if (filename.endsWith('.ppt') || filename.endsWith('.pptx')) {
        return `
            <div class="pdf-placeholder">
                <i class="ri-slideshow-line"></i>
            </div>
            <p>Presentation File: ${filename}</p>
            <button class="btn btn-primary" onclick="viewFile('${filename}')">View File</button>
        `;
    } else {
        return `
            <div class="pdf-placeholder">
                <i class="ri-file-text-line"></i>
            </div>
            <p>File: ${filename}</p>
            <button class="btn btn-primary" onclick="viewFile('${filename}')">View File</button>
        `;
    }
}

// Fungsi untuk melihat file (simulasi)
function viewFile(filename) {
    alert(`In a real application, this would open the file: ${filename}\n\nFor this demo, we're simulating file viewing.`);
}

// Fungsi untuk mendapatkan status weekly task - DIPERBAIKI
function getWeeklyTaskStatus(task) {
    // Jika task terkunci
    if (task.locked) {
        return 'locked';
    }
    
    // Jika task sudah dikumpulkan dan dinilai
    if (task.status === 'completed' && task.grade) {
        return 'graded';
    }
    
    // Jika task sudah dikumpulkan tapi belum dinilai
    if (task.status === 'submitted' || (task.status === 'completed' && !task.grade)) {
        return 'submitted';
    }
    
    // Jika deadline sudah lewat dan belum dikumpulkan
    const currentDate = window.dateManager ? window.dateManager.getCurrentDate() : new Date();
    const deadline = new Date(task.deadline);
    if (deadline < currentDate && task.status !== 'completed' && task.status !== 'submitted') {
        return 'overdue';
    }
    
    // Jika task terbuka (tidak terkunci) dan deadline belum lewat
    return 'in-progress';
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
    if (!dateString) return 'Not submitted';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Fungsi untuk memformat tanggal dengan waktu
function formatDateTime(dateString) {
    if (!dateString) return 'Not submitted';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Pastikan fungsi tersedia secara global
window.renderTasksPage = renderTasksPage;
window.renderLogbookPage = renderLogbookPage;
window.renderWeeklyTasksPage = renderWeeklyTasksPage;
window.renderTaskDetailPage = renderTaskDetailPage;
window.renderTaskViewPage = renderTaskViewPage;
window.getWeeklyTaskStatus = getWeeklyTaskStatus;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.viewFile = viewFile;