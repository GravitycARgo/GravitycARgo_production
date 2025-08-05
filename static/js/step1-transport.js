/**
 * Step 1: Transport Mode Selection
 * Handles transport mode selection and container type selection
 */

// Transport mode mapping
const transportModeMapping = {
  "1": "Truck",
  "2": "Ship", 
  "3": "Plane",
  "4": "Train",
  "5": "Custom"
};

// Container configurations for each transport mode
const containerConfigurations = {
  "1": [ // Truck
    { id: "20ft_truck", name: "20ft Standard", dimensions: { length: 6.06, width: 2.44, height: 2.59 } },
    { id: "40ft_truck", name: "40ft Standard", dimensions: { length: 12.19, width: 2.44, height: 2.59 } },
    { id: "53ft_truck", name: "53ft Trailer", dimensions: { length: 16.15, width: 2.59, height: 2.69 } }
  ],
  "2": [ // Ship
    { id: "20ft_standard", name: "20ft Standard", dimensions: { length: 6.06, width: 2.44, height: 2.59 } },
    { id: "40ft_standard", name: "40ft Standard", dimensions: { length: 12.19, width: 2.44, height: 2.59 } },
    { id: "40ft_high", name: "40ft High Cube", dimensions: { length: 12.19, width: 2.44, height: 2.90 } },
    { id: "45ft_high", name: "45ft High Cube", dimensions: { length: 13.72, width: 2.44, height: 2.90 } }
  ],
  "3": [ // Plane
    { id: "air_cargo_main", name: "Main Deck Cargo", dimensions: { length: 6.00, width: 2.44, height: 1.63 } },
    { id: "air_cargo_lower", name: "Lower Deck Cargo", dimensions: { length: 3.17, width: 2.44, height: 1.63 } },
    { id: "air_cargo_bulk", name: "Bulk Cargo", dimensions: { length: 4.27, width: 3.17, height: 1.68 } }
  ],
  "4": [ // Train
    { id: "rail_boxcar", name: "Standard Boxcar", dimensions: { length: 15.24, width: 2.74, height: 2.84 } },
    { id: "rail_container", name: "Container Car 40ft", dimensions: { length: 12.19, width: 2.44, height: 2.59 } },
    { id: "rail_container_53", name: "Container Car 53ft", dimensions: { length: 16.15, width: 2.59, height: 2.69 } }
  ]
};

document.addEventListener('DOMContentLoaded', function() {
  console.log("Step 1: Transport Mode Selection - DOM loaded");
  
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

  // Transport mode selection handling
  const transportOptions = document.querySelectorAll(".transport-option");
  const transportModeInput = document.getElementById("transport_mode");
  const containerOptions = document.getElementById("container_options");
  const customDimensions = document.getElementById("custom_dimensions");
  const nextBtn = document.getElementById("nextBtn");
  
  if (transportOptions.length > 0) {
    console.log("Found transport options:", transportOptions.length);

    transportOptions.forEach((option) => {
      option.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Transport option clicked:", this.dataset.value);
        
        // Remove selected class from all options
        transportOptions.forEach((opt) => {
          opt.classList.remove("selected");
          opt.classList.remove("active");
        });

        // Add selected class to clicked option
        this.classList.add("selected");
        this.classList.add("active");

        // Set transport mode value
        const transportValue = this.getAttribute("data-value");
        if (transportModeInput) {
          transportModeInput.value = transportValue;
          console.log("Transport mode set to:", transportValue);
        }

        // Show container selection or custom dimensions
        if (transportValue === "5") { // Custom
          containerOptions.style.display = "none";
          customDimensions.style.display = "block";
          enableNextButton();
        } else {
          customDimensions.style.display = "none";
          showContainerOptions(transportValue);
        }
      });
    });
  }

  function showContainerOptions(transportMode) {
    const containerGrid = document.getElementById("containerGrid");
    const containerTypeInput = document.getElementById("container_type");
    
    if (!containerGrid || !containerConfigurations[transportMode]) {
      console.error("Container grid not found or no configurations for transport mode:", transportMode);
      return;
    }

    // Clear previous options
    containerGrid.innerHTML = "";
    
    // Generate container options
    const containers = containerConfigurations[transportMode];
    containers.forEach(container => {
      const containerCard = document.createElement("div");
      containerCard.className = "container-card";
      containerCard.dataset.containerId = container.id;
      
      containerCard.innerHTML = `
        <div class="container-icon">
          <i class="fas fa-cube"></i>
        </div>
        <h5>${container.name}</h5>
        <div class="container-dimensions">
          <span>${container.dimensions.length}m × ${container.dimensions.width}m × ${container.dimensions.height}m</span>
        </div>
        <div class="container-check">
          <i class="fas fa-check"></i>
        </div>
      `;
      
      containerCard.addEventListener("click", function() {
        // Remove selected from all container cards
        document.querySelectorAll(".container-card").forEach(card => {
          card.classList.remove("selected");
        });
        
        // Add selected to clicked card
        this.classList.add("selected");
        
        // Set container type value
        if (containerTypeInput) {
          containerTypeInput.value = container.id;
        }
        
        // Set dimensions in hidden fields
        document.getElementById("length").value = container.dimensions.length;
        document.getElementById("width").value = container.dimensions.width;
        document.getElementById("height").value = container.dimensions.height;
        
        enableNextButton();
      });
      
      containerGrid.appendChild(containerCard);
    });
    
    containerOptions.style.display = "block";
  }

  // Custom dimensions validation
  const customInputs = document.querySelectorAll("#custom_dimensions input[type='number']");
  customInputs.forEach(input => {
    input.addEventListener("input", function() {
      validateCustomDimensions();
    });
  });

  function validateCustomDimensions() {
    const length = document.getElementById("length").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    
    if (length && width && height && 
        parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0) {
      enableNextButton();
    } else {
      disableNextButton();
    }
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
  const form = document.getElementById("transportForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      const transportMode = document.getElementById("transport_mode").value;
      
      if (!transportMode) {
        e.preventDefault();
        alert("Please select a transport mode before proceeding.");
        return;
      }
      
      if (transportMode === "5") {
        // Custom mode - validate dimensions
        const length = document.getElementById("length").value;
        const width = document.getElementById("width").value;
        const height = document.getElementById("height").value;
        
        if (!length || !width || !height) {
          e.preventDefault();
          alert("Please enter all custom dimensions before proceeding.");
          return;
        }
      } else {
        // Standard mode - validate container selection
        const containerType = document.getElementById("container_type").value;
        if (!containerType) {
          e.preventDefault();
          alert("Please select a container type before proceeding.");
          return;
        }
      }
      
      console.log("Form submission validated, proceeding to step 2");
    });
  }

  // Initialize with disabled next button
  disableNextButton();
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
