from pathlib import Path

from django.conf import settings


def get_generated_secret_key():
    file_path = Path(settings.BASE_DIR) / 'created_config' / 'secret.txt'
    if not file_path.exists():
        raise FileNotFoundError(f"The file at {file_path} does not exist.")

    with open(file_path, 'r') as file:
        for line in file:
            # Strip whitespace and check for SECRET_KEY
            line = line.strip()
            if line.startswith('SECRET_KEY='):
                # Split the line to get the value
                secret_key = (
                    line.split('=', 1)[1].strip().strip('"').strip("'")
                )
                return secret_key

    # If SECRET_KEY is not found, return None
    return None
