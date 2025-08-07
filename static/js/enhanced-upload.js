/**
 * Enhanced File Upload System for GravitycARgo
 * Provides drag & drop, validation, preview, and user feedback
 */

class EnhancedFileUpload {
    constructor() {
        this.fileInput = null;
        this.dropZone = null;
        this.uploadFeedback = null;
        this.nextBtn = null;
        this.currentFile = null;
        
        this.allowedTypes = [
            'text/csv', 
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        this.allowedExtensions = ['.csv', '.xlsx', '.xls'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        
        this.init();
    }
    
    init() {
        this.fileInput = document.getElementById('file_input');
        this.dropZone = document.getElementById('dropZone');
        this.uploadFeedback = document.getElementById('uploadFeedback');
        this.nextBtn = document.getElementById('nextBtn');
        
        if (!this.fileInput || !this.dropZone) {
            console.error('Required file upload elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.showUploadTips();
    }
    
    setupEventListeners() {
        // Drag and drop events
        this.dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Click to upload
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Prevent default drag behaviors on window
        window.addEventListener('dragenter', (e) => e.preventDefault());
        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', (e) => e.preventDefault());
    }
    
    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add('drag-over');
        this.showDragFeedback('Drop your file here!');
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Only remove if we're truly leaving the drop zone
        if (!this.dropZone.contains(e.relatedTarget)) {
            this.dropZone.classList.remove('drag-over');
            this.hideDragFeedback();
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
        
        this.hideDragFeedback();
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    processFile(file) {
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }
        
        this.currentFile = file;
        this.showFileSelected(file);
        this.readFile(file);
    }
    
    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            this.showError(`File too large! Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`);
            return false;
        }
        
        // Check file type
        const isValidType = this.allowedTypes.includes(file.type) ||
                           this.allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (!isValidType) {
            this.showError('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
            return false;
        }
        
        return true;
    }
    
    readFile(file) {
        this.showProgress('Reading file...');
        
        const reader = new FileReader();
        reader.onload = (e) => this.handleFileRead(e, file);
        reader.onerror = () => this.showError('Error reading file');
        reader.readAsText(file);
    }
    
    handleFileRead(e, file) {
        try {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            let csvData, csvColumns;
            
            if (fileExtension === 'csv') {
                const results = Papa.parse(e.target.result, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    transformHeader: (header) => header.trim()
                });
                
                if (results.errors.length > 0) {
                    console.warn('CSV parsing warnings:', results.errors);
                }
                
                csvData = results.data;
                csvColumns = results.meta.fields;
                
            } else {
                this.showError('Excel files must be converted to CSV first. Please save as CSV and try again.');
                return;
            }
            
            if (!csvData || csvData.length === 0) {
                this.showError('The file appears to be empty. Please check your file.');
                return;
            }
            
            // Validate CSV structure
            if (!this.validateCSVStructure(csvData, csvColumns)) {
                return;
            }
            
            this.showSuccess(`✅ File processed successfully! Found ${csvData.length} rows`);
            this.showPreview(csvData, csvColumns);
            this.enableNextButton();
            
            // Store data
            this.storeFileData(file, csvData, csvColumns);
            
        } catch (error) {
            console.error('File processing error:', error);
            this.showError('Error processing file. Please ensure it\'s a valid CSV file.');
        }
    }
    
    validateCSVStructure(data, columns) {
        // Check for required columns (flexible approach)
        const sampleRow = data[0];
        if (!sampleRow || Object.keys(sampleRow).length === 0) {
            this.showError('No valid columns found in the file');
            return false;
        }
        
        // Check if we have some numeric data (basic validation)
        let hasNumericData = false;
        for (const key in sampleRow) {
            if (typeof sampleRow[key] === 'number' && !isNaN(sampleRow[key])) {
                hasNumericData = true;
                break;
            }
        }
        
        if (!hasNumericData) {
            console.warn('Warning: No numeric data detected. Please ensure your file contains measurement data.');
        }
        
        return true;
    }
    
    showFileSelected(file) {
        const uploadText = this.dropZone.querySelector('.upload-text');
        const uploadSubtitle = this.dropZone.querySelector('.upload-subtitle');
        
        if (uploadText) uploadText.textContent = `📁 ${file.name}`;
        if (uploadSubtitle) uploadSubtitle.textContent = `${this.formatFileSize(file.size)} • Processing...`;
        
        this.dropZone.classList.add('file-selected');
    }
    
    showPreview(data, columns) {
        // Create or update preview
        let previewContainer = document.getElementById('csvPreviewContainer');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'csvPreviewContainer';
            previewContainer.className = 'csv-preview-container';
            this.dropZone.parentNode.appendChild(previewContainer);
        }
        
        const previewHTML = this.generatePreviewHTML(data, columns);
        previewContainer.innerHTML = previewHTML;
        
        // Add animation
        previewContainer.style.opacity = '0';
        previewContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            previewContainer.style.opacity = '1';
            previewContainer.style.transform = 'translateY(0)';
            previewContainer.style.transition = 'all 0.5s ease';
        }, 100);
    }
    
    generatePreviewHTML(data, columns) {
        const maxRows = 5;
        const displayData = data.slice(0, maxRows);
        
        let html = `
            <div class="csv-preview-header">
                <h3>📊 File Preview</h3>
                <div class="csv-stats">
                    <span class="stat-badge">📝 ${data.length} rows</span>
                    <span class="stat-badge">📋 ${columns.length} columns</span>
                    <span class="stat-badge">📁 ${this.formatFileSize(this.currentFile.size)}</span>
                </div>
            </div>
            <div class="csv-preview-table-container">
                <table class="csv-preview-table">
                    <thead>
                        <tr>
        `;
        
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        displayData.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col] ?? '';
                html += `<td>${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        if (data.length > maxRows) {
            html += `<div class="preview-footer">... and ${data.length - maxRows} more rows</div>`;
        }
        
        html += '</div>';
        
        return html;
    }
    
    storeFileData(file, data, columns) {
        const fileData = {
            filename: file.name,
            size: file.size,
            type: file.type,
            data: data,
            columns: columns,
            rowCount: data.length,
            timestamp: Date.now()
        };
        
        sessionStorage.setItem('uploadedFileData', JSON.stringify(fileData));
        
        // Also store in server session via API
        this.storeOnServer(fileData);
        
        // Create FormData for backend submission
        const formData = new FormData();
        formData.append('file', file);
        formData.append('data', JSON.stringify(fileData));
        
        // Store FormData for later use
        window.uploadFormData = formData;
    }
    
    /**
     * Store file data on server via session
     */
    async storeOnServer(fileData) {
        try {
            const response = await fetch('/api/upload/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: fileData.filename,
                    columns: fileData.columns,
                    rowCount: fileData.rowCount,
                    preview_data: fileData.data.slice(0, 10) // Send first 10 rows
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ File data stored on server:', result);
            }
        } catch (error) {
            console.warn('Could not store file data on server:', error);
        }
    }
    
    /**
     * Validate file with backend
     */
    async validateWithBackend(filename) {
        try {
            const response = await fetch('/api/upload/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file_path: `/uploads/${filename}`
                })
            });
            
            if (response.ok) {
                const validation = await response.json();
                
                if (!validation.valid) {
                    this.showValidationErrors(validation.errors);
                    return false;
                } else if (validation.warnings && validation.warnings.length > 0) {
                    this.showValidationWarnings(validation.warnings);
                }
                
                return true;
            }
        } catch (error) {
            console.warn('Backend validation failed:', error);
        }
        
        return true; // Continue if validation service unavailable
    }
    
    showValidationErrors(errors) {
        const errorList = errors.map(err => `• ${err}`).join('\n');
        this.showError(`File validation failed:\n${errorList}`);
    }
    
    showValidationWarnings(warnings) {
        const warningList = warnings.map(warn => `⚠️ ${warn}`).join('\n');
        console.warn('File validation warnings:', warningList);
        
        // Show warnings in UI but don't block upload
        const uploadSubtitle = this.dropZone.querySelector('.upload-subtitle');
        if (uploadSubtitle) {
            uploadSubtitle.innerHTML = `<i class="fas fa-exclamation-triangle text-warning"></i> Warnings detected - check console`;
        }
    }
    
    enableNextButton() {
        if (this.nextBtn) {
            this.nextBtn.disabled = false;
            this.nextBtn.classList.add('btn-enabled');
            this.nextBtn.classList.remove('disabled');
            
            // Add visual feedback
            this.nextBtn.innerHTML = `
                <i class="fas fa-arrow-right me-2"></i>
                Continue to Settings
            `;
        }
    }
    
    showProgress(message) {
        const uploadSubtitle = this.dropZone.querySelector('.upload-subtitle');
        if (uploadSubtitle) {
            uploadSubtitle.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
        }
    }
    
    showSuccess(message) {
        if (this.uploadFeedback) {
            this.uploadFeedback.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
            this.uploadFeedback.style.display = 'flex';
        }
        
        const uploadSubtitle = this.dropZone.querySelector('.upload-subtitle');
        if (uploadSubtitle) {
            uploadSubtitle.innerHTML = `<i class="fas fa-check text-success"></i> Ready for processing!`;
        }
    }
    
    showError(message) {
        alert(`❌ ${message}`);
        this.resetUploadZone();
        
        // Reset file input
        this.fileInput.value = '';
        this.currentFile = null;
    }
    
    showDragFeedback(message) {
        const uploadText = this.dropZone.querySelector('.upload-text');
        if (uploadText) {
            uploadText.innerHTML = `📥 ${message}`;
        }
    }
    
    hideDragFeedback() {
        const uploadText = this.dropZone.querySelector('.upload-text');
        if (uploadText && !this.currentFile) {
            uploadText.textContent = '📁 Drag & Drop Your File Here';
        }
    }
    
    resetUploadZone() {
        this.dropZone.classList.remove('file-selected', 'drag-over');
        
        if (this.uploadFeedback) {
            this.uploadFeedback.style.display = 'none';
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = true;
            this.nextBtn.classList.remove('btn-enabled');
            this.nextBtn.innerHTML = `
                <i class="fas fa-upload me-2"></i>
                Upload File First
            `;
        }
        
        const uploadText = this.dropZone.querySelector('.upload-text');
        const uploadSubtitle = this.dropZone.querySelector('.upload-subtitle');
        
        if (uploadText) uploadText.textContent = '📁 Drag & Drop Your File Here';
        if (uploadSubtitle) uploadSubtitle.textContent = 'or click to browse files';
        
        // Remove preview
        const previewContainer = document.getElementById('csvPreviewContainer');
        if (previewContainer) {
            previewContainer.remove();
        }
    }
    
    showUploadTips() {
        // Add helpful tips after a delay
        setTimeout(() => {
            const tips = [
                '💡 Tip: Your CSV should have headers in the first row',
                '🚀 Pro tip: Larger files process faster as CSV format',
                '📊 Best practice: Include dimensions, weight, and quantity columns',
                '✨ Format tip: Use consistent units (cm, kg, etc.)'
            ];
            
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            const uploadSubtitle = this.dropZone.querySelector('.upload-subtitle');
            
            if (uploadSubtitle && !this.currentFile) {
                const originalText = uploadSubtitle.textContent;
                uploadSubtitle.textContent = randomTip;
                uploadSubtitle.style.fontStyle = 'italic';
                
                setTimeout(() => {
                    if (!this.currentFile) {
                        uploadSubtitle.textContent = originalText;
                        uploadSubtitle.style.fontStyle = 'normal';
                    }
                }, 3000);
            }
        }, 2000);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on file upload page
    if (document.getElementById('file_input') && document.getElementById('dropZone')) {
        window.enhancedUpload = new EnhancedFileUpload();
    }
});

// Global functions for backward compatibility
window.initFileUpload = function() {
    if (!window.enhancedUpload) {
        window.enhancedUpload = new EnhancedFileUpload();
    }
};

// Enhanced proceed to next function
window.proceedToNext = function() {
    const fileInput = document.getElementById('file_input');
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('📁 Please upload a file before proceeding');
        return;
    }
    
    // Show loading state
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        nextBtn.disabled = true;
    }
    
    // Simulate processing delay for better UX
    setTimeout(() => {
        // Get stored data
        const storedData = sessionStorage.getItem('uploadedFileData');
        if (storedData) {
            console.log('✅ Proceeding with file data:', JSON.parse(storedData).filename);
        }
        
        // Navigate to next step
        window.location.href = '/step4';
    }, 1000);
};
