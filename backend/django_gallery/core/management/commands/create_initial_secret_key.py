import os
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management.utils import get_random_secret_key


class Command(BaseCommand):
    '''Create Initial Secret Key.
        Command check if secret key existed in the env file.
        If it's not, then generated key will be written there.'''
    def handle(self, *args, **options):
        # Generate file if it doesn't exist
        path_to_dir_with_secret = Path(settings.BASE_DIR) / 'created_config'
        path_to_dir_with_secret.mkdir(parents=True, exist_ok=True)
        secret_file_name = 'secret.txt'
        secret_file_path = path_to_dir_with_secret / secret_file_name

        if not secret_file_path.exists():
            secret_file_path.touch(exist_ok=True)
            secret_key = get_random_secret_key()

            with open(secret_file_path, 'w') as secret_file:
                secret_file.write(f'SECRET_KEY={secret_key}')

            os.chmod(secret_file_path, 0o444)
            self.stdout.write(
                self.style.SUCCESS(
                    'SECRET_KEY: secret key was written in the created_config!'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    'SECRET_KEY: file with secret key is already created!'
                )
            )
