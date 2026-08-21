from rest_framework import permissions

class IsFarmer(permissions.BasePermission):
    """Allows access only to users with the 'farmer' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'farmer')

class IsBuyer(permissions.BasePermission):
    """Allows access only to users with the 'buyer' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'buyer')

class IsTransporter(permissions.BasePermission):
    """Allows access only to users with the 'transporter' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'transporter')

class IsListingOwner(permissions.BasePermission):
    """
    Object-level permission to only allow the farmer who created the listing to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the farmer who owns it
        return obj.farmer == request.user