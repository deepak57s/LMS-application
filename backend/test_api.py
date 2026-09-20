
import asyncio
import uuid
import httpx
from main import app

async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n--- Starting Phase 1 API Verification Suite ---")

        # Health-check
        res = await client.get("/")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] 1. GET / -> API is live")

        # Signup
        test_email = f"learner_{uuid.uuid4().hex[:6]}@example.com"
        signup_payload = {
            "name": "Jane Learner",
            "email": test_email,
            "password": "SecurePassword123!"
        }
        res = await client.post("/api/auth/signup", json=signup_payload)
        assert res.status_code == 200, f"Signup failed: {res.text}"
        signup_data = res.json()
        assert "token" in signup_data
        assert signup_data["user"]["email"] == test_email
        assert "password" not in signup_data["user"]
        assert "hashed_password" not in signup_data["user"]
        token = signup_data["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[PASS] 2. POST /api/auth/signup -> User registered: {test_email}")

        # Duplicate-guard
        res = await client.post("/api/auth/signup", json=signup_payload)
        assert res.status_code == 400, "Duplicate signup did not return 400"
        print("[PASS] 3. Duplicate signup rejected with 400 Bad Request")

        # Login
        login_payload = {"email": test_email, "password": "SecurePassword123!"}
        res = await client.post("/api/auth/login", json=login_payload)
        assert res.status_code == 200, f"Login failed: {res.text}"
        login_data = res.json()
        assert "token" in login_data
        print("[PASS] 4. POST /api/auth/login -> JWT returned")

        # Profile
        res = await client.get("/api/auth/me", headers=headers)
        assert res.status_code == 200, f"Get me failed: {res.text}"
        me_data = res.json()
        assert me_data["email"] == test_email
        assert me_data["onboarding_completed"] is False
        print("[PASS] 5. GET /api/auth/me -> Validated JWT and user profile")

        # Catalog
        res = await client.get("/api/catalog", headers=headers)
        assert res.status_code == 200, f"Catalog failed: {res.text}"
        catalog = res.json()
        assert len(catalog) >= 2, "Expected at least 2 domains"
        assert len(catalog[0]["topics"]) >= 1, "Expected topics in domain"
        domain = catalog[0]
        topic = domain["topics"][0]
        print(f"[PASS] 6. GET /api/catalog -> Retrieved {len(catalog)} domains with topics")

        # Onboarding
        onboard_payload = {"domain_id": domain["id"], "topic_id": topic["id"]}
        res = await client.post("/api/onboarding", json=onboard_payload, headers=headers)
        assert res.status_code == 200, f"Onboarding failed: {res.text}"
        
        # Verify-flag
        res = await client.get("/api/auth/me", headers=headers)
        assert res.json()["onboarding_completed"] is True
        print("[PASS] 7. POST /api/onboarding -> Updated user preferences")

        # Start-exam
        exam_start_payload = {"topic_id": topic["id"]}
        res = await client.post("/api/exams/start", json=exam_start_payload, headers=headers)
        assert res.status_code == 200, f"Start exam failed: {res.text}"
        exam_data = res.json()
        session_id = exam_data["session_id"]
        questions = exam_data["questions"]
        assert len(questions) >= 5, f"Expected 5-10 questions, got {len(questions)}"

        # Security-validation
        for q in questions:
            assert "correct_option_index" not in q, "SECURITY FLAW: correct_option_index was leaked to client!"
            assert "options" in q and len(q["options"]) == 4
            assert "question_text" in q
        print(f"[PASS] 8. POST /api/exams/start -> Exam session created ({len(questions)} questions). Security confirmed: no answers in payload!")

        # Submit
        # Mock-answers
        answers = {q["id"]: 0 for q in questions}
        submit_payload = {"answers": answers}
        res = await client.post(f"/api/exams/{session_id}/submit", json=submit_payload, headers=headers)
        assert res.status_code == 200, f"Submit failed: {res.text}"
        submit_res = res.json()
        assert "score" in submit_res
        assert "percentage" in submit_res
        assert submit_res["total_questions"] == len(questions)
        print(f"[PASS] 9. POST /api/exams/{{id}}/submit -> Scored: {submit_res['score']}/{submit_res['total_questions']} ({submit_res['percentage']}%)")

        # Resubmit-guard
        res = await client.post(f"/api/exams/{session_id}/submit", json=submit_payload, headers=headers)
        assert res.status_code == 400, "Resubmission was not blocked with 400"
        print("[PASS] 10. Resubmission blocked successfully (400 Bad Request)")

        # Result
        res = await client.get(f"/api/exams/{session_id}/result", headers=headers)
        assert res.status_code == 200, f"Get result failed: {res.text}"
        result_data = res.json()
        assert result_data["score"] == submit_res["score"]
        assert result_data["percentage"] == submit_res["percentage"]
        print(f"[PASS] 11. GET /api/exams/{{id}}/result -> Verified final score: {result_data['score']}/{result_data['total_questions']}")

        print("\n[ALL TESTS PASSED] Phase 1 Backend is 100% verified and battle-tested!\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
