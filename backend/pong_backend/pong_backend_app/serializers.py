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
    match = MatchSerializer(read_only=True)
    placement = serializers.SerializerMethodField()
    num_players = serializers.SerializerMethodField()

    class Meta:
        model = PlayerMatchRelation
        fields = ['match', 'timeAlive', 'placement', 'num_players']

    def get_placement(self, obj):
        all_players = PlayerMatchRelation.objects.filter(match=obj.match).order_by('-timeAlive')
        placement = list(all_players).index(obj) + 1
        return self.number_to_ordinal(placement)

    def get_num_players(self, obj):
        return PlayerMatchRelation.objects.filter(match=obj.match).count()

    @staticmethod
    def number_to_ordinal(n):
        """
        Helper function to convert a number to an ordinal string.
        :param n:
        :return: string
        """
        if 10 <= n % 100 < 20:
            return str(n) + 'th'
        else:
            return str(n) + {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, "th")


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)