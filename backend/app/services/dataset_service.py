import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.app.utils.parser import parse_dataset_file, format_file_size

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))

def ensure_upload_dir():
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

class DatasetService:
    @staticmethod
    def save_dataset(file_content: bytes, filename: str) -> Dict[str, Any]:
        ensure_upload_dir()
        dataset_id = str(uuid.uuid4())
        ext = filename.split('.')[-1].lower()
        
        # Save raw file
        raw_file_name = f"{dataset_id}.{ext}"
        raw_file_path = os.path.join(UPLOAD_DIR, raw_file_name)
        with open(raw_file_path, "wb") as f:
            f.write(file_content)

        file_size_formatted = format_file_size(len(file_content))
        upload_time_str = datetime.now().isoformat()

        try:
            # Parse the saved raw file
            parsed_data = parse_dataset_file(raw_file_path, filename)
            
            # Combine parse output with core metadata
            metadata = {
                "id": dataset_id,
                "filename": filename,
                "fileType": "Excel (.xlsx)" if ext in ['xlsx', 'xls'] else "CSV",
                "fileSize": file_size_formatted,
                "uploadTime": upload_time_str,
                "rows": parsed_data["rowsCount"],
                "columns": len(parsed_data["columns"]),
                "colAnalysis": parsed_data["colAnalysis"],
                "health": parsed_data["health"],
                "qualityChecks": parsed_data["qualityChecks"],
                "suggestions": parsed_data["suggestions"],
                "transactions": parsed_data["transactions"],
                "analytics": parsed_data["analytics"],
                "previewData": parsed_data["previewData"]
            }

            # Save parsed metadata to JSON
            meta_file_path = os.path.join(UPLOAD_DIR, f"{dataset_id}.json")
            with open(meta_file_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)

            # Return list-level summary back to controller
            return {
                "id": dataset_id,
                "filename": filename,
                "fileType": metadata["fileType"],
                "fileSize": file_size_formatted,
                "uploadTime": upload_time_str,
                "rows": metadata["rows"],
                "columns": metadata["columns"]
            }
        except Exception as e:
            # Cleanup raw file if parsing fails
            if os.path.exists(raw_file_path):
                os.remove(raw_file_path)
            raise e

    @staticmethod
    def get_all_datasets() -> List[Dict[str, Any]]:
        ensure_upload_dir()
        datasets = []
        for file in os.listdir(UPLOAD_DIR):
            if file.endswith(".json"):
                path = os.path.join(UPLOAD_DIR, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        meta = json.load(f)
                        # Extract list-level attributes to save payload overhead
                        datasets.append({
                            "id": meta["id"],
                            "filename": meta["filename"],
                            "fileType": meta["fileType"],
                            "fileSize": meta["fileSize"],
                            "uploadTime": meta["uploadTime"],
                            "rows": meta["rows"],
                            "columns": meta["columns"]
                        })
                except Exception:
                    continue
        # Sort by upload time descending
        return sorted(datasets, key=lambda x: x["uploadTime"], reverse=True)

    @staticmethod
    def get_dataset(dataset_id: str) -> Optional[Dict[str, Any]]:
        ensure_upload_dir()
        meta_file_path = os.path.join(UPLOAD_DIR, f"{dataset_id}.json")
        if not os.path.exists(meta_file_path):
            return None
        try:
            with open(meta_file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None

    @staticmethod
    def delete_dataset(dataset_id: str) -> bool:
        ensure_upload_dir()
        deleted = False
        
        # Delete JSON metadata
        meta_file_path = os.path.join(UPLOAD_DIR, f"{dataset_id}.json")
        if os.path.exists(meta_file_path):
            try:
                os.remove(meta_file_path)
                deleted = True
            except Exception:
                pass

        # Scan for raw file (id.csv or id.xlsx or id.xls) and delete it
        for file in os.listdir(UPLOAD_DIR):
            if file.startswith(dataset_id) and not file.endswith(".json"):
                try:
                    os.remove(os.path.join(UPLOAD_DIR, file))
                    deleted = True
                except Exception:
                    pass

        return deleted
