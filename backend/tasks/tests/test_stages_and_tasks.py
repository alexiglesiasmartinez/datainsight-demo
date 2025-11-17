from rest_framework.test import APITestCase
from rest_framework import status
from tasks.models import Stage, Task

class StageAndTaskAPITests(APITestCase):
    def setUp(self):
        self.stage_todo = Stage.objects.create(name="To Do", order=0)
        self.stage_doing = Stage.objects.create(name="Doing", order=1)

    def test_01_create_stage_success(self):
        """Create a stage correctly"""
        response = self.client.post('/api/stages/', {'name': 'Done'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Stage.objects.count(), 3)
        self.assertEqual(Stage.objects.latest('id').name, 'Done')

    def test_02_prevent_duplicate_stage_names(self):
        """Does not allow duplicate stage names"""
        self.client.post('/api/stages/', {'name': 'Review'}, format='json')
        response = self.client.post('/api/stages/', {'name': 'Review'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already exists', response.data['name'][0].lower())

    def test_03_create_task_in_stage(self):
        """Create task in a stage"""
        response = self.client.post('/api/tasks/', {
            'title': 'Implementar login',
            'stage': self.stage_todo.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.first()
        self.assertEqual(task.title, 'Implementar login')
        self.assertEqual(task.stage, self.stage_todo)

    def test_04_move_task_between_stages(self):
        """Move task from one stage to another"""
        task = Task.objects.create(title="Test drag & drop", stage=self.stage_todo)
        response = self.client.put(f'/api/tasks/{task.id}/', {
            'title': 'Test drag & drop',
            'stage': self.stage_doing.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.stage.name, "Doing")

    def test_05_cannot_delete_stage_with_tasks(self):
        """Does not allow deleting stages with tasks"""
        Task.objects.create(title="Blocked task", stage=self.stage_todo)
        response = self.client.delete(f'/api/stages/{self.stage_todo.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Stage.objects.filter(id=self.stage_todo.id).exists())
        response = self.client.delete(f'/api/stages/{self.stage_doing.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Stage.objects.filter(id=self.stage_doing.id).exists())