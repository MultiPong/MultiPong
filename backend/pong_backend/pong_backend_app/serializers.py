from rest_framework import serializers
from .models import User, Match, PlayerMatchRelation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['userID', 'email', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['matchID', 'startTime', 'endTime']


class PlayerMatchRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerMatchRelation
        fields = '__all__'


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
