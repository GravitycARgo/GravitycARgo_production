/**
 * Step 4: Review & Optimize
 * Handles algorithm selection, genetic algorithm controls, and final optimization
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Step 4: Review & Optimize - DOM loaded");
  
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

  // Algorithm selection handling
  initializeAlgorithmSelection();
  
  // Genetic algorithm controls
  initializeGeneticControls();

  function initializeAlgorithmSelection() {
    const algorithmOptions = document.querySelectorAll('.algorithm-option');
    const algorithmInput = document.getElementById('optimization_algorithm');
    const geneticControls = document.querySelector('.genetic-controls');
    const reviewAlgorithmSpan = document.getElementById('reviewOptimizationAlgorithm');

    algorithmOptions.forEach(option => {
      option.addEventListener('click', function() {
        const algorithm = this.dataset.algorithm;
        
        // Remove selected class from all options
        algorithmOptions.forEach(opt => {
          opt.classList.remove('selected');
          const radio = opt.querySelector('input[type="radio"]');
          if (radio) radio.checked = false;
        });
        
        // Add selected class to clicked option
        this.classList.add('selected');
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        
        // Update hidden input
        if (algorithmInput) {
          algorithmInput.value = algorithm;
        }
        
        // Update review summary
        if (reviewAlgorithmSpan) {
          reviewAlgorithmSpan.textContent = algorithm === 'genetic' ? 'AI-Enhanced Genetic' : 'Regular Packing';
        }
        
        // Show/hide genetic controls
        if (geneticControls) {
          if (algorithm === 'genetic') {
            geneticControls.style.display = 'block';
          } else {
            geneticControls.style.display = 'none';
          }
        }
        
        console.log("Algorithm selected:", algorithm);
      });
    });

    // Initialize with regular algorithm selected
    const regularOption = document.querySelector('.algorithm-option[data-algorithm="regular"]');
    if (regularOption) {
      regularOption.click();
    }
  }

  function initializeGeneticControls() {
    // Population size control
    const populationSizeInput = document.getElementById('population_size');
    const populationSizeValue = document.getElementById('population_size_value');
    
    if (populationSizeInput && populationSizeValue) {
      populationSizeInput.addEventListener('input', function() {
        populationSizeValue.textContent = this.value;
      });
      
      // Initial update
      populationSizeValue.textContent = populationSizeInput.value;
    }

    // Number of generations control
    const numGenerationsInput = document.getElementById('num_generations');
    const numGenerationsValue = document.getElementById('num_generations_value');
    
    if (numGenerationsInput && numGenerationsValue) {
      numGenerationsInput.addEventListener('input', function() {
        numGenerationsValue.textContent = this.value;
      });
      
      // Initial update
      numGenerationsValue.textContent = numGenerationsInput.value;
    }
  }

  // Form submission with optimization start
  const form = document.getElementById("reviewForm");
  const optimizeBtn = document.getElementById("optimizeBtn");
  
  if (form) {
    form.addEventListener("submit", function(e) {
      if (optimizeBtn) {
        optimizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
        optimizeBtn.disabled = true;
      }
      
      console.log("Starting optimization process...");
    });
  }

  // Update review summary with current data
  updateReviewSummary();

  function updateReviewSummary() {
    // Get data from hidden fields and update display
    const transportMode = document.getElementById('transport_mode')?.value;
    const containerType = document.getElementById('container_type')?.value;
    const uploadedFile = document.getElementById('uploaded_file')?.value;
    const routeTemperature = document.getElementById('route_temperature')?.value;
    
    // Transport mode mapping
    const transportModeMapping = {
      "1": "Truck",
      "2": "Ship",
      "3": "Plane",
      "4": "Train",
      "5": "Custom"
    };

    // Update display elements if they exist
    const reviewTransportMode = document.getElementById('reviewTransportMode');
    if (reviewTransportMode && transportMode) {
      reviewTransportMode.textContent = transportModeMapping[transportMode] || transportMode;
    }

    const reviewContainerType = document.getElementById('reviewContainerType');
    if (reviewContainerType && containerType) {
      reviewContainerType.textContent = containerType || 'Custom';
    }

    const reviewFileName = document.getElementById('reviewFileName');
    if (reviewFileName && uploadedFile) {
      reviewFileName.textContent = uploadedFile;
    }

    const reviewRouteTemperature = document.getElementById('reviewRouteTemperature');
    if (reviewRouteTemperature && routeTemperature) {
      reviewRouteTemperature.textContent = routeTemperature + '°C';
    }
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
