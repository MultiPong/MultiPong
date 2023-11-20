import logging

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import User, Match, PlayerMatchRelation
from .utils import number_to_ordinal

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('userID', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['matchID', 'startTime', 'endTime']


class PlayerMatchRelationSerializer(serializers.ModelSerializer):
    match = MatchSerializer(read_only=True)
    placement = serializers.SerializerMethodField()
    num_players = serializers.SerializerMethodField()

    class Meta:
        model = PlayerMatchRelation
        fields = ['match', 'timeAlive', 'placement', 'num_players']

    def get_placement(self, obj):
        all_players = PlayerMatchRelation.objects.filter(match=obj.match).order_by('-timeAlive')
        placement = list(all_players).index(obj) + 1
        return number_to_ordinal(placement)

    def get_num_players(self, obj):
        return PlayerMatchRelation.objects.filter(match=obj.match).count()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class EditProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email')

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class UserInfoSerializer(serializers.ModelSerializer):
    win_ratio = serializers.SerializerMethodField()
    last_win_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('username', 'email', 'win_ratio', 'last_win_date')

    def get_win_ratio(self, obj):
        total_matches = PlayerMatchRelation.objects.filter(user=obj).count()
        if total_matches == 0:
            return 0
        wins = 0
        for match in PlayerMatchRelation.objects.filter(user=obj):
            placement = self.get_placement(match)
            if placement == '1st':
                wins += 1

        return wins / total_matches

    def get_last_win_date(self, obj):
        for match in PlayerMatchRelation.objects.filter(user=obj):
            placement = self.get_placement(match)
            if placement == '1st':
                return match.match.endTime
        return None

    def get_placement(self, obj):
        all_relations = PlayerMatchRelation.objects.filter(match=obj.match).order_by('-timeAlive')
        placement = list(all_relations).index(obj) + 1
        return number_to_ordinal(placement)


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    placement = serializers.SerializerMethodField()

    class Meta:
        model = PlayerMatchRelation
        fields = ['username', 'timeAlive', 'placement']

    def get_placement(self, obj):
        all_relations = PlayerMatchRelation.objects.filter(match=obj.match).order_by('-timeAlive')
        placement = list(all_relations).index(obj) + 1
        return number_to_ordinal(placement)

    def get_username(self, obj):
        return obj.user.username if obj.user else "Guest"


class MatchDetailSerializer(serializers.ModelSerializer):
    leaderboard = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['matchID', 'startTime', 'endTime', 'leaderboard']

    def get_leaderboard(self, obj):
        match_relations = PlayerMatchRelation.objects.filter(match=obj).order_by('-timeAlive')
        return LeaderboardEntrySerializer(match_relations, many=True).data


class PlayerSubmissionSerializer(serializers.Serializer):
    auth_token = serializers.CharField(allow_null=True, required=False)
    time_alive = serializers.IntegerField()

    def validate_auth_token(self, value):
        if value and not Token.objects.filter(key=value).exists():
            raise serializers.ValidationError("Invalid auth token")
        return value

    def get_user(self):
        """
        Retrieve the user based on the auth token, or return None for guest users.
        """
        if self.validated_data['auth_token']:
            return Token.objects.get(key=self.validated_data['auth_token']).user
        return None


class MatchSubmissionSerializer(serializers.ModelSerializer):
    players = PlayerSubmissionSerializer(many=True)
    startTime = serializers.DateTimeField()

    class Meta:
        model = Match
        fields = ['startTime', 'players']

    def create(self, validated_data):
        players_data = validated_data.pop('players')
        match = Match.objects.create(**validated_data, endTime=timezone.now())

        for player_data in players_data:
            player_serializer = PlayerSubmissionSerializer(data=player_data)
            if player_serializer.is_valid():
                user = player_serializer.get_user()
                time_alive = player_data['time_alive']
                PlayerMatchRelation.objects.create(match=match, user=user, timeAlive=time_alive)

        return match
