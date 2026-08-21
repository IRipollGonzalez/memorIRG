from __future__ import annotations


class TopicNotFoundError(Exception):
    pass


class InvalidTopicDataError(Exception):
    pass


class NoCardsMatchFilterError(Exception):
    pass


class SessionNotFoundError(Exception):
    pass


class InvalidSideSelectionError(Exception):
    pass
