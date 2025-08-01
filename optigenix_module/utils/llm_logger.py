"""
LLM Logger Module
Provides comprehensive logging for all LLM interactions, prompts, responses, and decisions.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import os

class LLMLogger:
    """Dedicated logger for LLM interactions and operations."""
    
    def __init__(self, log_file: str = "llm_interactions.log"):
        """Initialize the LLM logger with dedicated file handling."""
        self.log_file = log_file
        self.setup_logger()
    
    def setup_logger(self):
        """Setup dedicated logger for LLM operations."""
        self.logger = logging.getLogger('llm_operations')
        self.logger.setLevel(logging.INFO)
        
        # Remove existing handlers to avoid duplication
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Create file handler
        handler = logging.FileHandler(self.log_file, encoding='utf-8')
        handler.setLevel(logging.INFO)
        
        # Create detailed formatter
        formatter = logging.Formatter(
            '[%(asctime)s] [%(levelname)s] [LLM] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        
        self.logger.addHandler(handler)
    
    def log_prompt_sent(self, operation: str, prompt: str, context: Dict[str, Any] = None):
        """Log LLM prompt being sent."""
        context_info = f" | Context: {json.dumps(context, indent=2)}" if context else ""
        self.logger.info(f"PROMPT_SENT [{operation}] - {prompt[:200]}...{context_info}")
    
    def log_response_received(self, operation: str, response: str, tokens_used: Optional[int] = None):
        """Log LLM response received."""
        token_info = f" | Tokens: {tokens_used}" if tokens_used else ""
        self.logger.info(f"RESPONSE_RECEIVED [{operation}] - {response[:200]}...{token_info}")
    
    def log_mutation_strategy(self, generation: int, strategy: Dict[str, Any], explanation: str):
        """Log LLM-suggested mutation strategy."""
        self.logger.info(f"MUTATION_STRATEGY [Gen {generation}] - Strategy: {json.dumps(strategy, indent=2)} | Explanation: {explanation}")
    
    def log_fitness_weights(self, generation: int, weights: Dict[str, float], reasoning: str):
        """Log LLM-suggested fitness weights."""
        self.logger.info(f"FITNESS_WEIGHTS [Gen {generation}] - Weights: {json.dumps(weights, indent=2)} | Reasoning: {reasoning}")
    
    def log_decision(self, operation: str, decision: str, reasoning: str, metrics: Dict[str, Any] = None):
        """Log LLM decision with reasoning."""
        metrics_info = f" | Metrics: {json.dumps(metrics)}" if metrics else ""
        self.logger.info(f"DECISION [{operation}] - {decision} | Reasoning: {reasoning}{metrics_info}")
    
    def log_error(self, operation: str, error: str, context: Dict[str, Any] = None):
        """Log LLM operation errors."""
        context_info = f" | Context: {json.dumps(context)}" if context else ""
        self.logger.error(f"ERROR [{operation}] - {error}{context_info}")
    
    def log_performance_impact(self, operation: str, before_metrics: Dict[str, Any], after_metrics: Dict[str, Any]):
        """Log performance impact of LLM decisions."""
        improvement = {}
        for key in before_metrics:
            if key in after_metrics and isinstance(before_metrics[key], (int, float)):
                improvement[key] = after_metrics[key] - before_metrics[key]
        
        self.logger.info(f"PERFORMANCE_IMPACT [{operation}] - Before: {json.dumps(before_metrics)} | After: {json.dumps(after_metrics)} | Change: {json.dumps(improvement)}")

# Global LLM logger instance
llm_logger = LLMLogger()

def log_llm_prompt(operation: str, prompt: str, context: Dict[str, Any] = None):
    """Convenience function to log LLM prompts."""
    llm_logger.log_prompt_sent(operation, prompt, context)

def log_llm_response(operation: str, response: str, tokens_used: Optional[int] = None):
    """Convenience function to log LLM responses."""
    llm_logger.log_response_received(operation, response, tokens_used)

def log_llm_mutation_strategy(generation: int, strategy: Dict[str, Any], explanation: str):
    """Convenience function to log mutation strategies."""
    llm_logger.log_mutation_strategy(generation, strategy, explanation)

def log_llm_fitness_weights(generation: int, weights: Dict[str, float], reasoning: str):
    """Convenience function to log fitness weights."""
    llm_logger.log_fitness_weights(generation, weights, reasoning)

def log_llm_decision(operation: str, decision: str, reasoning: str, metrics: Dict[str, Any] = None):
    """Convenience function to log LLM decisions."""
    llm_logger.log_decision(operation, decision, reasoning, metrics)

def log_llm_error(operation: str, error: str, context: Dict[str, Any] = None):
    """Convenience function to log LLM errors."""
    llm_logger.log_error(operation, error, context)

def log_llm_performance_impact(operation: str, before_metrics: Dict[str, Any], after_metrics: Dict[str, Any]):
    """Convenience function to log performance impact."""
    llm_logger.log_performance_impact(operation, before_metrics, after_metrics)
