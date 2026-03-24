from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Billing
from .serializers import BillingSerializer
from apps.patients.models import Patient
from apps.notifications.models import Notification
from core.pagination import StandardResultsSetPagination
from core.permissions import IsAdmin, IsAdminOrDoctor


def _billing_qs_for_user(request):
    """Scope billing records to the requesting user's role."""
    role = request.user.role
    qs = Billing.objects.select_related('patient__user', 'appointment')

    if role == 'admin':
        pass
    elif role == 'doctor':
        qs = qs.none()
    elif role == 'patient':
        try:
            patient = Patient.objects.get(user=request.user)
            qs = qs.filter(patient=patient)
        except Patient.DoesNotExist:
            return qs.none()
    else:
        return qs.none()

    status = request.query_params.get('status')
    patient_id = request.query_params.get('patientId')
    if status:
        qs = qs.filter(status=status)
    if patient_id and role == 'admin':
        qs = qs.filter(patient_id=patient_id)
    return qs


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def billing_list(request):
    if request.method == 'GET':
        qs = _billing_qs_for_user(request)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(BillingSerializer(page, many=True).data)

    if request.user.role != 'admin':
        return Response({'error': 'Forbidden', 'message': 'Only admins can create billing records.'}, status=403)

    data = request.data
    patient_id = data.get('patientId')
    amount = data.get('amount')
    if not patient_id or not amount:
        return Response({'error': 'Bad Request', 'message': 'patientId and amount required'}, status=400)
    try:
        patient = Patient.objects.get(pk=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Patient not found'}, status=404)

    bill = Billing.objects.create(
        patient=patient,
        appointment_id=data.get('appointmentId'),
        amount=amount,
        description=data.get('description', ''),
    )
    Notification.objects.create(
        user=patient.user,
        message=f'New bill created for ${amount}. Status: Pending',
        type='billing',
    )
    return Response(BillingSerializer(bill).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_detail(request, pk):
    try:
        bill = Billing.objects.select_related('patient__user', 'appointment').get(pk=pk)
    except Billing.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Billing not found'}, status=404)

    role = request.user.role
    if role == 'admin':
        pass
    elif role == 'patient':
        try:
            patient = Patient.objects.get(user=request.user)
            if bill.patient != patient:
                return Response({'error': 'Forbidden', 'message': 'You can only view your own bills.'}, status=403)
        except Patient.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)
    else:
        return Response({'error': 'Forbidden'}, status=403)

    return Response(BillingSerializer(bill).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_billing(request, pk):
    try:
        bill = Billing.objects.select_related('patient__user').get(pk=pk)
    except Billing.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Billing not found'}, status=404)

    role = request.user.role
    if role == 'admin':
        pass
    elif role == 'patient':
        try:
            patient = Patient.objects.get(user=request.user)
            if bill.patient != patient:
                return Response({'error': 'Forbidden', 'message': 'You can only pay your own bills.'}, status=403)
        except Patient.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)
    else:
        return Response({'error': 'Forbidden', 'message': 'Only patients or admins can process payments.'}, status=403)

    if bill.status == 'paid':
        return Response({'error': 'Bad Request', 'message': 'This bill has already been paid.'}, status=400)

    payment_method = request.data.get('paymentMethod', 'cash')
    bill.status = 'paid'
    bill.payment_method = payment_method
    bill.paid_at = timezone.now()
    bill.save()
    Notification.objects.create(
        user=bill.patient.user,
        message=f'Payment of ${bill.amount} received via {payment_method}',
        type='billing',
    )
    return Response(BillingSerializer(bill).data)
