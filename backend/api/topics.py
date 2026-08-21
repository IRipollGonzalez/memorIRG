from __future__ import annotations

from fastapi import APIRouter

from backend.schemas.topics import CategorySubcategoryPair, TopicDetail, TopicSummary
from backend.services import topic_service

router = APIRouter()


@router.get("", response_model=list[TopicSummary])
def list_topics() -> list[TopicSummary]:
    return [TopicSummary(name=name, label=label) for name, label in topic_service.list_topic_names()]


@router.get("/{name}", response_model=TopicDetail)
def get_topic(name: str) -> TopicDetail:
    topic = topic_service.get_topic(name)
    return TopicDetail(
        name=topic.name,
        label=topic.label,
        content_labels=topic.content_labels,
        category_subcategory_pairs=[
            CategorySubcategoryPair(category=category, subcategory=subcategory)
            for category, subcategory in topic.category_subcategory_pairs
        ],
        total_cards=len(topic.cards),
    )
