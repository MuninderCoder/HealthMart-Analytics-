from fastapi import APIRouter, UploadFile, File, HTTPException, status, Header, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from backend.app.schemas.dataset import DatasetSummaryResponse, DatasetFullDetailResponse
from backend.app.schemas.mining import MineRequest, MineResponse
from backend.app.services.dataset_service import DatasetService
from backend.app.services.mining_service import MiningService
from backend.app.services.user_service import UserService
from backend.app.utils.auth import create_token, verify_token

router = APIRouter()

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

# Authentication Schema models
class UserLogin(BaseModel):
    username: str
    password: str

class UserSignup(BaseModel):
    username: str
    password: str
    role: str = "viewer"  # Default role for new signups

# Dependency to check JWT and extract user
def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid token. Please log in."
        )
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid. Please log in again."
        )
    return payload

# Dependency to restrict based on roles
def require_roles(allowed_roles: List[str]):
    def dependency(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action."
            )
        return user
    return dependency

# --- 1. Authentication Endpoints ---

@router.post("/auth/login")
def login(req: UserLogin):
    user = UserService.authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    token = create_token(user["username"], user["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user["username"],
        "role": user["role"]
    }

@router.post("/auth/signup")
def signup(req: UserSignup):
    if req.role not in ["admin", "analyst", "viewer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin', 'analyst', or 'viewer'."
        )
    success = UserService.create_user(req.username, req.password, req.role)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists."
        )
    return {"message": "User registered successfully."}

@router.get("/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return user

# --- 2. User Management Endpoints (Admin only) ---

@router.get("/users")
def get_users(user: dict = Depends(require_roles(["admin"]))):
    return UserService.get_all_users()

# --- 3. Datasets Endpoints ---

@router.post("/upload", response_model=DatasetSummaryResponse, tags=["Datasets"])
async def upload_dataset(
    file: UploadFile = File(...),
    user: dict = Depends(require_roles(["admin", "analyst"]))
):
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
def get_datasets_list(user: dict = Depends(get_current_user)):
    try:
        return DatasetService.get_all_datasets()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve datasets: {str(e)}"
        )

@router.get("/dataset/{id}", response_model=DatasetFullDetailResponse, tags=["Datasets"])
def get_dataset_details(id: str, user: dict = Depends(get_current_user)):
    detail = DatasetService.get_dataset(id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID {id} not found."
        )
    return detail

@router.delete("/dataset/{id}", tags=["Datasets"])
def delete_dataset(id: str, user: dict = Depends(require_roles(["admin"]))):
    success = DatasetService.delete_dataset(id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID {id} not found."
        )
    return {"message": f"Dataset {id} deleted successfully."}

# --- 4. Pattern Mining Endpoints ---

@router.post("/mine", response_model=MineResponse, tags=["Mining"])
def mine_dataset(req: MineRequest, user: dict = Depends(require_roles(["admin", "analyst"]))):
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
