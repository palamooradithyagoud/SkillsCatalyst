"""
Unit tests for AI Mentor model switching and multi-provider fallback.
Verifies NVIDIA Integrate API integration, model switching, and automatic fallback cascades.
"""

import pytest
from unittest.mock import patch, MagicMock
from backend.services.groq_service import chat_with_groq, is_nvidia_model
from backend.services.nvidia_service import chat_with_nvidia
from backend.services.groq_service import AIProviderUnavailableError


def test_is_nvidia_model_detection():
    assert is_nvidia_model("moonshotai/kimi-k3") is True
    assert is_nvidia_model("kimi-k3") is True
    assert is_nvidia_model("nvidia/nemotron-3-ultra-550b-a55b") is True
    assert is_nvidia_model("Nemotron Ultra") is True
    assert is_nvidia_model("nvidia/llama-3.1-nemotron-70b-instruct") is True
    assert is_nvidia_model("llama-3.3-70b-versatile") is False
    assert is_nvidia_model("openai/gpt-oss-120b") is False
    assert is_nvidia_model(None) is False


@patch("backend.services.nvidia_service.httpx.Client")
def test_chat_with_nvidia_success(mock_client_class):
    mock_client = MagicMock()
    mock_client_class.return_value.__enter__.return_value = mock_client

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [{"message": {"content": "Hello from Kimi K3 on NVIDIA!"}}]
    }
    mock_client.post.return_value = mock_response

    reply = chat_with_nvidia(prompt="Hello", model="moonshotai/kimi-k3", reasoning_effort="max")
    assert reply == "Hello from Kimi K3 on NVIDIA!"
    assert mock_client.post.called


@patch("backend.services.nvidia_service.chat_with_nvidia")
def test_switching_to_nvidia_direct_route(mock_nvidia):
    mock_nvidia.return_value = "Response from NVIDIA Moonshot Kimi K3"

    reply = chat_with_groq(prompt="Test prompt", model="moonshotai/kimi-k3", effort="max")
    assert reply == "Response from NVIDIA Moonshot Kimi K3"
    assert mock_nvidia.called


@patch("backend.services.nvidia_service.chat_with_nvidia")
@patch("backend.services.groq_service.groq_client")
def test_fallback_when_nvidia_fails(mock_groq, mock_nvidia):
    # Simulate NVIDIA failing with 410 EOL or timeout
    mock_nvidia.side_effect = AIProviderUnavailableError("NVIDIA model moonshotai/kimi-k3 reached EOL")

    mock_completion = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "Fallback response from Groq LLaMA"
    mock_completion.choices = [mock_choice]
    mock_groq.chat.completions.create.return_value = mock_completion

    reply = chat_with_groq(prompt="Test prompt", model="moonshotai/kimi-k3", effort="max")
    assert reply == "Fallback response from Groq LLaMA"
    assert mock_nvidia.called
    assert mock_groq.chat.completions.create.called
