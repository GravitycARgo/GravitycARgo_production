/**
 * Step 3: Settings Configuration
 * Handles temperature settings, constraint sliders, and route temperature calculation
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Step 3: Settings Configuration - DOM loaded");
  
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

  // Temperature slider handling
  initializeTemperatureSlider();
  
  // Constraint sliders handling
  initializeConstraintSliders();
  
  // Constraint presets handling
  initializeConstraintPresets();

  function initializeTemperatureSlider() {
    const tempSlider = document.getElementById('temp_slider');
    const tempTooltip = document.getElementById('tempTooltip');
    const routeTemperatureInput = document.getElementById('route_temperature');

    if (tempSlider && tempTooltip) {
      // Update tooltip position and value
      function updateTooltip() {
        const value = tempSlider.value;
        const min = tempSlider.min;
        const max = tempSlider.max;
        const percent = ((value - min) / (max - min)) * 100;
        
        tempTooltip.textContent = value + '°C';
        tempTooltip.style.left = percent + '%';
        
        // Set the hidden input value
        if (routeTemperatureInput) {
          routeTemperatureInput.value = value;
        }
      }

      tempSlider.addEventListener('input', updateTooltip);
      
      // Initial update
      updateTooltip();
    }
  }

  function initializeConstraintSliders() {
    const constraintSliders = document.querySelectorAll('.constraint-slider');
    
    constraintSliders.forEach(slider => {
      const valueDisplay = document.getElementById(slider.id + '_value');
      
      if (valueDisplay) {
        function updateValue() {
          valueDisplay.textContent = slider.value + '%';
        }
        
        slider.addEventListener('input', updateValue);
        
        // Initial update
        updateValue();
      }
    });

    console.log("Initialized", constraintSliders.length, "constraint sliders");
  }

  function initializeConstraintPresets() {
    const presetButtons = document.querySelectorAll('.constraint-preset');
    
    const presets = {
      balanced: {
        volume_weight: 60,
        stability_weight: 50,
        contact_weight: 40,
        balance_weight: 30,
        items_packed_weight: 70,
        temperature_weight: 20,
        weight_capacity: 50
      },
      volume: {
        volume_weight: 90,
        stability_weight: 30,
        contact_weight: 30,
        balance_weight: 20,
        items_packed_weight: 80,
        temperature_weight: 10,
        weight_capacity: 40
      },
      stability: {
        volume_weight: 40,
        stability_weight: 90,
        contact_weight: 80,
        balance_weight: 70,
        items_packed_weight: 50,
        temperature_weight: 30,
        weight_capacity: 80
      }
    };

    presetButtons.forEach(button => {
      button.addEventListener('click', function() {
        const presetName = this.dataset.preset;
        const preset = presets[presetName];
        
        if (preset) {
          // Remove active class from all buttons
          presetButtons.forEach(btn => btn.classList.remove('active'));
          
          // Add active class to clicked button
          this.classList.add('active');
          
          // Apply preset values
          Object.keys(preset).forEach(key => {
            const slider = document.getElementById(key);
            const valueDisplay = document.getElementById(key + '_value');
            
            if (slider && valueDisplay) {
              slider.value = preset[key];
              valueDisplay.textContent = preset[key] + '%';
            }
          });
          
          console.log("Applied preset:", presetName);
        }
      });
    });
  }

  // Form submission validation
  const form = document.getElementById("settingsForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      console.log("Settings form submitted, proceeding to step 4");
    });
  }
});

// Route temperature calculation function
function testRouteTemperature() {
  console.log("Testing route temperature calculation...");
  
  const statusDiv = document.getElementById('routeTempStatus');
  const resultDiv = document.getElementById('routeTempResult');
  const tempSlider = document.getElementById('temp_slider');
  const routeTemperatureInput = document.getElementById('route_temperature');
  
  // Show loading status
  if (statusDiv) {
    statusDiv.style.display = 'block';
  }
  if (resultDiv) {
    resultDiv.style.display = 'none';
  }

  // Mock route data for testing
  const mockRouteData = {
    source: "New York, NY",
    destination: "Los Angeles, CA",
    transport_mode: "truck"
  };

  // Call the API
  fetch('/api/calculate_route_temperature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockRouteData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Route temperature response:', data);
    
    // Hide loading status
    if (statusDiv) {
      statusDiv.style.display = 'none';
    }
    
    if (data.status === 'success' && data.average_temperature !== undefined) {
      // Update the temperature slider and input
      const avgTemp = Math.round(data.average_temperature);
      
      if (tempSlider) {
        tempSlider.value = avgTemp;
        
        // Update tooltip
        const tempTooltip = document.getElementById('tempTooltip');
        if (tempTooltip) {
          const min = tempSlider.min;
          const max = tempSlider.max;
          const percent = ((avgTemp - min) / (max - min)) * 100;
          tempTooltip.textContent = avgTemp + '°C';
          tempTooltip.style.left = percent + '%';
        }
      }
      
      if (routeTemperatureInput) {
        routeTemperatureInput.value = avgTemp;
      }
      
      // Show success message
      if (resultDiv) {
        resultDiv.innerHTML = `
          <small class="text-success">
            <i class="fas fa-check-circle"></i>
            Temperature set to ${avgTemp}°C based on route analysis
          </small>
        `;
        resultDiv.style.display = 'block';
      }
      
    } else {
      // Show error message
      if (resultDiv) {
        resultDiv.innerHTML = `
          <small class="text-warning">
            <i class="fas fa-exclamation-triangle"></i>
            ${data.message || 'Could not calculate route temperature. Using default value.'}
          </small>
        `;
        resultDiv.style.display = 'block';
      }
    }
  })
  .catch(error => {
    console.error('Error calculating route temperature:', error);
    
    // Hide loading status
    if (statusDiv) {
      statusDiv.style.display = 'none';
    }
    
    // Show error message
    if (resultDiv) {
      resultDiv.innerHTML = `
        <small class="text-danger">
          <i class="fas fa-times-circle"></i>
          Error connecting to route service. Using manual temperature setting.
        </small>
      `;
      resultDiv.style.display = 'block';
    }
  });
}

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
