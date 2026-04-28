from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        branch = None
        branch_id = None
        try:
            profile = user.cashier_profile
            if profile.branch:
                branch = profile.branch.name
                branch_id = profile.branch.id
        except Exception:
            pass

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'role': 'admin' if user.is_staff or user.is_superuser else 'cashier',
            'branch': branch,
            'branch_id': branch_id,
        })
