import os
import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    if 'file' not in request.FILES:
        return Response({'error': 'Bad Request', 'message': 'No file uploaded. Use field name "file".'}, status=400)

    file = request.FILES['file']
    allowed_types = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if file.content_type not in allowed_types:
        return Response({'error': 'Bad Request', 'message': 'Unsupported file type. Allowed: images, PDF, DOC/DOCX.'}, status=400)

    max_size = 10 * 1024 * 1024
    if file.size > max_size:
        return Response({'error': 'Bad Request', 'message': 'File size must be under 10MB.'}, status=400)

    ext = os.path.splitext(file.name)[1].lower()
    unique_name = f'{uuid.uuid4().hex}{ext}'

    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, unique_name)
    with open(file_path, 'wb+') as dest:
        for chunk in file.chunks():
            dest.write(chunk)

    file_url = f'{settings.MEDIA_URL}uploads/{unique_name}'
    return Response({
        'url': file_url,
        'name': file.name,
        'size': file.size,
        'type': file.content_type,
    }, status=201)
