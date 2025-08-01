"""
Test script to verify LLM logging functionality
"""

import sys
import os

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from optigenix_module.utils.llm_logger import (
    log_llm_prompt, log_llm_response, log_llm_mutation_strategy, 
    log_llm_fitness_weights, log_llm_decision, log_llm_error, 
    log_llm_performance_impact
)

def test_llm_logging():
    """Test all LLM logging functions"""
    print("Testing LLM logging system...")
    
    # Test prompt logging
    log_llm_prompt("test_operation", "This is a test prompt for the LLM", 
                  {"generation": 1, "stagnation": 0})
    
    # Test response logging
    log_llm_response("test_operation", '{"test": "response", "value": 0.5}', tokens_used=50)
    
    # Test mutation strategy logging
    strategy = {
        "mutation_rate_modifier": 0.1,
        "operation_focus": "balanced"
    }
    log_llm_mutation_strategy(1, strategy, "Test mutation strategy for balanced exploration")
    
    # Test fitness weights logging
    weights = {
        "volume_utilization_weight": 0.5,
        "stability_score_weight": 0.2,
        "contact_ratio_weight": 0.15,
        "weight_balance_weight": 0.1,
        "items_packed_ratio_weight": 0.05
    }
    log_llm_fitness_weights(1, weights, "Test fitness weights for volume optimization")
    
    # Test decision logging
    log_llm_decision("test_decision", "Use aggressive mutation strategy", 
                    "High stagnation detected requiring disruption", 
                    {"stagnation_counter": 8, "fitness_variance": 0.001})
    
    # Test error logging
    log_llm_error("test_error", "JSON parsing failed", 
                 {"response": "invalid json", "operation": "test"})
    
    # Test performance impact logging
    before_metrics = {"avg_fitness": 0.6, "best_fitness": 0.8}
    after_metrics = {"avg_fitness": 0.7, "best_fitness": 0.85}
    log_llm_performance_impact("test_impact", before_metrics, after_metrics)
    
    print("LLM logging test completed! Check llm_interactions.log for the logged entries.")

if __name__ == "__main__":
    test_llm_logging()
