"""
AgriTech ML Service - Module Registry (Claw Code inspired)

Provides a centralized registry for ML models, predictors, and analyzers
following the architectural patterns from Claw Code.
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List, Callable, Any
from datetime import datetime
from enum import Enum
import logging
import os

logger = logging.getLogger(__name__)


class ModuleStatus(Enum):
    PLANNED = "planned"
    LOADING = "loading"
    READY = "ready"
    ERROR = "error"
    DISABLED = "disabled"


@dataclass(frozen=True)
class ModuleConfig:
    """Configuration for an ML module"""
    name: str
    category: str
    version: str = "1.0.0"
    description: str = ""
    required_env_vars: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    max_input_size: int = 1000000  # 1MB default
    timeout_seconds: int = 30
    cache_enabled: bool = True
    cache_ttl_seconds: int = 3600


@dataclass
class ModuleExecutionResult:
    """Result of module execution"""
    module_name: str
    status: str
    output: Dict[str, Any]
    duration_ms: float
    timestamp: datetime = field(default_factory=datetime.utcnow)
    error_message: Optional[str] = None
    usage: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self):
        return {
            'module_name': self.module_name,
            'status': self.status,
            'output': self.output,
            'duration_ms': self.duration_ms,
            'timestamp': self.timestamp.isoformat(),
            'error_message': self.error_message,
            'usage': self.usage
        }


class MLModule:
    """Base class for ML modules"""

    def __init__(self, config: ModuleConfig, executor: Callable):
        self.config = config
        self.executor = executor
        self.status = ModuleStatus.PLANNED
        self.created_at = datetime.utcnow()
        self.last_executed = None
        self.execution_count = 0
        self.error_count = 0
        self.total_duration_ms = 0
        self.cache = {}

    async def initialize(self):
        """Initialize the module (check dependencies, env vars, etc)"""
        try:
            self.status = ModuleStatus.LOADING
            # Validate environment variables
            for var in self.config.required_env_vars:
                if not os.__dict__.get(var):
                    raise ValueError(f"Missing required env var: {var}")
            self.status = ModuleStatus.READY
            logger.info(f"Module {self.config.name} initialized successfully")
        except Exception as e:
            self.status = ModuleStatus.ERROR
            logger.error(f"Failed to initialize module {self.config.name}: {e}")
            raise

    async def execute(self, input_data: Dict[str, Any]) -> ModuleExecutionResult:
        """Execute the module"""
        import time
        
        start_time = time.time()
        try:
            # Check input size
            input_str = str(input_data)
            if len(input_str) > self.config.max_input_size:
                raise ValueError(f"Input size exceeds limit: {len(input_str)} > {self.config.max_input_size}")

            # Check cache
            cache_key = str(sorted(input_data.items()))
            if self.config.cache_enabled and cache_key in self.cache:
                cached_result, cached_time = self.cache[cache_key]
                if time.time() - cached_time < self.config.cache_ttl_seconds:
                    return cached_result

            # Execute
            output = await self.executor(input_data)
            duration_ms = (time.time() - start_time) * 1000

            result = ModuleExecutionResult(
                module_name=self.config.name,
                status='success',
                output=output,
                duration_ms=duration_ms
            )

            # Cache result
            if self.config.cache_enabled:
                self.cache[cache_key] = (result, time.time())

            # Update stats
            self.execution_count += 1
            self.total_duration_ms += duration_ms
            self.last_executed = datetime.utcnow()

            return result

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            self.error_count += 1
            logger.error(f"Module {self.config.name} execution error: {e}")
            return ModuleExecutionResult(
                module_name=self.config.name,
                status='error',
                output={},
                duration_ms=duration_ms,
                error_message=str(e)
            )

    def get_stats(self) -> Dict[str, Any]:
        """Get module statistics"""
        return {
            'name': self.config.name,
            'status': self.status.value,
            'version': self.config.version,
            'execution_count': self.execution_count,
            'error_count': self.error_count,
            'avg_duration_ms': self.total_duration_ms / self.execution_count if self.execution_count > 0 else 0,
            'last_executed': self.last_executed.isoformat() if self.last_executed else None,
            'cache_size': len(self.cache)
        }

    def clear_cache(self):
        """Clear the module cache"""
        self.cache.clear()


class ModuleRegistry:
    """Central registry for ML modules"""

    def __init__(self):
        self.modules: Dict[str, MLModule] = {}
        self.modules_by_category: Dict[str, List[str]] = {}
        self.initialization_log = []

    def register(self, config: ModuleConfig, executor: Callable) -> MLModule:
        """Register an ML module"""
        if config.name in self.modules:
            raise ValueError(f"Module already registered: {config.name}")

        module = MLModule(config, executor)
        self.modules[config.name] = module

        # Index by category
        if config.category not in self.modules_by_category:
            self.modules_by_category[config.category] = []
        self.modules_by_category[config.category].append(config.name)

        logger.info(f"Registered module: {config.name} ({config.category})")
        return module

    def get(self, name: str) -> Optional[MLModule]:
        """Get module by name"""
        return self.modules.get(name)

    def get_by_category(self, category: str) -> List[MLModule]:
        """Get all modules in a category"""
        names = self.modules_by_category.get(category, [])
        return [self.modules[name] for name in names if name in self.modules]

    def get_all(self) -> List[MLModule]:
        """Get all modules"""
        return list(self.modules.values())

    async def initialize_all(self):
        """Initialize all registered modules"""
        logger.info("Initializing all ML modules...")
        for module in self.modules.values():
            try:
                await module.initialize()
                self.initialization_log.append({
                    'module': module.config.name,
                    'status': 'success',
                    'timestamp': datetime.utcnow().isoformat()
                })
            except Exception as e:
                self.initialization_log.append({
                    'module': module.config.name,
                    'status': 'error',
                    'error': str(e),
                    'timestamp': datetime.utcnow().isoformat()
                })

    async def execute_module(self, name: str, input_data: Dict[str, Any]) -> ModuleExecutionResult:
        """Execute a module"""
        module = self.get(name)
        if not module:
            return ModuleExecutionResult(
                module_name=name,
                status='error',
                output={},
                duration_ms=0,
                error_message=f"Module not found: {name}"
            )

        return await module.execute(input_data)

    def get_stats(self, category: str = None) -> Dict[str, Any]:
        """Get registry statistics"""
        modules = self.get_by_category(category) if category else self.get_all()
        
        stats = {
            'total_modules': len(modules),
            'ready_modules': sum(1 for m in modules if m.status == ModuleStatus.READY),
            'error_modules': sum(1 for m in modules if m.status == ModuleStatus.ERROR),
            'categories': len(self.modules_by_category),
            'total_executions': sum(m.execution_count for m in modules),
            'total_errors': sum(m.error_count for m in modules),
            'modules': [m.get_stats() for m in modules]
        }
        return stats

    def render_markdown(self) -> str:
        """Render registry as markdown"""
        lines = ['# ML Module Registry', '']

        for category in sorted(self.modules_by_category.keys()):
            lines.append(f'## {category.replace("-", " ").title()}')
            lines.append('')
            for module_name in self.modules_by_category[category]:
                module = self.modules[module_name]
                lines.append(f'- **{module.config.name}** ({module.status.value})')
                lines.append(f'  - {module.config.description}')
                lines.append(f'  - Version: {module.config.version}')
                lines.append(f'  - Executions: {module.execution_count}')
            lines.append('')

        return '\n'.join(lines)
