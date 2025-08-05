/**
 * Step 2: File Upload
 * Handles file upload, validation, and preview
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Step 2: File Upload - DOM loaded");
  
  // Initialize AOS animations
  AOS.init({
    offset: 100,
    duration: 600,
    easing: 'ease-in-out',
    once: true
  });

  // Initialize Locomotive Scroll
  const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    smartphone: { smooth: false },
    tablet: { smooth: false }
  });

  // File upload elements
  const fileInput = document.getElementById('file_input');
  const dropZone = document.getElementById('dropZone');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const removeFile = document.getElementById('removeFile');
  const nextBtn = document.getElementById('nextBtn');
  const previewSection = document.getElementById('filePreviewSection');
  const previewTable = document.getElementById('previewTable');
  const previewTableHeader = document.getElementById('previewTableHeader');
  const previewTableBody = document.getElementById('previewTableBody');
  const previewInfo = document.getElementById('previewInfo');

  // Initialize with disabled next button
  disableNextButton();

  // File input change handler
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      console.log("File input changed");
      handleFileSelection(e.target.files[0]);
    });
  }

  // Drop zone drag and drop handlers
  if (dropZone) {
    dropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    });
  }

  // Remove file handler
  if (removeFile) {
    removeFile.addEventListener('click', function() {
      clearFileSelection();
    });
  }

  function handleFileSelection(file) {
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.size, file.type);

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || 
                       fileName.endsWith('.csv') || 
                       fileName.endsWith('.xlsx') || 
                       fileName.endsWith('.xls');

    if (!isValidType) {
      showError('Please select a valid CSV or Excel file.');
      return;
    }

    // Validate file size (16MB limit)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      showError('File size exceeds 16MB limit. Please choose a smaller file.');
      return;
    }

    // Update file info display
    if (fileName) {
      fileName.textContent = file.name;
    }
    if (fileSize) {
      fileSize.textContent = formatFileSize(file.size);
    }

    // Show file info and hide drop zone
    if (fileInfo) {
      fileInfo.style.display = 'block';
    }
    if (dropZone) {
      dropZone.style.display = 'none';
    }

    // Update the file input value
    fileInput.files = createFileList(file);

    // Enable next button
    enableNextButton();

    // Preview file if it's CSV
    if (fileName.endsWith('.csv')) {
      previewCSVFile(file);
    } else {
      showPreviewPlaceholder('Excel files will be processed during optimization.');
    }
  }

  function previewCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const csvData = e.target.result;
        const lines = csvData.split('\n');
        
        if (lines.length === 0) {
          showError('The CSV file appears to be empty.');
          return;
        }

        // Parse header
        const headers = parseCSVLine(lines[0]);
        if (headers.length === 0) {
          showError('Could not parse CSV headers.');
          return;
        }

        // Show preview table
        showPreviewTable(headers, lines.slice(1, 6)); // Show first 5 data rows
        
        // Update preview info
        if (previewInfo) {
          previewInfo.textContent = `Showing first 5 rows of ${lines.length - 1} total rows`;
        }

      } catch (error) {
        console.error('Error parsing CSV:', error);
        showError('Error parsing CSV file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  function showPreviewTable(headers, dataRows) {
    if (!previewTableHeader || !previewTableBody || !previewSection) {
      return;
    }

    // Clear previous content
    previewTableHeader.innerHTML = '';
    previewTableBody.innerHTML = '';

    // Add headers
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      previewTableHeader.appendChild(th);
    });

    // Add data rows
    dataRows.forEach(line => {
      if (line.trim()) {
        const cells = parseCSVLine(line);
        const tr = document.createElement('tr');
        
        cells.forEach((cell, index) => {
          const td = document.createElement('td');
          td.textContent = cell || '-';
          tr.appendChild(td);
        });
        
        previewTableBody.appendChild(tr);
      }
    });

    // Show preview section
    previewSection.style.display = 'block';
  }

  function showPreviewPlaceholder(message) {
    if (!previewSection || !previewInfo) {
      return;
    }

    previewSection.style.display = 'block';
    previewInfo.textContent = message;
    
    if (previewTable) {
      previewTable.style.display = 'none';
    }
  }

  function clearFileSelection() {
    // Reset file input
    if (fileInput) {
      fileInput.value = '';
    }

    // Hide file info and show drop zone
    if (fileInfo) {
      fileInfo.style.display = 'none';
    }
    if (dropZone) {
      dropZone.style.display = 'block';
    }

    // Hide preview section
    if (previewSection) {
      previewSection.style.display = 'none';
    }

    // Clear preview table
    if (previewTableHeader) {
      previewTableHeader.innerHTML = '';
    }
    if (previewTableBody) {
      previewTableBody.innerHTML = '';
    }

    // Disable next button
    disableNextButton();

    console.log("File selection cleared");
  }

  function createFileList(file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    return dt.files;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function enableNextButton() {
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.classList.remove("disabled");
    }
  }

  function disableNextButton() {
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.classList.add("disabled");
    }
  }

  // Form submission validation
  const form = document.getElementById("uploadForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        e.preventDefault();
        showError("Please select a file before proceeding.");
        return;
      }
      
      console.log("Form submission validated, proceeding to step 3");
    });
  }
});

// Error notification function
function showError(message) {
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = `
    <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
    <div class="error-message">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('visible');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
