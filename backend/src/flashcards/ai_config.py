from google.genai import types

from src.ai_models.gemini.config import create_content_config
from src.core.config import settings


def card_response_schema(schema_type):
    return schema_type.Schema(
        type=schema_type.Type.OBJECT,
        required=["front", "back"],
        properties={
            "front": schema_type.Schema(
                type=schema_type.Type.STRING,
            ),
            "back": schema_type.Schema(
                type=schema_type.Type.STRING,
            ),
        },
    )


def collection_response_schema(schema_type):
    return schema_type.Schema(
        type=schema_type.Type.OBJECT,
        required=["collection"],
        properties={
            "collection": schema_type.Schema(
                type=schema_type.Type.OBJECT,
                required=["name", "cards"],
                properties={
                    "name": schema_type.Schema(
                        type=schema_type.Type.STRING,
                    ),
                    "cards": schema_type.Schema(
                        type=schema_type.Type.ARRAY,
                        items=card_response_schema(schema_type),
                    ),
                },
            ),
        },
    )


def get_flashcard_config(schema_type) -> types.GenerateContentConfig:
    return create_content_config(
        response_schema=collection_response_schema(schema_type),
        system_instruction=settings.COLLECTION_GENERATION_PROMPT,
    )


def get_card_config(schema_type) -> types.GenerateContentConfig:
    return create_content_config(
        response_schema=card_response_schema(schema_type),
        system_instruction=settings.CARD_GENERATION_PROMPT,
    )
