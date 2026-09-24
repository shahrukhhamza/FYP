from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base — every model inherits from this, and Alembic's
    env.py points at Base.metadata to autogenerate migrations."""
