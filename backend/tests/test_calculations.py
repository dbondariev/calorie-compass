VALID_REQUEST = {
    "age": 30,
    "sex": "male",
    "heightCm": 180,
    "weightKg": 80,
    "activityLevel": "moderate",
    "goal": "maintain",
}


def test_create_calculation(client):
    response = client.post("/api/v1/calculations", json=VALID_REQUEST)
    assert response.status_code == 201
    result = response.get_json()
    assert result["bmi"] == 24.7
    assert result["bmr"] == 1780
    assert result["targetCalories"] == 2759
    assert sum(result["macros"].values()) > 0


def test_rejects_invalid_age(client):
    response = client.post("/api/v1/calculations", json={**VALID_REQUEST, "age": 10})
    assert response.status_code == 400
    assert response.get_json()["error"] == "validation_error"
    assert response.get_json()["message"]


def test_rejects_malformed_json_with_json_error(client):
    response = client.post(
        "/api/v1/calculations",
        data='{"age":',
        content_type="application/json",
    )
    assert response.status_code == 400
    assert response.is_json
    assert response.get_json()["error"] == "bad_request"


def test_rejects_non_json_content(client):
    response = client.post("/api/v1/calculations", data="age=30")
    assert response.status_code == 415
    assert response.get_json()["error"] == "unsupported_media_type"


def test_lists_and_deletes_history(client):
    created = client.post("/api/v1/calculations", json=VALID_REQUEST).get_json()
    history = client.get("/api/v1/calculations").get_json()
    assert len(history["items"]) == 1
    assert history["items"][0]["inputs"]["heightCm"] == 180
    assert client.delete(f"/api/v1/calculations/{created['id']}").status_code == 204
    assert client.get("/api/v1/calculations").get_json()["items"] == []


def test_returns_safe_json_for_unexpected_errors(client, monkeypatch):
    from app import routes

    def fail(_data):
        raise RuntimeError("sensitive implementation detail")

    monkeypatch.setattr(routes.calculator, "calculate", fail)
    response = client.post("/api/v1/calculations", json=VALID_REQUEST)
    assert response.status_code == 500
    assert response.is_json
    assert response.get_json() == {
        "error": "internal_server_error",
        "message": "An unexpected error occurred.",
    }
    assert "sensitive" not in response.get_data(as_text=True)
