"""Explicit first-time model download. Gameplay server itself stays offline."""
from pathlib import Path
from huggingface_hub import snapshot_download

root = Path(__file__).resolve().parent
snapshot_download('convaiinnovations/laya', local_dir=str(root/'models/laya'),
                  allow_patterns=['*.json','*.safetensors','*.txt','*.model'])
print('Checkpoint ready. Run server.py --model models/laya --device cuda')
