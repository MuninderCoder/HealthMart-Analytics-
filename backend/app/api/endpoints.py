from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List, Dict, Any
from backend.app.schemas.dataset import DatasetSummaryResponse, DatasetFullDetailResponse
from backend.app.schemas.mining import MineRequest, MineResponse
from backend.app.services.dataset_service import DatasetService
from backend.app.services.mining_service import MiningService

router = APIRouter()

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

@router.get("/", tags=["Health"])
def root_health():
    return {"status": "online", "message": "Welcome to HealthMart Analytics REST API"}

@router.get("/health", tags=["Health"])
def detailed_health():
    return {
        "status": "healthy",
        "service": "HealthMart Analytics Backend",
        "engine": "Ready for DiffNodeset"
    }

@router.post("/upload", response_model=DatasetSummaryResponse, tags=["Datasets"])
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '.{ext}'. Please upload a CSV or Excel (.xlsx, .xls) file."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty."
            )
        
        summary = DatasetService.save_dataset(content, filename)
        return summary
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process dataset: {str(e)}"
        )

@router.get("/datasets", response_model=List[DatasetSummaryResponse], tags=["Datasets"])
def get_datasets_list():
    try:
        return DatasetService.get_all_datasets()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve datasets: {str(e)}"
        )

@router.get("/dataset/{id}", response_model=DatasetFullDetailResponse, tags=["Datasets"])
def get_dataset_details(id: str):
    detail = DatasetService.get_dataset(id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID {id} not found."
        )
    return detail

@router.delete("/dataset/{id}", tags=["Datasets"])
def delete_dataset(id: str):
    success = DatasetService.delete_dataset(id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID {id} not found."
        )
    return {"message": f"Dataset {id} deleted successfully."}

@router.post("/mine", response_model=MineResponse, tags=["Mining"])
def mine_dataset(req: MineRequest):
    try:
        res = MiningService.run_mining(req.dataset_id, req.minimumSupport, req.minimumConfidence)
        return MineResponse(
            status=res.get("status", "completed"),
            algorithm=res.get("algorithm", "DiffNodeset"),
            executionTime=res.get("executionTime", "0.0 ms"),
            memoryUsage=res.get("memoryUsage", "0.0 KB"),
            totalFrequentItemsets=res.get("totalFrequentItemsets", 0),
            totalRules=res.get("totalRules", 0),
            itemsets=res.get("itemsets", []),
            associationRules=res.get("associationRules", [])
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except FileNotFoundError as fnf_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(fnf_err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mining failed: {str(e)}"
        )

