from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from core.pagination import StandardResultsSetPagination


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    qs = Notification.objects.filter(user=request.user)
    unread_count = qs.filter(status='unread').count()
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request)
    response = paginator.get_paginated_response(NotificationSerializer(page, many=True).data)
    response.data['unreadCount'] = unread_count
    return response


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Notification not found'}, status=404)
    notif.status = 'read'
    notif.save()
    return Response(NotificationSerializer(notif).data)
