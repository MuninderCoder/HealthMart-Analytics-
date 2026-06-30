from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetSummaryResponse(BaseModel):
    id: str
    filename: str
    fileType: str
    fileSize: str
    uploadTime: str
    rows: int
    columns: int

class HealthDetail(BaseModel):
    label: str
    impact: str
    value: str
    severity: str

class HealthScore(BaseModel):
    score: int
    grade: str
    color: str
    desc: str
    details: List[HealthDetail]

class ColumnDetail(BaseModel):
    col: str
    type: str
    total: int
    nonEmpty: int
    missing: int
    missingPct: float
    unique: int
    uniqueRatio: float
    sampleValues: List[str]
    topValue: str
    avgLen: int

class QualityCheck(BaseModel):
    id: str
    label: str
    severity: str
    count: int
    message: str

class CleaningSuggestion(BaseModel):
    id: str
    priority: str
    title: str
    description: str

class TransactionStats(BaseModel):
    total: int
    avgItems: str
    maxItems: int
    minItems: int
    totalItems: int

class TransactionData(BaseModel):
    transactions: List[List[str]]
    txCols: List[str]
    stats: TransactionStats

class AnalyticsItem(BaseModel):
    name: str
    count: int
    pct: str

class AnalyticsCategory(BaseModel):
    col: Optional[str] = None
    items: List[AnalyticsItem]
    unique: int

class AnalyticsOverviewSchema(BaseModel):
    diseases: AnalyticsCategory
    medicines: AnalyticsCategory
    doctors: AnalyticsCategory
    departments: AnalyticsCategory
    symptoms: AnalyticsCategory
    genderDist: Optional[List[AnalyticsItem]] = None
    ageGroups: Optional[List[AnalyticsItem]] = None

class DatasetFullDetailResponse(BaseModel):
    id: str
    filename: str
    fileType: str
    fileSize: str
    uploadTime: str
    rows: int
    columns: int
    colAnalysis: List[ColumnDetail]
    health: HealthScore
    qualityChecks: List[QualityCheck]
    suggestions: List[CleaningSuggestion]
    transactions: TransactionData
    analytics: AnalyticsOverviewSchema
    previewData: List[Dict[str, Any]]
