from __future__ import annotations

import os
import asyncio
from typing import Optional

from google.cloud import aiplatform


class VertexClient:
    def __init__(self) -> None:
        self.project = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
        self.mock = os.getenv("MOCK_AI", "true").lower() == "true"
        self._initialized = False

    def _ensure_init(self) -> None:
        if self._initialized or self.mock:
            return
        if not self.project:
            # fallback to mock if not configured
            self.mock = True
            return
        aiplatform.init(project=self.project, location=self.location)
        self._initialized = True

    async def generate_text(self, prompt: str, model: Optional[str] = None) -> str:
        # Basic async wrapper to allow await in FastAPI routes
        if self.mock:
            return self._mock_response(prompt)

        self._ensure_init()
        # Use latest text model (Gemini via Vertex AI PaLM text or text-bison)
        model_name = model or "text-bison@002"

        def _call_vertex() -> str:
            try:
                text_model = aiplatform.TextGenerationModel.from_pretrained(model_name)
                resp = text_model.predict(prompt)
                return getattr(resp, "text", str(resp))
            except Exception as exc:  # noqa: BLE001
                # Fail safe to mock for prototype
                return f"[Mock due to error: {exc}]\n" + self._mock_response(prompt)

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _call_vertex)

    def _mock_response(self, prompt: str) -> str:
        if "Summarize this legal document" in prompt:
            return (
                "One-liner: This document outlines the agreement between parties for services rendered.\n"
                "- Parties agree on scope, payment, and timelines.\n"
                "- Liability is limited; confidentiality applies.\n"
                "- Termination and dispute resolution are specified."
            )
        if "Explain this clause" in prompt:
            return "🟡 Caution — Key obligations apply; ensure timelines and liability are acceptable."
        if "Given this excerpt" in prompt:
            return "The clause sets expectations and limits liability. Consult a lawyer for specifics."
        return "Prototype response."


