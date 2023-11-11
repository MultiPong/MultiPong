import random
import string

from django.http import Http404
from django.shortcuts import render, get_object_or_404

# Create your views here.

from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Match, PlayerMatchRelation
from .serializers import UserSerializer, MatchSerializer, PlayerMatchRelationSerializer
from django.contrib.auth.hashers import make_password, check_password



@api_view(['POST'])
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            
            # Authenticate the user
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                # Log the user in
                login(request, user)
                
                return redirect('home')  # Redirect to the home page after login
    else:
        form = LoginForm()

    return render(request, 'react_login.js', {'form': form})

@api_view(['POST'])
def login(request):
    """
    Login with the given username and password.
    """
    # login logic
    pass


@api_view(['POST'])
def register_account(request):
    """
    Register a new account with the given email, username, and password.
    """
    # register account logic
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            
            # Create a new user
            user = User.objects.create_user(username=username, email=email, password=password)
            
            # Log the user in
            login(request, user)
            
            return redirect('home')  # Redirect to the home page after registration
    else:
        form = RegistrationForm()

    return render(request, 'react_login.js', {'form': form})
    # pass


@api_view(['PUT'])
def edit_account(request):
    """
    Edit the account with the given email, username, and password. Set parameter to null if you don't want to change it.
    """
    # edit account logic
    user = request.user
    # If using a profile model:
    # profile = UserProfile.objects.get(user=user)

    if request.method == 'POST':
        form = EditProfileForm(request.POST, instance=user)
        # If using a profile model:
        # form = EditProfileForm(request.POST, instance=profile)

        if form.is_valid():
            form.save()
            return redirect('view_profile')
    else:
        form = EditProfileForm(instance=user)
        # If using a profile model:
        # form = EditProfileForm(instance=profile)

    return render(request, 'react_edit_account.js', {'form': form})
    # pass


@api_view(['GET'])
def get_account_info(request):
    """
    Get the account info of the user with the given username.
    """
    # get account logic
    user = request.user
    # If using a profile model:
    # profile = UserProfile.objects.get(user=user)
    return render(request, 'react_user_profile.js', {'user': user})
    pass


class Http204:
    pass


@api_view(['GET'])
def user_match_history(request, user_id):
    """
    Get the match history of the user with the given userID.
    """
    # get match history logic
    try:
        user = User.objects.get(userID=user_id)
        match_history = user.matches.all()
        serializer = MatchSerializer(match_history, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def create_game_room(request):
    """
    Create a new game room ID and return it.
    """
    # create match logic
    game_room_id = ''.join(random.choices(string.ascii_uppercase, k=6))
    return Response({'game_room_id': game_room_id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def match_stats(request):
    """
    Get the match stats of the match with the given matchID.
    """
    # get match stats logic
    pass


@api_view(['POST'])
def save_match_stats(request):
    """
    Add a match stats entry to the database.
    """
    # save match stats logic
    pass

