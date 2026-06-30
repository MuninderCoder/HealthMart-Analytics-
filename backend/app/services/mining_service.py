import os
import json
import subprocess
from typing import Dict, Any
from backend.app.services.dataset_service import DatasetService, UPLOAD_DIR

class MiningService:
    @staticmethod
    def run_mining(dataset_id: str, min_support: float, min_confidence: float) -> Dict[str, Any]:
        # 1. Fetch dataset metadata
        dataset = DatasetService.get_dataset(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset with ID {dataset_id} not found.")

        # 2. Extract transactions
        tx_data = dataset.get("transactions", {})
        transactions = tx_data.get("transactions", [])
        if not transactions:
            raise ValueError("No transaction data found in the dataset to mine.")

        # 3. Write transactions to temp JSON file
        temp_json_path = os.path.join(UPLOAD_DIR, f"temp_{dataset_id}.json")
        with open(temp_json_path, "w", encoding="utf-8") as f:
            json.dump(transactions, f)

        # 4. Locate C++ mining engine executable
        # Workspace root is two levels up from backend/app/services
        workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        engine_path = os.path.join(workspace_root, "backend", "algorithm", "cpp", "mining_engine.exe")

        if not os.path.exists(engine_path):
            # Try without .exe extension (e.g. for Unix/macOS)
            engine_path_no_exe = os.path.join(workspace_root, "backend", "algorithm", "cpp", "mining_engine")
            if os.path.exists(engine_path_no_exe):
                engine_path = engine_path_no_exe
            else:
                # Cleanup and raise error
                if os.path.exists(temp_json_path):
                    os.remove(temp_json_path)
                raise FileNotFoundError(f"C++ mining engine executable not found at: {engine_path}")

        # 5. Execute C++ mining engine via subprocess
        try:
            cmd = [engine_path, temp_json_path, str(min_support), str(min_confidence)]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
            
            # 6. Parse JSON stdout
            stdout_output = result.stdout.strip()
            if not stdout_output:
                raise ValueError("C++ mining engine returned empty output.")
                
            parsed_result = json.loads(stdout_output)
            return parsed_result
            
        except subprocess.CalledProcessError as e:
            err_msg = e.stderr.strip() if e.stderr else str(e)
            raise RuntimeError(f"C++ mining engine execution failed: {err_msg}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse C++ mining engine output as JSON: {str(e)}\nOutput was: {result.stdout}")
        finally:
            # 7. Cleanup temp file
            if os.path.exists(temp_json_path):
                try:
                    os.remove(temp_json_path)
                except Exception:
                    pass
