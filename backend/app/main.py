import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router as api_router
from backend.app.services.user_service import UserService

app = FastAPI(
    title="HealthMart Analytics API",
    description="Backend services for parsing and diagnosing healthcare datasets, ready for DiffNodeset pattern mining.",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    UserService.initialize()

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"Internal server error: {str(exc)}"
        }
    )

# Include Router
app.include_router(api_router, prefix="/api")

# Root redirect / health route
@app.get("/")
def read_root():
    return {"status": "online", "message": "Welcome to HealthMart Analytics REST API"}

@app.get("/health")
def root_health():
    return {
        "status": "healthy",
        "service": "HealthMart Analytics Backend",
        "engine": "Ready for DiffNodeset"
    }

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
