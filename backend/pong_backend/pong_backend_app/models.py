from django.db import models

# Create your models here.


class User(models.Model):
    userID = models.AutoField(primary_key=True)
    email = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    matches = models.ManyToManyField('Match', through='PlayerMatchRelation', related_name='players')

    def __str__(self):
        return self.username


class Match(models.Model):
    matchID = models.AutoField(primary_key=True)
    startTime = models.DateTimeField(null=True)
    endTime = models.DateTimeField(null=True)

    def __str__(self):
        return str(self.matchID)


class PlayerMatchRelation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    timeAlive = models.IntegerField(default=0, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['timeAlive'], name='timeAlive_idx')
        ]
        unique_together = ('user', 'match')





