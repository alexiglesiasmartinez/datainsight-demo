from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task, Stage
from .serializers import TaskSerializer, StageSerializer

@api_view(['GET', 'POST'])
def task_list(request):
    if request.method == 'GET':
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def stage_list(request):
    if request.method == 'GET':
        stages = Stage.objects.all()
        serializer = StageSerializer(stages, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = StageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
def stage_detail(request, pk):
    try:
        stage = Stage.objects.get(pk=pk)
    except Stage.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = StageSerializer(stage, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def stage_delete(request, pk):
    try:
        stage = Stage.objects.get(pk=pk)
    except Stage.DoesNotExist:
        return Response(
            {"detail": "Stage not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    if Task.objects.filter(stage=stage).exists():
        return Response(
            {"detail": "Cannot delete stage with tasks. Empty it first."},
            status=status.HTTP_400_BAD_REQUEST
        )
    stage.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)