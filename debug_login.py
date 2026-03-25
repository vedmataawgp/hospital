import os
import django
import sys

# Setup settings
sys.path.append(r'e:\Divy\Projects\GitHub\hospital\artifacts\api-server')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate
from apps.accounts.serializers import LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import User

def debug_login():
    email = 'dr.smith@medicare.com'
    password = 'Doctor@1234'
    
    print(f"DEBUG: Attempting login for {email}")
    
    # 1. Check user exists
    user = User.objects.filter(email=email).first()
    if not user:
        print("DEBUG: User NOT found in database")
        return
    print(f"DEBUG: User found: {user.name}")
    
    # 2. Try authenticate
    try:
        auth_user = authenticate(username=email, password=password)
        print(f"DEBUG: Authenticate result: {auth_user}")
    except Exception as e:
        print(f"DEBUG: Authenticate FAILED with exception: {e}")
        import traceback
        traceback.print_exc()

    # 3. Try Serializer
    try:
        serializer = LoginSerializer(data={'email': email, 'password': password})
        is_valid = serializer.is_valid()
        print(f"DEBUG: Serializer is_valid: {is_valid}")
        if not is_valid:
            print(f"DEBUG: Serializer errors: {serializer.errors}")
        else:
            u = serializer.validated_data['user']
            print(f"DEBUG: Validated user: {u.name}")
            
            # 4. Try Tokens
            refresh = RefreshToken.for_user(u)
            token = str(refresh.access_token)
            print(f"DEBUG: Token generated successfully")
            
    except Exception as e:
        print(f"DEBUG: Login flow FAILED with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_login()
