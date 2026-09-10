from django.contrib.auth import get_user_model
from django.test import TestCase

from cases.models import Case, Task
from outcomes.models import Approval

User = get_user_model()


class ApprovalAuthorizationTests(TestCase):
    """Ownership boundary tests for the approve/reject approval endpoints."""

    def setUp(self):
        self.owner = User.objects.create_user(username="owner@example.test", email="owner@example.test", password="owner-pass-123")
        self.other = User.objects.create_user(username="other@example.test", email="other@example.test", password="other-pass-123")

        self.case = Case.objects.create(owner=self.owner, title="Owner's case", problem_statement="...")
        self.task = Task.objects.create(case=self.case, title="Task requiring approval", requires_approval=True)
        self.approval = Approval.objects.create(case=self.case, task=self.task, title="Approve the task")

        self.other_case = Case.objects.create(owner=self.other, title="Other user's case", problem_statement="...")

    def _approve_url(self, case_id, approval_id):
        return f"/api/v1/cases/{case_id}/approvals/{approval_id}/approve"

    def _reject_url(self, case_id, approval_id):
        return f"/api/v1/cases/{case_id}/approvals/{approval_id}/reject"

    def test_a_owner_can_approve_own_approval(self):
        self.client.force_login(self.owner)
        response = self.client.post(self._approve_url(self.case.id, self.approval.id))
        self.assertEqual(response.status_code, 200)
        self.approval.refresh_from_db()
        self.assertEqual(self.approval.status, Approval.Status.APPROVED)

    def test_b_owner_can_reject_own_approval(self):
        self.client.force_login(self.owner)
        response = self.client.post(self._reject_url(self.case.id, self.approval.id))
        self.assertEqual(response.status_code, 200)
        self.approval.refresh_from_db()
        self.assertEqual(self.approval.status, Approval.Status.REJECTED)

    def test_c_other_user_cannot_approve_foreign_approval(self):
        self.client.force_login(self.other)
        response = self.client.post(self._approve_url(self.case.id, self.approval.id))
        self.assertEqual(response.status_code, 404)
        self.approval.refresh_from_db()
        self.assertEqual(self.approval.status, Approval.Status.PENDING)

    def test_d_other_user_cannot_reject_foreign_approval(self):
        self.client.force_login(self.other)
        response = self.client.post(self._reject_url(self.case.id, self.approval.id))
        self.assertEqual(response.status_code, 404)
        self.approval.refresh_from_db()
        self.assertEqual(self.approval.status, Approval.Status.PENDING)

    def test_e_wrong_case_id_with_valid_approval_id_cannot_bypass_ownership(self):
        self.client.force_login(self.other)
        response = self.client.post(self._approve_url(self.other_case.id, self.approval.id))
        self.assertEqual(response.status_code, 404)
        self.approval.refresh_from_db()
        self.assertEqual(self.approval.status, Approval.Status.PENDING)

    def test_f_nonexistent_approval_returns_not_found(self):
        self.client.force_login(self.owner)
        response = self.client.post(self._approve_url(self.case.id, 999999))
        self.assertEqual(response.status_code, 404)
