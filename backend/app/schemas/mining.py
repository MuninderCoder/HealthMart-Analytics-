from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class MineRequest(BaseModel):
    dataset_id: str = Field(..., description="ID of the dataset to mine")
    minimumSupport: float = Field(default=0.20, ge=0.0, le=1.0, description="Minimum support percentage (0.0 to 1.0)")
    minimumConfidence: float = Field(default=0.70, ge=0.0, le=1.0, description="Minimum confidence percentage (0.0 to 1.0)")

class MineResponse(BaseModel):
    status: str = "completed"
    algorithm: str = "DiffNodeset"
    executionTime: str
    memoryUsage: str
    totalFrequentItemsets: int
    totalRules: int
    itemsets: List[Dict[str, Any]]
    associationRules: List[Dict[str, Any]]
