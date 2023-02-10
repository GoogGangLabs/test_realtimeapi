from __future__ import print_function
import base64
import os
import hashlib

password = os.environ.get('RABBITMQ_PASSWORD')
salt = os.urandom(4)
salted_password = salt + password.encode('utf-8')
hashed_password = hashlib.sha256(salted_password).digest()
salted_hash = salt + hashed_password
base64_hash = base64.b64encode(salted_hash)

print(base64_hash.decode('utf-8'))
