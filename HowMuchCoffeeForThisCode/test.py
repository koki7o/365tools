#!/usr/bin/env python3
import asyncio
import functools
import itertools
from abc import ABC, abstractmethod
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple, Union

class MetaRegistry(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class AbstractDataProcessor(ABC):
    @abstractmethod
    async def process(self, data: Dict) -> Dict:
        pass

class ComplexDataProcessor(AbstractDataProcessor, metaclass=MetaRegistry):
    def __init__(self):
        self.cache = {}
        self.processing_queue = asyncio.Queue()
        self._processing = False
        self.processors = []
        self.result_callbacks = defaultdict(list)

    def register_processor(self, processor_func):
        @functools.wraps(processor_func)
        async def wrapper(*args, **kwargs):
            return await processor_func(*args, **kwargs)
        self.processors.append(wrapper)
        return wrapper

    async def process(self, data: Dict) -> Dict:
        if not self._processing:
            asyncio.create_task(self._process_queue())
            self._processing = True
        
        task_id = id(data)
        await self.processing_queue.put((task_id, data))
        return await self._wait_for_result(task_id)

    async def _process_queue(self):
        while True:
            try:
                task_id, data = await self.processing_queue.get()
                result = await self._apply_processors(data)
                self._notify_callbacks(task_id, result)
            except Exception as e:
                print(f"Error processing task {task_id}: {e}")
            finally:
                self.processing_queue.task_done()

    async def _apply_processors(self, data: Dict) -> Dict:
        result = data
        for processor in self.processors:
            try:
                result = await processor(result)
            except Exception as e:
                print(f"Processor {processor.__name__} failed: {e}")
        return result

    async def _wait_for_result(self, task_id: int) -> Dict:
        future = asyncio.Future()
        self.result_callbacks[task_id].append(future)
        return await future

    def _notify_callbacks(self, task_id: int, result: Dict):
        callbacks = self.result_callbacks.pop(task_id, [])
        for callback in callbacks:
            if not callback.done():
                callback.set_result(result)

class DataTransformer:
    def __init__(self, processor: ComplexDataProcessor):
        self.processor = processor
        self.transformation_cache = {}
        self._setup_transformations()

    def _setup_transformations(self):
        @self.processor.register_processor
        async def normalize_data(data: Dict) -> Dict:
            return {k: v * 2 if isinstance(v, (int, float)) else v 
                   for k, v in data.items()}

        @self.processor.register_processor
        async def enrich_data(data: Dict) -> Dict:
            for k, v in data.items():
                if k not in self.transformation_cache:
                    self.transformation_cache[k] = await self._compute_complex_transformation(v)
                data[k] = self.transformation_cache[k]
            return data

    async def _compute_complex_transformation(self, value: Union[int, float, str]) -> Union[int, float, str]:
        if isinstance(value, (int, float)):
            return sum(itertools.islice(itertools.count(value), 5))
        return value

async def main():
    processor = ComplexDataProcessor()
    transformer = DataTransformer(processor)
    
    test_data = {"a": 1, "b": 2, "c": "test"}
    print("Processing data:", test_data)
    
    result = await processor.process(test_data)
    print("Processed result:", result)

if __name__ == "__main__":
    asyncio.run(main())